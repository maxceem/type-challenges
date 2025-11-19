import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

const DB_NAME = 'type-challenges-db'
const DB_VERSION = 2
const STORE_NAME = 'progress'
const SETTINGS_STORE_NAME = 'settings'

export interface ChallengeProgress {
  challengeId: number
  code: string
  status: 'not-started' | 'in-progress' | 'completed'
  lastAttempt: number
}

interface ProgressDB extends DBSchema {
  [STORE_NAME]: {
    key: number
    value: ChallengeProgress
    indexes: {
      status: ChallengeProgress['status']
      lastAttempt: number
    }
  }
  [SETTINGS_STORE_NAME]: {
    key: string
    value: unknown
  }
}

let dbPromise: Promise<IDBPDatabase<ProgressDB>> | null = null

/**
 * Check if IndexedDB is supported in the current browser
 */
export function isIndexedDBSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'indexedDB' in window && window.indexedDB !== null
}

/**
 * Initialize and open the IndexedDB database
 */
async function getDB(): Promise<IDBPDatabase<ProgressDB>> {
  if (dbPromise)
    return dbPromise

  if (!isIndexedDBSupported())
    throw new Error('IndexedDB is not supported in this browser')

  dbPromise = openDB<ProgressDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'challengeId' })
        store.createIndex('status', 'status')
        store.createIndex('lastAttempt', 'lastAttempt')
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME)
      }
    },
  })

  return dbPromise
}

/**
 * Save a setting value
 */
export async function saveSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put(SETTINGS_STORE_NAME, value, key)
}

/**
 * Get a setting value
 */
export async function getSetting(key: string): Promise<unknown | undefined> {
  const db = await getDB()
  return await db.get(SETTINGS_STORE_NAME, key)
}

/**
 * Save or update challenge progress
 */
export async function saveProgress(progress: ChallengeProgress): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, progress)
}

/**
 * Get progress for a specific challenge
 */
export async function getProgress(challengeId: number): Promise<ChallengeProgress | null> {
  const db = await getDB()
  const progress = await db.get(STORE_NAME, challengeId)
  return progress ?? null
}

/**
 * Delete progress for a specific challenge
 */
export async function deleteProgress(challengeId: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, challengeId)
}

/**
 * Get all progress entries
 */
export async function getAllProgress(): Promise<ChallengeProgress[]> {
  const db = await getDB()
  return await db.getAll(STORE_NAME)
}

/**
 * Get progress entries by status
 */
export async function getProgressByStatus(status: ChallengeProgress['status']): Promise<ChallengeProgress[]> {
  const db = await getDB()
  return await db.getAllFromIndex(STORE_NAME, 'status', status)
}

/**
 * Get recent progress entries sorted by lastAttempt
 */
export async function getRecentProgress(limit?: number): Promise<ChallengeProgress[]> {
  const all = await getAllProgress()
  const sorted = all.sort((a, b) => b.lastAttempt - a.lastAttempt)
  return limit ? sorted.slice(0, limit) : sorted
}

/**
 * Clear all progress data
 */
export async function clearAllProgress(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

/**
 * Export all progress as JSON string
 */
export async function exportProgressData(): Promise<string> {
  const all = await getAllProgress()
  return JSON.stringify(all, null, 2)
}

/**
 * Import progress from JSON string
 */
export async function importProgressData(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData) as ChallengeProgress[]
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  data.forEach(progress => {
    tx.store.put(progress)
  })
  await tx.done
}
