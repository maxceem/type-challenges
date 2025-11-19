import path from 'node:path'
import fs from 'fs-extra'
import { loadQuizzes, resolveInfo } from '../../scripts/loader'
import { supportedLocales, defaultLocale } from '../../scripts/locales'
import type { Quiz, Difficulty } from '../../scripts/types'
import { toCommentBlock } from '../../scripts/actions/utils/toCommentBlock'
import { toDivider } from '../../scripts/actions/utils/toDivider'
import type { CompilerOptions } from 'typescript'

const DOMAIN = 'https://tsch.js.org'

function toAnswerShort(no: number, locale?: string): string {
  return locale !== 'en' ? `${DOMAIN}/${no}/answer/${locale}` : `${DOMAIN}/${no}/answer`
}

function toSolutionsShort(no: number): string {
  return `${DOMAIN}/${no}/solutions`
}

function toHomepageShort(locale?: string): string {
  return locale !== 'en' ? `${DOMAIN}/${locale}` : `${DOMAIN}`
}

function createFooter(challengeId: number, locale: string = 'en'): string {
  return '\n\n'
    + `> Share your solutions: ${toAnswerShort(challengeId, locale)}\n`
    + `> View solutions: ${toSolutionsShort(challengeId)}\n`
    + `> More Challenges: ${toHomepageShort(locale)}\n`
}

function formatChallengeCode(quiz: Quiz, readme: string, locale: string = 'en'): string {
  return `${toCommentBlock(
    `#${quiz.no} - ${resolveInfo(quiz, locale).title}\n\n${readme}`
  )}
${toDivider('Test Cases')}
${(quiz.tests || '').trim()}

${toDivider('Your Code')}

${(quiz.template || '').trim()}

`
}

interface WebChallenge {
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

interface WebManifest {
  challenges: WebChallenge[]
  tags: string[]
  stats: {
    total: number
    byDifficulty: Record<Difficulty, number>
  }
  utils: string
}

async function generateManifest() {
  console.log('🔄 Loading challenges from type-challenges repository...')
  const quizzes = await loadQuizzes()

  console.log(`✓ Found ${quizzes.length} challenges`)

  // Collect all unique tags
  const tagsSet = new Set<string>()

  // Stats by difficulty
  const statsByDifficulty: Record<string, number> = {
    warm: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    extreme: 0,
    pending: 0,
  }

  // Transform quizzes to web format
  const challenges: WebChallenge[] = quizzes.map((quiz: Quiz) => {
    const info = resolveInfo(quiz, defaultLocale)

    // Count by difficulty
    if (quiz.difficulty && quiz.difficulty !== 'pending') {
      statsByDifficulty[quiz.difficulty] = (statsByDifficulty[quiz.difficulty] || 0) + 1
    }

    // Collect tags
    if (info.tags) {
      info.tags.forEach(tag => tagsSet.add(tag))
    }

    // Generate formatted template with description and footer
    const readme = quiz.readme[defaultLocale] || quiz.readme.en || ''
    const formattedTemplate = formatChallengeCode(quiz, readme, defaultLocale)

    return {
      id: quiz.no,
      slug: quiz.path,
      difficulty: quiz.difficulty,
      title: info.title || `Challenge ${quiz.no}`,
      author: {
        name: info.author?.name || 'Unknown',
        email: info.author?.email,
        github: info.author?.github || '',
      },
      tags: info.tags || [],
      related: info.related || [],
      readme: quiz.readme,
      template: quiz.template,
      testCases: quiz.tests || '',
      formattedTemplate,
      tsconfig: info.tsconfig,
    }
  })

  // Sort challenges by id
  challenges.sort((a, b) => a.id - b.id)

  // Load utils types
  const utilsPath = path.resolve(__dirname, '../../utils/index.d.ts')
  const utils = await fs.readFile(utilsPath, 'utf-8')

  // Build manifest
  const manifest: WebManifest = {
    challenges,
    tags: Array.from(tagsSet).sort(),
    stats: {
      total: challenges.length,
      byDifficulty: statsByDifficulty as Record<Difficulty, number>,
    },
    utils,
  }

  // Write to file
  const outputPath = path.resolve(__dirname, '../data/challenges.json')
  await fs.ensureDir(path.dirname(outputPath))
  await fs.writeJSON(outputPath, manifest, { spaces: 2 })

  console.log(`✓ Manifest generated at ${outputPath}`)
  console.log(`  📊 Stats:`)
  console.log(`    Total: ${manifest.stats.total}`)
  console.log(`    Tags: ${manifest.tags.length}`)
  console.log(`    Difficulties:`)
  Object.entries(manifest.stats.byDifficulty).forEach(([difficulty, count]) => {
    if (count > 0) {
      console.log(`      ${difficulty}: ${count}`)
    }
  })
}

generateManifest().catch((error) => {
  console.error('❌ Error generating manifest:', error)
  process.exit(1)
})
