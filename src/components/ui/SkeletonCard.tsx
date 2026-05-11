export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 animate-pulse">
      <div className="aspect-[2/3] shimmer bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 animate-pulse">
      <div className="w-16 h-24 rounded-xl shimmer bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  )
}
