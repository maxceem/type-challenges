import type { ChallengesManifest, Challenge, Difficulty } from '@/types/challenges'
import challengesData from '@/data/challenges.json'

export function getChallengesData(): ChallengesManifest {
  return challengesData as ChallengesManifest
}

export function getAllChallenges(): Challenge[] {
  return getChallengesData().challenges
}

export function getChallengeById(id: number): Challenge | undefined {
  return getAllChallenges().find(c => c.id === id)
}

export function getChallengesByDifficulty(difficulty: Difficulty): Challenge[] {
  return getAllChallenges().filter(c => c.difficulty === difficulty)
}

export function getChallengesByTag(tag: string): Challenge[] {
  return getAllChallenges().filter(c => c.tags.includes(tag))
}

export function searchChallenges(query: string): Challenge[] {
  const lowerQuery = query.toLowerCase()
  return getAllChallenges().filter(c =>
    c.title.toLowerCase().includes(lowerQuery) ||
    c.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    c.id.toString().includes(query)
  )
}

export function getDifficultyColor(difficulty: Difficulty): string {
  const colors = {
    warm: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    extreme: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }
  return colors[difficulty]
}

export function getStatusColor(status: string): string {
  const colors = {
    'completed': 'text-green-600 dark:text-green-400',
    'in-progress': 'text-yellow-600 dark:text-yellow-400',
    'not-started': 'text-gray-400 dark:text-gray-600',
  }
  return colors[status as keyof typeof colors] || colors['not-started']
}

export function getStatusIcon(status: string): string {
  const icons = {
    'completed': '✓',
    'in-progress': '⏱',
    'not-started': '○',
  }
  return icons[status as keyof typeof icons] || icons['not-started']
}
