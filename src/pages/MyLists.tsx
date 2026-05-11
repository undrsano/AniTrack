import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Star } from 'lucide-react'
import { getAnimeById } from '@/lib/anilist'
import { useListStore } from '@/store/listStore'
import { useT } from '@/hooks/useT'
import { useAnimeTitle } from '@/hooks/useAnimeTitle'
import type { WatchStatus, ListEntry } from '@/types/anime'

function ListEntryCard({ entry, onRemove, onUpdateProgress, onUpdateScore }: {
  entry: ListEntry
  onRemove: () => void
  onUpdateProgress: (p: number) => void
  onUpdateScore: (s: number | null) => void
}) {
  const [showScore, setShowScore] = useState(false)

  const { data } = useQuery({
    queryKey: ['anime', entry.animeId],
    queryFn: () => getAnimeById(entry.animeId),
  })

  const anime = data?.Media
  const title = useAnimeTitle(anime ?? null)

  if (!anime) {
    return (
      <div className="flex gap-4 p-3 rounded-2xl glass animate-pulse">
        <div className="w-14 h-20 rounded-xl bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
    )
  }

  const maxEpisodes = anime.episodes ?? null
  const progress = entry.progress

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-3 p-3 rounded-2xl glass border border-white/5 hover:border-white/10 transition-colors group"
    >
      <Link to={`/anime/${anime.id}`} className="flex-shrink-0">
        <img
          src={anime.coverImage.medium}
          alt={title}
          className="w-14 h-20 rounded-xl object-cover"
          loading="lazy"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/anime/${anime.id}`}>
          <h3 className="font-semibold text-sm text-white/90 truncate hover:text-accent transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-xs text-white/40 mt-0.5">
          {anime.format} {anime.seasonYear ? `· ${anime.seasonYear}` : ''}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateProgress(Math.max(0, progress - 1))}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            −
          </button>
          <span className="text-xs text-white/60 min-w-[40px] text-center">
            {progress}/{maxEpisodes ?? '?'}
          </span>
          <button
            onClick={() => onUpdateProgress(progress + 1)}
            disabled={maxEpisodes !== null && progress >= maxEpisodes}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>

          {maxEpisodes && (
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden mx-1">
              <div
                className="h-full bg-accent/80 rounded-full transition-all"
                style={{ width: `${Math.min(100, (progress / maxEpisodes) * 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={() => setShowScore(!showScore)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-yellow-400 transition-colors"
          >
            <Star className="w-3 h-3" fill={entry.score ? 'currentColor' : 'none'} />
            {entry.score ? (entry.score / 10).toFixed(1) : '—'}
          </button>
        </div>

        <AnimatePresence>
          {showScore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onUpdateScore(s * 10); setShowScore(false) }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      entry.score === s * 10
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/5 text-white/50 hover:bg-yellow-500/20 hover:text-yellow-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => { onUpdateScore(null); setShowScore(false) }}
                  className="px-2 h-7 rounded-lg text-xs text-white/30 hover:text-white/60 bg-white/5 transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all self-start"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default function MyLists() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<WatchStatus>(
    (searchParams.get('tab') as WatchStatus) ?? 'watching',
  )
  const t = useT()
  const { getByStatus, removeFromList, updateEntry } = useListStore()
  const entries = getByStatus(activeTab)
  const allEntries = useListStore((s) => s.entries)
  const totalCount = Object.keys(allEntries).length

  const TABS: { value: WatchStatus; label: string; emoji: string; activeClass: string }[] = [
    { value: 'watching',   label: t.status.watching,   emoji: '▶️', activeClass: 'text-blue-400 border-blue-400' },
    { value: 'planned',    label: t.status.planned,    emoji: '📋', activeClass: 'text-violet-400 border-violet-400' },
    { value: 'completed',  label: t.status.completed,  emoji: '✅', activeClass: 'text-emerald-400 border-emerald-400' },
    { value: 'dropped',    label: t.status.dropped,    emoji: '❌', activeClass: 'text-red-400 border-red-400' },
    { value: 'rewatching', label: t.status.rewatching, emoji: '🔄', activeClass: 'text-amber-400 border-amber-400' },
  ]

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true })
  }, [activeTab, setSearchParams])

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">{t.lists.title}</h1>
          <p className="text-white/40 text-sm">
            {totalCount > 0 ? t.lists.total(totalCount) : t.lists.empty}
          </p>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar pb-1">
          {TABS.map((tab) => {
            const count = getByStatus(tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.value
                    ? `glass border-b-2 ${tab.activeClass} text-white`
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                {count > 0 && (
                  <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">
              {TABS.find((tab) => tab.value === activeTab)?.emoji}
            </p>
            <h3 className="text-xl font-bold text-white mb-2">{t.lists.tabEmpty}</h3>
            <p className="text-white/40 text-sm mb-6">{t.lists.tabEmptyHint}</p>
            <Link to="/catalog" className="btn-primary">{t.lists.toCatalog}</Link>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {entries.map((entry) => (
                <ListEntryCard
                  key={entry.animeId}
                  entry={entry}
                  onRemove={() => removeFromList(entry.animeId)}
                  onUpdateProgress={(p) => updateEntry(entry.animeId, { progress: p })}
                  onUpdateScore={(s) => updateEntry(entry.animeId, { score: s })}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
