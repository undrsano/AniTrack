import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ListEntry, WatchStatus } from '@/types/anime'

interface ListStore {
  entries: Record<number, ListEntry>
  addToList: (animeId: number, status: WatchStatus) => void
  removeFromList: (animeId: number) => void
  updateEntry: (animeId: number, updates: Partial<ListEntry>) => void
  getEntry: (animeId: number) => ListEntry | undefined
  getByStatus: (status: WatchStatus) => ListEntry[]
  getAllIds: () => number[]
}

export const useListStore = create<ListStore>()(
  persist(
    (set, get) => ({
      entries: {},

      addToList: (animeId, status) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [animeId]: {
              animeId,
              status,
              progress: 0,
              score: null,
              addedAt: Date.now(),
            },
          },
        }))
      },

      removeFromList: (animeId) => {
        set((state) => {
          const next = { ...state.entries }
          delete next[animeId]
          return { entries: next }
        })
      },

      updateEntry: (animeId, updates) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [animeId]: { ...state.entries[animeId], ...updates },
          },
        }))
      },

      getEntry: (animeId) => get().entries[animeId],

      getByStatus: (status) =>
        Object.values(get().entries)
          .filter((e) => e.status === status)
          .sort((a, b) => b.addedAt - a.addedAt),

      getAllIds: () => Object.keys(get().entries).map(Number),
    }),
    { name: 'anime-list' },
  ),
)
