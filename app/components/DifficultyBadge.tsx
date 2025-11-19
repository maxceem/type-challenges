import { getDifficultyColor } from '@/lib/challenges'
import type { Difficulty } from '@/types/challenges'

interface DifficultyBadgeProps {
  difficulty: Difficulty
  className?: string
}

export function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  return (
    <span 
      className={`
        px-2 py-0.5 
        rounded text-[10px] 
        font-medium uppercase tracking-wider 
        whitespace-nowrap flex-shrink-0 
        ${getDifficultyColor(difficulty)} 
        ${className}
      `}
    >
      {difficulty}
    </span>
  )
}
