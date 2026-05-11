import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Plus, TrendingUp, Star, Calendar, List } from 'lucide-react'
import { getTrending, getPopular, getCurrentSeason } from '@/lib/anilist'
import { AnimeCard } from '@/components/AnimeCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { useListStore } from '@/store/listStore'
import { useT } from '@/hooks/useT'
import { useAnimeTitles } from '@/hooks/useAnimeTitle'
import type { Anime } from '@/types/anime'

function HeroBanner({ animes }: { animes: Anime[] }) {
  const [current, setCurrent] = useState(0)
  const { getEntry, addToList } = useListStore()
  const t = useT()
  const getTitle = useAnimeTitles(animes)

  useEffect(() => {
    if (!animes.length) return
    const timer = setInterval(() => setCurrent((c) => (c + 1) % animes.length), 6000)
    return () => clearInterval(timer)
  }, [animes.length])

  if (!animes.length) return null
  const anime = animes[current]
  const title = getTitle(anime)
  const inList = !!getEntry(anime.id)

  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={anime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={anime.bannerImage ?? anime.coverImage.extraLarge}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1a]/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end pb-16 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto left-0 right-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/80 text-white">
                {t.home.trendBadge} #{current + 1}
              </span>
              {anime.genres.slice(0, 2).map((g) => (
                <span key={g} className="text-xs px-2.5 py-1 rounded-full glass text-white/70">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3 drop-shadow-lg">
              {title}
            </h1>

            {anime.description && (
              <p className="text-white/70 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 max-w-lg">
                {anime.description.replace(/<[^>]+>/g, '')}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Link to={`/anime/${anime.id}`} className="btn-primary">
                <Play className="w-4 h-4 fill-white" />
                {t.detail.moreDetails}
              </Link>
              <button
                onClick={() => !inList && addToList(anime.id, 'planned')}
                className={`btn-ghost ${inList ? 'border-emerald-500/40 text-emerald-400' : ''}`}
              >
                <Plus className="w-4 h-4" />
                {inList ? t.detail.inList : t.detail.addToList}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute right-6 bottom-16 flex items-center gap-2">
        <button
          onClick={() => setCurrent((c) => (c - 1 + animes.length) % animes.length)}
          className="p-2 rounded-xl glass text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5">
          {animes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrent((c) => (c + 1) % animes.length)}
          className="p-2 rounded-xl glass text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function Section({
  title, icon, href, children,
}: {
  title: string
  icon: React.ReactNode
  href: string
  children: React.ReactNode
}) {
  const t = useT()
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="text-accent">{icon}</div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <Link to={href} className="text-sm text-white/50 hover:text-accent transition-colors font-medium">
          {t.home.watchAll} →
        </Link>
      </div>
      {children}
    </section>
  )
}

export default function Home() {
  const t = useT()

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => getTrending(1, 8),
  })

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular'],
    queryFn: () => getPopular(1, 8),
  })

  const { data: seasonData, isLoading: seasonLoading } = useQuery({
    queryKey: ['current-season'],
    queryFn: () => getCurrentSeason(1, 8),
  })

  const trending = trendingData?.Page.media ?? []
  const popular = popularData?.Page.media ?? []
  const seasonal = seasonData?.Page.media ?? []

  const entries = useListStore((s) => s.entries)
  const totalCount = Object.keys(entries).length

  const stats = [
    { label: t.status.watching,   status: 'watching',   color: 'text-blue-400',   bg: 'bg-blue-400/10' },
    { label: t.status.planned,    status: 'planned',    color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { label: t.status.completed,  status: 'completed',  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: t.status.dropped,    status: 'dropped',    color: 'text-red-400',    bg: 'bg-red-400/10' },
  ] as const

  return (
    <div>
      {trendingLoading ? (
        <div className="h-[70vh] min-h-[500px] bg-white/5 animate-pulse" />
      ) : (
        <HeroBanner animes={trending.slice(0, 6)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {totalCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {stats.map((s) => {
              const count = Object.values(entries).filter((e) => e.status === s.status).length
              return (
                <Link
                  key={s.status}
                  to={`/my-lists?tab=${s.status}`}
                  className={`glass rounded-2xl p-4 hover:border-white/20 transition-all card-hover ${s.bg}`}
                >
                  <p className={`text-2xl font-black ${s.color}`}>{count}</p>
                  <p className="text-xs text-white/50 mt-1">{s.label}</p>
                </Link>
              )
            })}
          </div>
        )}

        <Section title={t.home.trending} icon={<TrendingUp className="w-5 h-5" />} href="/catalog?sort=TRENDING_DESC">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : trending.slice(0, 6).map((anime, i) => <AnimeCard key={anime.id} anime={anime} index={i} />)}
          </div>
        </Section>

        <Section title={t.home.thisSeason} icon={<Calendar className="w-5 h-5" />} href="/catalog?season=current">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {seasonLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : seasonal.slice(0, 6).map((anime, i) => <AnimeCard key={anime.id} anime={anime} index={i} />)}
          </div>
        </Section>

        <Section title={t.home.mostPopular} icon={<Star className="w-5 h-5" />} href="/catalog?sort=POPULARITY_DESC">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popularLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : popular.slice(0, 6).map((anime, i) => <AnimeCard key={anime.id} anime={anime} index={i} />)}
          </div>
        </Section>

        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {[
            {
              to: '/catalog',
              icon: <List className="w-6 h-6" />,
              title: t.home.moreCatalog,
              desc: t.home.moreDesc,
              color: 'from-violet-600/20 to-purple-600/10',
            },
            {
              to: '/my-lists',
              icon: <Star className="w-6 h-6" />,
              title: t.home.moreLists,
              desc: t.home.moreListsDesc,
              color: 'from-accent/20 to-pink-600/10',
            },
            {
              to: '/recommendations',
              icon: <TrendingUp className="w-6 h-6" />,
              title: t.home.moreRecs,
              desc: t.home.moreRecsDesc,
              color: 'from-emerald-600/20 to-teal-600/10',
            },
          ].map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`glass rounded-2xl p-6 card-hover bg-gradient-to-br ${card.color} border border-white/5 hover:border-white/15 transition-all`}
            >
              <div className="text-white/70 mb-3">{card.icon}</div>
              <h3 className="font-bold text-white mb-1">{card.title}</h3>
              <p className="text-sm text-white/50">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
