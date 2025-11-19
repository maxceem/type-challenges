'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { CompletionStatus } from '@/types/challenges'
import type { ChallengeProgress } from './storage'
import * as storage from './storage'

interface ProgressStats {
  completed: number
  inProgress: number
  notStarted: number
  total: number
  percentage: number
}

interface ProgressContextType {
  // Data
  progress: Map<number, ChallengeProgress>
  stats: ProgressStats | null
  isHydrated: boolean

  // Actions
  save: (id: number, code: string, status: CompletionStatus) => Promise<void>
  reset: (id: number) => Promise<void>
  refresh: () => Promise<void>

  // Helpers
  getStatus: (id: number) => CompletionStatus
  getCode: (id: number) => string | null
  isCompleted: (id: number) => boolean
  isInProgress: (id: number) => boolean
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({
  children,
  totalChallenges = 0
}: {
  children: ReactNode
  totalChallenges?: number
}) {
  const [progress, setProgress] = useState<Map<number, ChallengeProgress>>(new Map())
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load progress from IndexedDB on client mount
  useEffect(() => {
    async function loadProgress() {
      try {
        if (!storage.isIndexedDBSupported()) {
          setIsHydrated(true)
          return
        }

        const progressMap = await storage.getAllProgress()
        const progressStats = await storage.getStats(totalChallenges)

        setProgress(progressMap)
        setStats(progressStats)
      } catch (error) {
        console.error('Error loading progress:', error)
      } finally {
        setIsHydrated(true)
      }
    }

    loadProgress()
  }, [totalChallenges])

  const save = useCallback(async (id: number, code: string, status: CompletionStatus) => {
    try {
      await storage.saveChallenge(id, code, status)

      // Update local state
      const progressMap = await storage.getAllProgress()
      const progressStats = await storage.getStats(totalChallenges)

      setProgress(progressMap)
      setStats(progressStats)
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [totalChallenges])

  const reset = useCallback(async (id: number) => {
    try {
      await storage.deleteChallenge(id)

      // Update local state
      const progressMap = await storage.getAllProgress()
      const progressStats = await storage.getStats(totalChallenges)

      setProgress(progressMap)
      setStats(progressStats)
    } catch (error) {
      console.error('Error resetting progress:', error)
    }
  }, [totalChallenges])

  const refresh = useCallback(async () => {
    try {
      const progressMap = await storage.getAllProgress()
      const progressStats = await storage.getStats(totalChallenges)

      setProgress(progressMap)
      setStats(progressStats)
    } catch (error) {
      console.error('Error refreshing progress:', error)
    }
  }, [totalChallenges])

  const getStatus = useCallback((id: number): CompletionStatus => {
    return progress.get(id)?.status || 'not-started'
  }, [progress])

  const getCode = useCallback((id: number): string | null => {
    return progress.get(id)?.code || null
  }, [progress])

  const isCompleted = useCallback((id: number): boolean => {
    return progress.get(id)?.status === 'completed'
  }, [progress])

  const isInProgress = useCallback((id: number): boolean => {
    return progress.get(id)?.status === 'in-progress'
  }, [progress])

  return (
    <ProgressContext.Provider
      value={{
        progress,
        stats,
        isHydrated,
        save,
        reset,
        refresh,
        getStatus,
        getCode,
        isCompleted,
        isInProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
