import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Calendar, Tv2, Clock, Users, Heart, ChevronLeft,
  Play, Plus, Check, ExternalLink, BookOpen,
} from 'lucide-react'
import { getAnimeById } from '@/lib/anilist'
import { useListStore } from '@/store/listStore'
import { useAnimeTitle } from '@/hooks/useAnimeTitle'
import { useT } from '@/hooks/useT'
import { ScoreBadge } from '@/components/ui/ScoreBadge'
import type { WatchStatus } from '@/types/anime'

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>()
  const [statusOpen, setStatusOpen] = useState(false)
  const { getEntry, addToList, updateEntry, removeFromList } = useListStore()
  const t = useT()
  const animeId = Number(id)
  const entry = getEntry(animeId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['anime', animeId],
    queryFn: () => getAnimeById(animeId),
    enabled: !!animeId,
  })

  const anime = data?.Media
  const title = useAnimeTitle(anime ?? null)

  const STATUS_OPTIONS: { value: WatchStatus; label: string; color: string }[] = [
    { value: 'watching',   label: t.status.watching,   color: 'bg-blue-500' },
    { value: 'planned',    label: t.status.planned,    color: 'bg-violet-500' },
    { value: 'completed',  label: t.status.completed,  color: 'bg-emerald-500' },
    { value: 'dropped',    label: t.status.dropped,    color: 'bg-red-500' },
    { value: 'rewatching', label: t.status.rewatching, color: 'bg-amber-500' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="h-72 bg-white/5 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex gap-8">
            <div className="w-48 h-72 rounded-2xl bg-white/5 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-white/5 animate-pulse rounded" style={{ width: `${80 - i * 12}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😔</p>
          <h2 className="text-xl font-bold text-white mb-2">{t.animeNotFound}</h2>
          <Link to="/catalog" className="btn-primary mt-4">← {t.nav.catalog}</Link>
        </div>
      </div>
    )
  }

  const description = anime.description?.replace(/<[^>]+>/g, '') ?? ''
  const mainStudio = anime.studios.nodes.find((s) => s.isAnimationStudio) ?? anime.studios.nodes[0]

  const mediaStatusLabel = t.mediaStatus[anime.status as keyof typeof t.mediaStatus] ?? anime.status
  const formatLabel = t.format[anime.format as keyof typeof t.format] ?? anime.format
  const seasonLabel = anime.season
    ? (t.season[anime.season as keyof typeof t.season] ?? anime.season) + (anime.seasonYear ? ` ${anime.seasonYear}` : '')
    : undefined

  function getRelationLabel(relationType: string) {
    return t.relation[relationType as keyof typeof t.relation] ?? relationType
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {anime.bannerImage ? (
          <img src={anime.bannerImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/40 to-transparent" />

        <div className="absolute top-20 left-4 sm:left-8">
          <Link
            to={-1 as unknown as string}
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors glass px-3 py-1.5 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.detail.back}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-6 -mt-32 sm:-mt-40 relative z-10 mb-8">
          <div className="flex-shrink-0">
            <img
              src={anime.coverImage.large}
              alt={title}
              className="w-40 sm:w-52 rounded-2xl shadow-2xl shadow-black/50 border-4 border-[#0f0f1a]"
            />
          </div>

          <div className="flex-1 pt-36 sm:pt-16 min-w-0">
            <div className="flex items-start gap-3 flex-wrap mb-2">
              <ScoreBadge score={anime.averageScore} size="md" />
              <span className="text-xs px-2.5 py-1 rounded-full glass text-white/60">{mediaStatusLabel}</span>
              {anime.format && (
                <span className="text-xs px-2.5 py-1 rounded-full glass text-white/60">{formatLabel}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-1">{title}</h1>
            {anime.title.native && (
              <p className="text-white/40 text-sm mb-4">{anime.title.native}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-5">
              {anime.episodes && (
                <span className="flex items-center gap-1.5">
                  <Tv2 className="w-4 h-4" /> {t.detail.episodes(anime.episodes)}
                </span>
              )}
              {anime.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {t.detail.minutes(anime.duration)}
                </span>
              )}
              {seasonLabel && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {seasonLabel}
                </span>
              )}
              {anime.popularity > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {anime.popularity.toLocaleString()}
                </span>
              )}
              {anime.favourites > 0 && (
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> {anime.favourites.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  to={`/catalog?genre=${encodeURIComponent(g)}`}
                  className="text-xs px-3 py-1 rounded-full glass text-white/60 hover:text-accent hover:border-accent/30 transition-colors border border-white/10"
                >
                  {g}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <button
                  onClick={() => setStatusOpen(!statusOpen)}
                  className={`btn-primary ${entry ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                >
                  {entry ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {entry
                    ? STATUS_OPTIONS.find((s) => s.value === entry.status)?.label ?? t.detail.inList
                    : t.detail.addToList}
                </button>

                {statusOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 glass-dark rounded-2xl overflow-hidden border border-white/10 z-30 min-w-[200px] shadow-2xl"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          entry ? updateEntry(animeId, { status: opt.value }) : addToList(animeId, opt.value)
                          setStatusOpen(false)
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/5 transition-colors text-left ${
                          entry?.status === opt.value ? 'text-white' : 'text-white/70'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                        {opt.label}
                        {entry?.status === opt.value && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
                      </button>
                    ))}
                    {entry && (
                      <button
                        onClick={() => { removeFromList(animeId); setStatusOpen(false) }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                      >
                        {t.detail.removeFromList}
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {anime.trailer?.site === 'youtube' && (
                <a
                  href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <Play className="w-4 h-4" />
                  {t.detail.trailer}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <a
                href={`https://anilist.co/anime/${anime.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                AniList
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            {description && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  {t.detail.description}
                </h2>
                <p className="text-white/60 leading-relaxed text-sm">{description}</p>
              </section>
            )}

            {anime.characters.edges.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  {t.detail.characters}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {anime.characters.edges.map(({ node, role }) => (
                    <div key={node.id} className="text-center group">
                      <div className="aspect-square rounded-xl overflow-hidden mb-1.5 bg-white/5">
                        <img
                          src={node.image.large}
                          alt={node.name.full}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs font-medium text-white/80 truncate">{node.name.full}</p>
                      <p className="text-xs text-white/40">
                        {role === 'MAIN' ? t.detail.charMain : t.detail.charSupport}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {anime.relations.edges.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4">{t.detail.related}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {anime.relations.edges.slice(0, 8).map(({ node, relationType }) => (
                    <Link key={node.id} to={`/anime/${node.id}`} className="group">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-1.5">
                        <img
                          src={node.coverImage.large}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs font-medium text-white/80 truncate">
                        {node.title.english ?? node.title.romaji}
                      </p>
                      <p className="text-xs text-accent">{getRelationLabel(relationType)}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-4">{t.detail.info}</h3>
              <dl className="space-y-3">
                {[
                  { label: t.detail.infoStatus,   value: mediaStatusLabel },
                  { label: t.detail.infoFormat,   value: formatLabel },
                  { label: t.detail.infoEpisodes, value: anime.episodes?.toString() },
                  { label: t.detail.infoDuration, value: anime.duration ? t.detail.minutes(anime.duration) : undefined },
                  { label: t.detail.infoStudio,   value: mainStudio?.name },
                  { label: t.detail.infoSeason,   value: seasonLabel },
                  { label: t.detail.infoSource,   value: anime.source ?? undefined },
                  { label: t.detail.infoCountry,  value: anime.countryOfOrigin ?? undefined },
                ].filter((item) => item.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-xs text-white/40 flex-shrink-0">{label}</dt>
                    <dd className="text-xs text-white/80 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {anime.tags.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold text-white mb-3">{t.detail.tags}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {anime.tags.slice(0, 15).map((tag) => (
                    <span key={tag.id} className="text-xs px-2 py-0.5 rounded-lg bg-white/5 text-white/50" title={`${tag.rank}%`}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {anime.staff.edges.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold text-white mb-4">{t.detail.creators}</h3>
                <div className="space-y-3">
                  {anime.staff.edges.slice(0, 6).map(({ node, role }) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <img src={node.image.large} alt="" className="w-10 h-10 rounded-full object-cover bg-white/5" loading="lazy" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white/80 truncate">{node.name.full}</p>
                        <p className="text-xs text-white/40">{role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entry && (
              <div className="glass rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold text-white mb-4">{t.detail.myProgress}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-white/50 mb-1.5">
                      <span>{t.detail.progress}</span>
                      <span>{entry.progress} / {anime.episodes ?? '?'}</span>
                    </div>
                    {anime.episodes && (
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${Math.min(100, (entry.progress / anime.episodes) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateEntry(animeId, { progress: Math.max(0, entry.progress - 1) })}
                      className="w-8 h-8 rounded-lg glass text-white/60 hover:text-white flex items-center justify-center text-lg"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-white">{entry.progress}</span>
                    <button
                      onClick={() =>
                        updateEntry(animeId, {
                          progress: Math.min(anime.episodes ?? Infinity, entry.progress + 1),
                        })
                      }
                      disabled={!!anime.episodes && entry.progress >= anime.episodes}
                      className="w-8 h-8 rounded-lg glass text-white/60 hover:text-white flex items-center justify-center text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
