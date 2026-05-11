import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from 'lucide-react'
import { searchAnime, GENRES, SEASONS, FORMATS } from '@/lib/anilist'
import { AnimeCard } from '@/components/AnimeCard'
import { SkeletonCard, SkeletonRow } from '@/components/ui/SkeletonCard'
import { useDebounce } from '@/hooks/useDebounce'
import { useIntersection } from '@/hooks/useIntersection'
import { useT } from '@/hooks/useT'
import type { SearchFilters } from '@/types/anime'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i)

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none glass rounded-xl px-3 py-2 pr-8 text-sm text-white/80 outline-none focus:border-accent/50 border border-white/10 transition-colors bg-transparent cursor-pointer"
      >
        <option value="" className="bg-dark-600">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-dark-600">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
    </div>
  )
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const t = useT()

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') ?? '',
    genres: [],
    year: null,
    season: null,
    format: null,
    status: null,
    sort: searchParams.get('sort') ?? 'POPULARITY_DESC',
  })

  const debouncedQuery = useDebounce(filters.query, 400)
  const { ref: loadMoreRef, isIntersecting } = useIntersection({ threshold: 0.1 })

  const queryKey = [
    'catalog', debouncedQuery, filters.genres, filters.year,
    filters.season, filters.format, filters.status, filters.sort,
  ]

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      searchAnime({ ...filters, query: debouncedQuery }, pageParam as number, 20),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.Page.pageInfo.hasNextPage ? last.Page.pageInfo.currentPage + 1 : undefined,
  })

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (filters.query) params.q = filters.query
    if (filters.sort !== 'POPULARITY_DESC') params.sort = filters.sort
    setSearchParams(params, { replace: true })
  }, [filters.query, filters.sort, setSearchParams])

  const allAnime = data?.pages.flatMap((p) => p.Page.media) ?? []
  const total = data?.pages[0]?.Page.pageInfo.total ?? 0

  const update = useCallback(<K extends keyof SearchFilters>(key: K, val: SearchFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: val }))
  }, [])

  const toggleGenre = useCallback((g: string) => {
    setFilters((f) => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g],
    }))
  }, [])

  const hasActiveFilters = filters.genres.length > 0 || !!filters.year || !!filters.season || !!filters.format || !!filters.status
  const activeFilterCount =
    filters.genres.length +
    (filters.year ? 1 : 0) +
    (filters.season ? 1 : 0) +
    (filters.format ? 1 : 0) +
    (filters.status ? 1 : 0)

  const sortOptions = [
    { value: 'POPULARITY_DESC', label: t.sort.POPULARITY_DESC },
    { value: 'SCORE_DESC',      label: t.sort.SCORE_DESC },
    { value: 'TRENDING_DESC',   label: t.sort.TRENDING_DESC },
    { value: 'FAVOURITES_DESC', label: t.sort.FAVOURITES_DESC },
    { value: 'START_DATE_DESC', label: t.sort.START_DATE_DESC },
    { value: 'EPISODES_DESC',   label: t.sort.EPISODES_DESC },
  ]

  const seasonOptions = SEASONS.map((s) => ({
    value: s,
    label: t.season[s as keyof typeof t.season] ?? s,
  }))

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">{t.catalog.title}</h1>
          {!isLoading && total > 0 && (
            <p className="text-white/40 text-sm">{t.catalog.found(total)}</p>
          )}
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={filters.query}
              onChange={(e) => update('query', e.target.value)}
              placeholder={t.catalog.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-accent/50 transition-colors"
            />
            {filters.query && (
              <button onClick={() => update('query', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <FilterSelect
            label={t.catalog.sort}
            value={filters.sort}
            onChange={(v) => update('sort', v)}
            options={sortOptions}
          />

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`btn-ghost gap-2 ${hasActiveFilters ? 'border-accent/40 text-accent' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t.catalog.filters}
            {activeFilterCount > 0 && (
              <span className="bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex rounded-xl overflow-hidden glass border border-white/10">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/40'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/40'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="glass rounded-2xl p-5 mb-4 overflow-hidden border border-white/10"
          >
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <FilterSelect
                label={t.catalog.year}
                value={filters.year?.toString() ?? ''}
                onChange={(v) => update('year', v ? Number(v) : null)}
                options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
              />
              <FilterSelect
                label={t.catalog.season}
                value={filters.season ?? ''}
                onChange={(v) => update('season', v || null)}
                options={seasonOptions}
              />
              <FilterSelect
                label={t.catalog.format}
                value={filters.format ?? ''}
                onChange={(v) => update('format', v || null)}
                options={FORMATS.map((f) => ({ value: f, label: f }))}
              />
            </div>

            <div className="mb-3">
              <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">{t.catalog.genres}</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filters.genres.includes(g)
                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                        : 'glass text-white/50 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => setFilters((f) => ({ ...f, genres: [], year: null, season: null, format: null, status: null }))}
                className="text-xs text-accent hover:underline mt-2"
              >
                {t.catalog.resetFilters}
              </button>
            )}
          </motion.div>
        )}

        {isLoading ? (
          view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )
        ) : allAnime.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">{t.catalog.noResults}</h3>
            <p className="text-white/40 text-sm">{t.catalog.noResultsHint}</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allAnime.map((anime, i) => <AnimeCard key={`${anime.id}-${i}`} anime={anime} index={i % 20} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {allAnime.map((anime, i) => <AnimeCard key={`${anime.id}-${i}`} anime={anime} index={i % 20} view="list" />)}
          </div>
        )}

        <div ref={loadMoreRef} className="flex justify-center mt-8 py-4">
          {isFetchingNextPage && (
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
