'use client'

import { useState, useMemo, useEffect } from 'react'
import { PreserveParamsLink as Link } from '@/components/PreserveParamsLink'
import { useSearchParams, usePathname } from 'next/navigation'
import { CheckCircle, PlayCircle, ArrowRight, AlertTriangle } from 'lucide-react'
import { getDifficultyColor } from '@/lib/challenges'
import { useProgress } from '@/lib/progress-context'
import * as storage from '@/lib/storage'
import type { Challenge, Difficulty } from '@/types/challenges'
import { DifficultyBadge } from './DifficultyBadge'

interface ChallengesSidebarProps {
  challenges: Challenge[]
  currentChallengeId?: number
}

const DIFFICULTIES = ['all', 'warm', 'easy', 'medium', 'hard', 'extreme'] as const

const DIFFICULTY_STYLES = {
  all: {
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
    activeBg: 'bg-gray-100 dark:bg-gray-800',
    bar: 'bg-gray-500 dark:bg-gray-400'
  },
  warm: {
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    activeBg: 'bg-blue-50 dark:bg-blue-900/20',
    bar: 'bg-blue-500 dark:bg-blue-500'
  },
  easy: {
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    activeBg: 'bg-green-50 dark:bg-green-900/20',
    bar: 'bg-green-500 dark:bg-green-500'
  },
  medium: {
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    activeBg: 'bg-yellow-50 dark:bg-yellow-900/20',
    bar: 'bg-yellow-500 dark:bg-yellow-500'
  },
  hard: {
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    activeBg: 'bg-orange-50 dark:bg-orange-900/20',
    bar: 'bg-orange-500 dark:bg-orange-500'
  },
  extreme: {
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    activeBg: 'bg-red-50 dark:bg-red-900/20',
    bar: 'bg-red-500 dark:bg-red-500'
  },
} as const

// Helper to get status icon
function getStatusIcon(status: 'not-started' | 'in-progress' | 'completed'): string {
  switch (status) {
    case 'completed':
      return '✓'
    case 'in-progress':
      return '⏱'
    default:
      return '○'
  }
}

// Helper to get status icon color
function getStatusIconColor(status: 'not-started' | 'in-progress' | 'completed'): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 dark:text-green-400'
    case 'in-progress':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-gray-300 dark:text-gray-600'
  }
}

export function ChallengesSidebar({ challenges, currentChallengeId }: ChallengesSidebarProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const difficultyFilter = searchParams.get('difficulty') || 'all'
  const { isHydrated, getStatus, progress } = useProgress()

  // State for difficulty stats
  const [difficultyStats, setDifficultyStats] = useState<Map<Difficulty, { completed: number; total: number }>>(new Map())

  // State for continue suggestion
  const [suggestion, setSuggestion] = useState<{ type: string; challenge?: Challenge; message: string } | null>(null)

  // Load difficulty stats and suggestion on client
  // Reload whenever progress changes (e.g., when user completes or resets a challenge)
  useEffect(() => {
    if (!isHydrated || !storage.isIndexedDBSupported()) return

    async function loadData() {
      try {
        const stats = await storage.getStatsByDifficulty(challenges)
        setDifficultyStats(stats)

        const nextSuggestion = await storage.getSuggestedNext(challenges)
        setSuggestion(nextSuggestion)
      } catch (error) {
        console.error('Error loading sidebar data:', error)
      }
    }

    loadData()
  }, [isHydrated, challenges, progress])

  // Calculate total counts synchronously
  const totalCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', challenges.length)
    challenges.forEach(c => {
      counts.set(c.difficulty, (counts.get(c.difficulty) || 0) + 1)
    })
    return counts
  }, [challenges])

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const matchesDifficulty = difficultyFilter === 'all' || c.difficulty === difficultyFilter
      return matchesDifficulty
    })
  }, [challenges, difficultyFilter])

  return (
    <aside className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col flex-shrink-0">
      {/* Filter section */}
      <div className="p-4 border-b dark:border-gray-700 flex-shrink-0">
        {/* Difficulty Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {DIFFICULTIES.map((difficulty) => {
            const isActive = difficultyFilter === difficulty
            const label = difficulty === 'all' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)

            // Get stats for this difficulty
            const total = totalCounts.get(difficulty) || 0
            let completed = 0
            
            if (difficulty === 'all') {
               completed = Array.from(difficultyStats.values()).reduce((acc, s) => acc + s.completed, 0)
            } else {
              const stats = difficultyStats.get(difficulty as Difficulty)
              completed = stats?.completed || 0
            }

            // Build href: for 'all', use pathname without params; otherwise set difficulty param
            const href = difficulty === 'all' ? pathname : `${pathname}?difficulty=${difficulty}`
            
            const percentage = total > 0 ? (completed / total) * 100 : 0
            const styles = DIFFICULTY_STYLES[difficulty as keyof typeof DIFFICULTY_STYLES] || DIFFICULTY_STYLES.all

            return (
              <Link
                key={difficulty}
                href={href}
                preserveParams={difficulty !== 'all'}
                className={`relative flex flex-col overflow-hidden rounded-md border transition-all ${
                  isActive 
                    ? `${styles.border} ${styles.activeBg}` 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${styles.text}`}
              >
                {/* Content */}
                <div className="flex w-full items-center justify-between px-4 py-2 gap-x-2">
                  <span className="text-xs font-medium capitalize">{label}</span>
                  <span className="text-[10px] opacity-70">
                    {isHydrated ? completed : '-'}/{total}
                  </span>
                </div>

                {/* Progress Bar */}
                <div 
                  className={`absolute bottom-0 left-0 h-[3px] transition-all duration-500 ${styles.bar}`} 
                  style={{ width: isHydrated ? `${percentage}%` : '0%' }} 
                />
              </Link>
            )
          })}
        </div>

        {/* Continue Suggestion */}
        <div className="mt-1">
          {isHydrated && storage.isIndexedDBSupported() && suggestion && (
            <div className="w-full">
              {suggestion.type === 'completed' ? (
                <a
                  href="https://github.com/type-challenges/type-challenges/issues/new?template=0-new.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-xs"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{suggestion.message}</span>
                </a>
              ) : suggestion.challenge ? (
                <Link
                  href={`/challenge/${suggestion.challenge.id}?difficulty=${suggestion.challenge.difficulty}`}
                  className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                >
                  {suggestion.type === 'continue' ? (
                    <PlayCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-0.5">
                      {suggestion.type === 'continue' ? 'Continue Solving' : 'Up Next'}
                    </span>
                    <span className="text-xs font-medium truncate group-hover:underline">
                      {suggestion.challenge.title}
                    </span>
                  </div>
                </Link>
              ) : null}
            </div>
          )}
          {isHydrated && !storage.isIndexedDBSupported() && (
            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Your browser doesn&rsquo;t support IndexedDB. Progress saving is disabled.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Challenges list */}
      <div className="flex-1 overflow-y-auto">
        {filteredChallenges.map((c) => {
          const status = getStatus(c.id)

          return (
            <Link
              key={c.id}
              href={`/challenge/${c.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                c.id === currentChallengeId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
              }`}
            >
              {/* Status Icon */}
              <span className={`w-4 text-center flex-shrink-0 ${isHydrated ? getStatusIconColor(status) : 'text-transparent'}`}>
                {isHydrated ? getStatusIcon(status) : '○'}
              </span>

              {/* Challenge Title */}
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                {c.title}
              </span>

              {/* Difficulty Badge */}
              <DifficultyBadge difficulty={c.difficulty} />
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
