'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import * as idb from '@/lib/indexeddb'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [isHydrated, setIsHydrated] = useState(false)

  // Load theme from IndexedDB on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await idb.getSetting('theme') as Theme | undefined
        if (savedTheme) {
          setThemeState(savedTheme)
        }
      } catch (error) {
        console.error('Error loading theme:', error)
      } finally {
        setIsHydrated(true)
      }
    }
    loadTheme()
  }, [])

  // Update resolved theme based on preference and system setting
  useEffect(() => {
    if (!isHydrated) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()
    mediaQuery.addEventListener('change', updateResolvedTheme)
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
  }, [theme, isHydrated])

  // Apply theme class to document
  useEffect(() => {
    if (!isHydrated) return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme, isHydrated])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      await idb.saveSetting('theme', newTheme)
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
