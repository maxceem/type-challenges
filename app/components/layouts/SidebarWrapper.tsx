'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { ChallengesSidebar } from '@/components/ChallengesSidebar'
import type { Challenge } from '@/types/challenges'

interface SidebarWrapperProps {
  challenges: Challenge[]
}

function SidebarContent({ challenges, currentChallengeId }: { challenges: Challenge[], currentChallengeId?: number }) {
  return <ChallengesSidebar challenges={challenges} currentChallengeId={currentChallengeId} />
}

export function SidebarWrapper({ challenges }: SidebarWrapperProps) {
  const pathname = usePathname()

  // Extract challenge ID from pathname like /challenge/123
  const currentChallengeId = pathname.match(/\/challenge\/(\d+)/)?.[1]
    ? parseInt(pathname.match(/\/challenge\/(\d+)/)?.[1] || '0')
    : undefined

  return (
    <Suspense fallback={
      <aside className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b dark:border-gray-700 flex-shrink-0">
          <div className="w-full h-10 bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded mb-3 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-7 w-16 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
              <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </aside>
    }>
      <SidebarContent challenges={challenges} currentChallengeId={currentChallengeId} />
    </Suspense>
  )
}
