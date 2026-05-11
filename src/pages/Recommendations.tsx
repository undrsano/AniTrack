import { Link } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Sparkles, ArrowRight } from 'lucide-react'
import { getRecommendations } from '@/lib/anilist'
import { useListStore } from '@/store/listStore'
import { AnimeCard } from '@/components/AnimeCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { useIntersection } from '@/hooks/useIntersection'
import { useT } from '@/hooks/useT'
import { useEffect } from 'react'

export default function Recommendations() {
  const ids = useListStore((s) => s.getAllIds())
  const { ref, isIntersecting } = useIntersection({ threshold: 0.1 })
  const t = useT()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['recommendations', ids.slice(0, 10).join(',')],
    queryFn: ({ pageParam }) => getRecommendations(ids, pageParam as number, 20),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.Page.pageInfo.hasNextPage ? last.Page.pageInfo.currentPage + 1 : undefined,
  })

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const animes = data?.pages.flatMap((p) => p.Page.media) ?? []

  if (ids.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-2xl font-black text-white mb-3">{t.recs.emptyTitle}</h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">{t.recs.emptyHint}</p>
          <Link to="/catalog" className="btn-primary">
            {t.recs.toCatalog}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <Sparkles className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-black text-white">{t.recs.title}</h1>
          </div>
          <p className="text-white/40 text-sm">{t.recs.based(ids.length)}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {animes.map((anime, i) => (
              <AnimeCard key={`${anime.id}-${i}`} anime={anime} index={i % 20} />
            ))}
          </div>
        )}

        <div ref={ref} className="flex justify-center mt-8 py-4">
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
