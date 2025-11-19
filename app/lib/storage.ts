import type { Challenge, Difficulty, CompletionStatus } from '@/types/challenges'
import * as idb from './indexeddb'
import type { ChallengeProgress } from './indexeddb'

export type { ChallengeProgress }

// Re-export IndexedDB support check
export { isIndexedDBSupported } from './indexeddb'

/**
 * Save challenge progress
 */
export async function saveChallenge(
  id: number,
  code: string,
  status: CompletionStatus
): Promise<void> {
  await idb.saveProgress({
    challengeId: id,
    code,
    status,
    lastAttempt: Date.now(),
  })
}

/**
 * Get progress for a specific challenge
 */
export async function getChallenge(id: number): Promise<ChallengeProgress | null> {
  return await idb.getProgress(id)
}

/**
 * Delete/reset challenge progress
 */
export async function deleteChallenge(id: number): Promise<void> {
  await idb.deleteProgress(id)
}

/**
 * Get all progress as a Map for easy lookup
 */
export async function getAllProgress(): Promise<Map<number, ChallengeProgress>> {
  const all = await idb.getAllProgress()
  const map = new Map<number, ChallengeProgress>()
  all.forEach(progress => {
    map.set(progress.challengeId, progress)
  })
  return map
}

/**
 * Get challenges by status
 */
export async function getChallengesByStatus(
  status: CompletionStatus
): Promise<ChallengeProgress[]> {
  return await idb.getProgressByStatus(status)
}

/**
 * Get completed challenges
 */
export async function getCompletedChallenges(): Promise<ChallengeProgress[]> {
  return await idb.getProgressByStatus('completed')
}

/**
 * Get in-progress challenges
 */
export async function getInProgressChallenges(): Promise<ChallengeProgress[]> {
  return await idb.getProgressByStatus('in-progress')
}

/**
 * Get overall stats
 */
export async function getStats(totalChallenges: number) {
  const all = await idb.getAllProgress()
  const completed = all.filter(p => p.status === 'completed').length
  const inProgress = all.filter(p => p.status === 'in-progress').length
  const notStarted = totalChallenges - completed - inProgress

  return {
    completed,
    inProgress,
    notStarted,
    total: totalChallenges,
    percentage: totalChallenges > 0 ? Math.round((completed / totalChallenges) * 100) : 0,
  }
}

/**
 * Get stats by difficulty
 */
export async function getStatsByDifficulty(
  challenges: Challenge[]
): Promise<Map<Difficulty, { completed: number; total: number }>> {
  const progress = await getAllProgress()
  const stats = new Map<Difficulty, { completed: number; total: number }>()

  // Initialize with total counts from challenges
  challenges.forEach(challenge => {
    const current = stats.get(challenge.difficulty) || { completed: 0, total: 0 }
    stats.set(challenge.difficulty, { ...current, total: current.total + 1 })
  })

  // Count completed per difficulty
  challenges.forEach(challenge => {
    const challengeProgress = progress.get(challenge.id)
    if (challengeProgress?.status === 'completed') {
      const current = stats.get(challenge.difficulty)!
      current.completed++
    }
  })

  return stats
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit: number = 10): Promise<ChallengeProgress[]> {
  return await idb.getRecentProgress(limit)
}

/**
 * Get last attempted challenge
 */
export async function getLastAttempted(): Promise<ChallengeProgress | null> {
  const recent = await idb.getRecentProgress(1)
  return recent.length > 0 ? recent[0] : null
}

/**
 * Get suggested next challenge for "continue from" feature
 */
export async function getSuggestedNext(challenges: Challenge[]): Promise<{
  type: 'start' | 'continue' | 'next' | 'completed'
  challenge?: Challenge
  message: string
}> {
  const progress = await getAllProgress()
  const all = await idb.getAllProgress()

  // No progress yet - suggest first warm challenge
  if (all.length === 0) {
    const firstWarm = challenges.find(c => c.difficulty === 'warm')
    const firstChallenge = firstWarm || challenges[0]
    return {
      type: 'start',
      challenge: firstChallenge,
      message: `Start from ${firstChallenge?.title || 'first challenge'}`,
    }
  }

  // Get last attempted
  const lastAttempted = await getLastAttempted()
  if (!lastAttempted) {
    const firstChallenge = challenges[0]
    return {
      type: 'start',
      challenge: firstChallenge,
      message: `Start from ${firstChallenge?.title || 'first challenge'}`,
    }
  }

  const lastChallenge = challenges.find(c => c.id === lastAttempted.challengeId)
  if (!lastChallenge) {
    const firstChallenge = challenges[0]
    return {
      type: 'start',
      challenge: firstChallenge,
      message: `Start from ${firstChallenge?.title || 'first challenge'}`,
    }
  }

  // Last action was completing a challenge - suggest next
  if (lastAttempted.status === 'completed') {
    // Find next challenge in same difficulty
    const sameDifficulty = challenges.filter(c => c.difficulty === lastChallenge.difficulty)
    const currentIndex = sameDifficulty.findIndex(c => c.id === lastChallenge.id)

    let nextChallenge: Challenge | undefined

    // Try next in same difficulty
    if (currentIndex >= 0 && currentIndex < sameDifficulty.length - 1) {
      nextChallenge = sameDifficulty[currentIndex + 1]
    } else {
      // Move to next difficulty
      const difficultyOrder: Difficulty[] = ['warm', 'easy', 'medium', 'hard', 'extreme']
      const currentDiffIndex = difficultyOrder.indexOf(lastChallenge.difficulty)

      for (let i = currentDiffIndex + 1; i < difficultyOrder.length; i++) {
        const nextDiff = challenges.find(c => c.difficulty === difficultyOrder[i])
        if (nextDiff) {
          nextChallenge = nextDiff
          break
        }
      }
    }

    // Check if all completed
    const allChallenges = challenges.length
    const completedCount = all.filter(p => p.status === 'completed').length

    if (completedCount === allChallenges) {
      return {
        type: 'completed',
        message: "All completed, it's time to create your own challenge 🎉",
      }
    }

    if (nextChallenge) {
      return {
        type: 'next',
        challenge: nextChallenge,
        message: `Next do ${nextChallenge.title}`,
      }
    }
  }

  // Last action was editing - suggest continue
  return {
    type: 'continue',
    challenge: lastChallenge,
    message: `Continue on ${lastChallenge.title}`,
  }
}

/**
 * Clear all progress
 */
export async function clearAll(): Promise<void> {
  await idb.clearAllProgress()
}

/**
 * Export progress as JSON
 */
export async function exportProgress(): Promise<string> {
  return await idb.exportProgressData()
}

/**
 * Import progress from JSON
 */
export async function importProgress(json: string): Promise<void> {
  await idb.importProgressData(json)
}
