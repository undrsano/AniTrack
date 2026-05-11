import type { Anime, AnimeSearchResult, SearchFilters } from '@/types/anime'

const ENDPOINT = 'https://graphql.anilist.co'

async function query<T>(q: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: q, variables }),
  })
  if (!res.ok) throw new Error(`AniList API error: ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'GraphQL error')
  return json.data as T
}

const MEDIA_FRAGMENT = `
  id
  idMal
  title { romaji english native }
  coverImage { large medium extraLarge color }
  bannerImage
  description(asHtml: false)
  genres
  tags { id name category rank }
  averageScore
  meanScore
  popularity
  favourites
  episodes
  duration
  status
  format
  season
  seasonYear
  startDate { year month day }
  endDate { year month day }
  studios { nodes { id name isAnimationStudio } }
  trailer { id site }
  source
  countryOfOrigin
  isAdult
  nextAiringEpisode { episode airingAt }
`

const MEDIA_FULL_FRAGMENT = `
  ${MEDIA_FRAGMENT}
  characters(sort: ROLE, perPage: 12) {
    edges {
      role
      node { id name { full native } image { large medium } }
    }
  }
  staff(perPage: 8) {
    edges {
      role
      node { id name { full } image { large } }
    }
  }
  relations {
    edges {
      relationType
      node {
        id title { romaji english native }
        coverImage { large medium extraLarge color }
        format status
      }
    }
  }
`

export async function searchAnime(
  filters: Partial<SearchFilters>,
  page = 1,
  perPage = 20,
): Promise<AnimeSearchResult> {
  const q = `
    query ($page: Int, $perPage: Int, $search: String, $genres: [String], $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, search: $search, genre_in: $genres, seasonYear: $year, season: $season, format: $format, status: $status, sort: $sort, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `
  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: filters.sort ? [filters.sort] : ['POPULARITY_DESC'],
  }
  if (filters.query) variables.search = filters.query
  if (filters.genres?.length) variables.genres = filters.genres
  if (filters.year) variables.year = filters.year
  if (filters.season) variables.season = filters.season.toUpperCase()
  if (filters.format) variables.format = filters.format.toUpperCase()
  if (filters.status) variables.status = filters.status.toUpperCase()

  return query<AnimeSearchResult>(q, variables)
}

export async function getTrending(page = 1, perPage = 10): Promise<AnimeSearchResult> {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }
  `
  return query<AnimeSearchResult>(q, { page, perPage })
}

export async function getPopular(page = 1, perPage = 20): Promise<AnimeSearchResult> {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }
  `
  return query<AnimeSearchResult>(q, { page, perPage })
}

export async function getCurrentSeason(page = 1, perPage = 20): Promise<AnimeSearchResult> {
  const now = new Date()
  const month = now.getMonth() + 1
  const season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL'
  const year = now.getFullYear()

  const q = `
    query ($page: Int, $perPage: Int, $season: MediaSeason, $year: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }
  `
  return query<AnimeSearchResult>(q, { page, perPage, season, year })
}

export async function getAnimeById(id: number): Promise<{ Media: Anime }> {
  const q = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) { ${MEDIA_FULL_FRAGMENT} }
    }
  `
  return query<{ Media: Anime }>(q, { id })
}

export async function getRecommendations(ids: number[], page = 1, perPage = 20): Promise<AnimeSearchResult> {
  if (!ids.length) return getPopular(page, perPage)

  const sample = ids.slice(0, 5)
  const q = `
    query ($page: Int, $perPage: Int, $ids: [Int]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, id_not_in: $ids, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }
  `
  return query<AnimeSearchResult>(q, { page, perPage, ids: sample })
}

export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror',
  'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
]

export const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL']

export const FORMATS = ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC']

export const STATUSES = ['FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED']

export const SORT_OPTIONS = [
  { value: 'POPULARITY_DESC', label: 'Популярность' },
  { value: 'SCORE_DESC', label: 'Рейтинг' },
  { value: 'TRENDING_DESC', label: 'В тренде' },
  { value: 'FAVOURITES_DESC', label: 'Избранное' },
  { value: 'START_DATE_DESC', label: 'Новинки' },
  { value: 'EPISODES_DESC', label: 'Эпизоды' },
]

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    FINISHED: 'Завершён',
    RELEASING: 'Выходит',
    NOT_YET_RELEASED: 'Анонс',
    CANCELLED: 'Отменён',
    HIATUS: 'Пауза',
  }
  return map[status] ?? status
}

export function formatFormat(format: string): string {
  const map: Record<string, string> = {
    TV: 'ТВ', TV_SHORT: 'ТВ Короткий', MOVIE: 'Фильм',
    SPECIAL: 'Спэшл', OVA: 'OVA', ONA: 'ONA', MUSIC: 'Клип',
  }
  return map[format] ?? format
}

export function formatSeason(season: string, year?: number | null): string {
  const map: Record<string, string> = {
    WINTER: 'Зима', SPRING: 'Весна', SUMMER: 'Лето', FALL: 'Осень',
  }
  const s = map[season] ?? season
  return year ? `${s} ${year}` : s
}
