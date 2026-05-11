const ENDPOINT = 'https://shikimori.one/api'

interface ShikimoriAnime {
  id: number
  russian: string
  name: string
}

export async function getRussianTitles(malIds: (number | null)[]): Promise<Map<number, string>> {
  const ids = malIds.filter((id): id is number => !!id)
  if (!ids.length) return new Map()

  try {
    const res = await fetch(
      `${ENDPOINT}/animes?ids=${ids.join(',')}&limit=50`,
    )
    if (!res.ok) return new Map()
    const data: ShikimoriAnime[] = await res.json()
    const map = new Map<number, string>()
    for (const anime of data) {
      if (anime.russian) map.set(anime.id, anime.russian)
    }
    return map
  } catch {
    return new Map()
  }
}
