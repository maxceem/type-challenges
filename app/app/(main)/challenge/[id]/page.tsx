import { PreserveParamsLink as Link } from '@/components/PreserveParamsLink'
import { ChallengePageClient } from '@/components/ChallengePageClient'
import { getChallengeById, getAllChallenges } from '@/lib/challenges'

export function generateStaticParams() {
  const challenges = getAllChallenges()
  return challenges.map(challenge => ({
    id: challenge.id.toString(),
  }))
}

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const challengeId = parseInt(id)
  const challenge = getChallengeById(challengeId)
  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Challenge not found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Back to challenges
          </Link>
        </div>
      </div>
    )
  }

  return <ChallengePageClient challenge={challenge} />
}
