import { Star } from 'lucide-react'

interface Props {
  score: number | null
  size?: 'sm' | 'md'
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400'
  if (score >= 65) return 'bg-yellow-500/20 text-yellow-400'
  return 'bg-red-500/20 text-red-400'
}

export function ScoreBadge({ score, size = 'sm' }: Props) {
  if (!score) return null
  const cls = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`score-badge ${getScoreColor(score)} ${cls}`}>
      <Star className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} fill="currentColor" />
      {(score / 10).toFixed(1)}
    </span>
  )
}
