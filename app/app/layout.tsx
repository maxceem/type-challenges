import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ProgressProvider } from '@/lib/progress-context'
import { ThemeProvider } from '@/lib/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TypeScript Type Challenges',
  description: 'Practice TypeScript type challenges online with real-time feedback',
  icons: { icon: '/logo-small.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ProgressProvider>
            {children}
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

