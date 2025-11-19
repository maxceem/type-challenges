import { PreserveParamsLink as Link } from '@/components/PreserveParamsLink'
import type { ReactNode } from 'react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import Image from 'next/image'

interface AppLayoutHeaderProps {
  children?: ReactNode
}

export function AppLayoutHeader({ children }: AppLayoutHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="TypeScript Type Challenges Home">
          <Image src="/logo.svg" alt="TypeScript Type Challenges Logo" width={238} height={50} className="dark:filter dark:invert" />
        </Link>
        <div className="flex items-center gap-4">
          {children}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
