import { getDifficultyColor } from '@/lib/challenges'
import type { Challenge } from '@/types/challenges'
import type { TypeCheckError } from '@/types/editor'
import { RotateCcw, Check, Share2, ExternalLink } from 'lucide-react'
import { DifficultyBadge } from './DifficultyBadge'

interface EditorToolbarProps {
  challenge: Challenge
  hasChecked: boolean
  testErrors: TypeCheckError[]
  onReset: () => void
}

export function EditorToolbar({ challenge, hasChecked, testErrors, onReset }: EditorToolbarProps) {
  const errorCount = testErrors.length

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0 h-12 flex items-center px-4">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            {hasChecked && errorCount === 0 ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${errorCount === 0 ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-red-600 text-white'}`}
                title="Current number of TypeScript errors"
              >
                {errorCount}
              </span>
            )}
          </div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            #{challenge.id} {challenge.title}
          </h1>
          <DifficultyBadge difficulty={challenge.difficulty} className="ml-1" />
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`https://tsch.js.org/${challenge.id}/solutions`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View Solutions
          </a>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
          <a
            href={`https://tsch.js.org/${challenge.id}/answer`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <Share2 className="w-3 h-3" />
            Share Solution
          </a>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
          <button
            onClick={onReset}
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
    </header>
  )
}
