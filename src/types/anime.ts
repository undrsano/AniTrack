export interface AnimeTitle {
  romaji: string
  english: string | null
  native: string
}

export interface AnimeCoverImage {
  large: string
  medium: string
  extraLarge: string
  color: string | null
}

export interface AnimeTag {
  id: number
  name: string
  category: string
  rank: number
}

export interface AnimeStudio {
  id: number
  name: string
  isAnimationStudio: boolean
}

export interface AnimeCharacterNode {
  id: number
  name: { full: string; native: string }
  image: { large: string; medium: string }
}

export interface AnimeCharacter {
  role: string
  node: AnimeCharacterNode
}

export interface AnimeStaffNode {
  id: number
  name: { full: string }
  image: { large: string }
}

export interface AnimeStaff {
  role: string
  node: AnimeStaffNode
}

export interface AnimeRelation {
  id: number
  title: AnimeTitle
  coverImage: AnimeCoverImage
  format: string
  status: string
  relationType: string
}

export interface Anime {
  id: number
  idMal: number | null
  title: AnimeTitle
  coverImage: AnimeCoverImage
  bannerImage: string | null
  description: string | null
  genres: string[]
  tags: AnimeTag[]
  averageScore: number | null
  meanScore: number | null
  popularity: number
  favourites: number
  episodes: number | null
  duration: number | null
  status: string
  format: string
  season: string | null
  seasonYear: number | null
  startDate: { year: number | null; month: number | null; day: number | null }
  endDate: { year: number | null; month: number | null; day: number | null }
  studios: { nodes: AnimeStudio[] }
  characters: { edges: AnimeCharacter[] }
  staff: { edges: AnimeStaff[] }
  relations: { edges: { relationType: string; node: AnimeRelation }[] }
  trailer: { id: string; site: string } | null
  source: string | null
  countryOfOrigin: string | null
  isAdult: boolean
  nextAiringEpisode: { episode: number; airingAt: number } | null
}

export interface PageInfo {
  total: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
  perPage: number
}

export interface AnimeSearchResult {
  Page: {
    pageInfo: PageInfo
    media: Anime[]
  }
}

export type WatchStatus = 'watching' | 'planned' | 'completed' | 'dropped' | 'rewatching'

export interface ListEntry {
  animeId: number
  status: WatchStatus
  progress: number
  score: number | null
  addedAt: number
}

export interface SearchFilters {
  query: string
  genres: string[]
  year: number | null
  season: string | null
  format: string | null
  status: string | null
  sort: string
}
