import { useQuery } from '@tanstack/react-query'
import { useLanguageStore } from '@/store/languageStore'
import { getRussianTitles } from '@/lib/shikimori'
import type { Anime } from '@/types/anime'

export function resolveTitle(
  anime: Pick<Anime, 'title' | 'idMal'>,
  lang: string,
  ruTitle?: string,
): string {
  switch (lang) {
    case 'ja':
      return anime.title.native || anime.title.romaji
    case 'en':
    case 'de':
    case 'fr':
    case 'es':
      return anime.title.english || anime.title.romaji
    case 'ru':
    case 'uk':
      return ruTitle || anime.title.english || anime.title.romaji
    default:
      return anime.title.english || anime.title.romaji
  }
}

export function useAnimeTitles(animes: Pick<Anime, 'title' | 'idMal'>[]) {
  const lang = useLanguageStore((s) => s.lang)
  const needRu = lang === 'ru' || lang === 'uk'

  const malIds = needRu ? animes.map((a) => a.idMal) : []

  const { data: ruMap } = useQuery({
    queryKey: ['shikimori-titles', malIds.filter(Boolean).sort().join(',')],
    queryFn: () => getRussianTitles(malIds),
    enabled: needRu && malIds.some(Boolean),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })

  return (anime: Pick<Anime, 'title' | 'idMal'>): string => {
    const ruTitle = anime.idMal ? ruMap?.get(anime.idMal) : undefined
    return resolveTitle(anime, lang, ruTitle)
  }
}

export function useAnimeTitle(anime: Pick<Anime, 'title' | 'idMal'> | null | undefined): string {
  const lang = useLanguageStore((s) => s.lang)
  const needRu = lang === 'ru' || lang === 'uk'

  const { data: ruMap } = useQuery({
    queryKey: ['shikimori-titles', anime?.idMal ? String(anime.idMal) : ''],
    queryFn: () => getRussianTitles([anime?.idMal ?? null]),
    enabled: needRu && !!anime?.idMal,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })

  if (!anime) return ''
  const ruTitle = anime.idMal ? ruMap?.get(anime.idMal) : undefined
  return resolveTitle(anime, lang, ruTitle)
}
