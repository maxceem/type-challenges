'use client'

import { Suspense, type ComponentProps } from 'react'
import { useSearchParams } from 'next/navigation'
import NextLink from 'next/link'

// List of query params to preserve across navigation
const PRESERVED_PARAMS = ['difficulty'] as const

type PreserveLinkProps = ComponentProps<typeof NextLink> & { preserveParams?: boolean }

function LinkWithParams({ href, preserveParams = true, ...props }: PreserveLinkProps) {
  const searchParams = useSearchParams()

  // Build new href with preserved params
  const hrefWithParams = (() => {
    if (!preserveParams) {
      return href
    }

    // Handle both string and object href
    const baseHref = typeof href === 'string' ? href : href.pathname || '/'
    const existingParams = typeof href === 'object' ? href.query : {}

    // Parse existing URL to check if it already has query params
    const [pathname, existingSearch] = baseHref.split('?')
    const params = new URLSearchParams(existingSearch)

    // Check if href explicitly handles preserved params (includes them in the URL or sets them in query)
    const explicitlyHandled = new Set<string>()

    // If the href string contains any of the preserved params, mark as explicitly handled
    if (existingSearch) {
      PRESERVED_PARAMS.forEach(param => {
        if (params.has(param)) {
          explicitlyHandled.add(param)
        }
      })
    }

    // Add preserved params from current URL if not already explicitly handled in the target href
    PRESERVED_PARAMS.forEach(param => {
      const currentValue = searchParams.get(param)
      if (currentValue && !explicitlyHandled.has(param)) {
        params.set(param, currentValue)
      }
    })

    // Add any params from object-style href
    if (typeof href === 'object' && existingParams) {
      Object.entries(existingParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value))
        }
      })
    }

    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  })()

  return <NextLink href={hrefWithParams} {...props} />
}

export function PreserveParamsLink(props: PreserveLinkProps) {
  const { preserveParams, ...linkProps } = props
  return (
    <Suspense fallback={<NextLink {...linkProps} />}>
      <LinkWithParams preserveParams={preserveParams} {...linkProps} />
    </Suspense>
  )
}
