import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Check, Play } from 'lucide-react'
import type { Anime } from '@/types/anime'
import { ScoreBadge } from './ui/ScoreBadge'
import { useListStore } from '@/store/listStore'
import { useLanguageStore } from '@/store/languageStore'
import { useAnimeTitles } from '@/hooks/useAnimeTitle'
import { useT } from '@/hooks/useT'

function formatFormatShort(format: string, t: ReturnType<typeof useT>): string {
  return t.format[format as keyof typeof t.format] ?? format
}

interface Props {
  anime: Anime
  index?: number
  view?: 'grid' | 'list'
}

export const AnimeCard = memo(function AnimeCard({ anime, index = 0, view = 'grid' }: Props) {
  const [imgError, setImgError] = useState(false)
  const { getEntry, addToList } = useListStore()
  const entry = getEntry(anime.id)
  const inList = !!entry
  const lang = useLanguageStore((s) => s.lang)
  const getTitle = useAnimeTitles([anime])
  const t = useT()

  const title = getTitle(anime)

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
      >
        <Link
          to={`/anime/${anime.id}`}
          className="flex gap-4 p-3 rounded-2xl glass card-hover group"
        >
          <img
            src={imgError ? '' : anime.coverImage.medium}
            alt={title}
            onError={() => setImgError(true)}
            className="w-16 h-24 object-cover rounded-xl flex-shrink-0 bg-white/5"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-accent transition-colors">
              {title}
            </h3>
            <p className="text-xs text-white/40 mt-0.5 truncate">
              {lang === 'ja' ? anime.title.romaji : anime.title.native}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ScoreBadge score={anime.averageScore} />
              <span className="text-xs text-white/50">{formatFormatShort(anime.format, t)}</span>
              {anime.episodes && (
                <span className="text-xs text-white/50">{anime.episodes} ep.</span>
              )}
              {anime.seasonYear && (
                <span className="text-xs text-white/50">{anime.seasonYear}</span>
              )}
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {anime.genres.slice(0, 3).map((g) => (
                <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50">
                  {g}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!inList) addToList(anime.id, 'planned')
              }}
              className={`p-2 rounded-xl transition-all ${
                inList
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-white/40 hover:bg-accent/20 hover:text-accent'
              }`}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group relative"
    >
      <Link to={`/anime/${anime.id}`} className="block">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5">
          <img
            src={imgError ? '' : (anime.coverImage.large ?? anime.coverImage.medium)}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-2 left-2">
            <ScoreBadge score={anime.averageScore} />
          </div>

          {anime.nextAiringEpisode && (
            <div className="absolute top-2 right-2 bg-accent/90 text-white text-xs px-2 py-0.5 rounded-lg font-medium">
              Ep. {anime.nextAiringEpisode.episode}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1.5 bg-accent rounded-xl py-2 px-3 text-xs font-semibold">
                <Play className="w-3 h-3 fill-white" />
                {t.detail.moreDetails}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!inList) addToList(anime.id, 'planned')
                }}
                className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                  inList
                    ? 'bg-emerald-500/80 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2.5 px-1">
          <h3 className="font-semibold text-sm text-white/90 line-clamp-2 leading-tight group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {anime.format && formatFormatShort(anime.format, t)}
            {anime.episodes ? ` · ${anime.episodes} ep.` : ''}
            {anime.seasonYear ? ` · ${anime.seasonYear}` : ''}
          </p>
        </div>
      </Link>
    </motion.div>
  )
})
