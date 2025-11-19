'use client'

import Link from 'next/link'
import { CloudCog, Link as LinkIcon } from 'lucide-react'

export function HomeContent() {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          TypeScript Type Challenges
        </h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            This is a free, open-source playground with manually curated collection of TypeScript type challenges, designed to help you master TypeScript&apos;s powerful type system.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
            Features
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <CloudCog className="w-5 h-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
              <span>Your progress is stored locally in your browser.</span>
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
            Links
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <LinkIcon className="w-5 h-5 flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
              <a
                  href="https://github.com/type-challenges/type-challenges"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  https://github.com/type-challenges/type-challenges
                </a> - main repository with challenges
            </li>
            <li className="flex items-start gap-2">
              <LinkIcon className="w-5 h-5 flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
              <a
                  href="https://github.com/maxceem/type-challenges"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  https://github.com/maxceem/type-challenges
                </a> - fork of the main repository with this UI playground
            </li>
            <li className="flex items-start gap-2">
              <LinkIcon className="w-5 h-5 flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
                <a
                  href="https://discord.gg/UgKBCq9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Discord
                </a> - community discord
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
