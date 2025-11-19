export type Difficulty = 'warm' | 'easy' | 'medium' | 'hard' | 'extreme' | 'pending'

export type CompletionStatus = 'not-started' | 'in-progress' | 'completed'

export interface Challenge {
  id: number
  slug: string
  difficulty: Difficulty
  title: string
  author: {
    name: string
    email?: string
    github: string
  }
  tags: string[]
  related: string[]
  readme: Record<string, string>
  template: string
  testCases: string
  formattedTemplate: string
  tsconfig?: CompilerOptions
}

export interface ChallengesManifest {
  challenges: Challenge[]
  tags: string[]
  stats: {
    total: number
    byDifficulty: Record<Difficulty, number>
  }
  utils: string
}

// Note: ChallengeProgress is now defined in lib/indexeddb.ts and re-exported from lib/storage.ts
// This keeps the type here for backwards compatibility during migration
export interface ChallengeProgress {
  challengeId: number
  status: CompletionStatus
  code: string
  lastAttempt: number
}

// Deprecated: UserProgress is no longer used (replaced by Map<number, ChallengeProgress>)
export interface UserProgress {
  [challengeId: string]: ChallengeProgress
}

export interface AppSettings {
  locale: string
  theme: 'light' | 'dark'
}
import type { CompilerOptions } from 'typescript'
