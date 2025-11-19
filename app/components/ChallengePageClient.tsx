'use client'

import { useState, useEffect, useCallback, startTransition, useRef } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { useProgress } from '@/lib/progress-context'
import { extractUserCode, insertUserCode } from '@/lib/format-challenge'
import type { Challenge } from '@/types/challenges'
import { useEditor } from '@/lib/editor-context'

interface ChallengePageClientProps {
  challenge: Challenge
}

export function ChallengePageClient({ challenge }: ChallengePageClientProps) {
  const { getCode, save, reset, getStatus, isHydrated } = useProgress()
  const { updateEditorContent, subscribeToChanges, diagnostics, diagnosticsVersion, resetDiagnostics } = useEditor()
  const [code, setCode] = useState('')
  const [hasChecked, setHasChecked] = useState(false)
  const getCodeRef = useRef(getCode)
  const lastProcessedDiagnosticsRef = useRef(0)
  const diagnosticsVersionRef = useRef(diagnosticsVersion)
  const isDirtyRef = useRef(false)

  useEffect(() => {
    getCodeRef.current = getCode
  }, [getCode])

  useEffect(() => {
    diagnosticsVersionRef.current = diagnosticsVersion
  }, [diagnosticsVersion])

  // Load saved code or template and update editor whenever the challenge changes
  useEffect(() => {
    const savedCode = getCodeRef.current(challenge.id)
    const userCode = savedCode || challenge.template

    startTransition(() => {
      setCode(userCode)
      setHasChecked(false)
    })

    isDirtyRef.current = false
    resetDiagnostics()
    lastProcessedDiagnosticsRef.current = diagnosticsVersionRef.current

    const combinedCode = insertUserCode(challenge.formattedTemplate, userCode)
    updateEditorContent(combinedCode, challenge.id)
  }, [challenge.id, challenge.template, challenge.formattedTemplate, resetDiagnostics, updateEditorContent, isHydrated])

  // Subscribe to code changes from the persistent editor
  useEffect(() => {
    const unsubscribe = subscribeToChanges((newCode: string) => {
      isDirtyRef.current = true
      const userCode = extractUserCode(newCode)
      setCode(userCode)

      const hasChanged = userCode !== challenge.template
      const currentStatus = getStatus(challenge.id)
      if (hasChanged && currentStatus !== 'completed') {
        save(challenge.id, userCode, 'in-progress')
      }
    })

    return unsubscribe
  }, [challenge.id, challenge.template, getStatus, save, subscribeToChanges])

  const handleReset = useCallback(async () => {
    const userCode = challenge.template
    setCode(userCode)
    await reset(challenge.id)
    setHasChecked(false)
    isDirtyRef.current = false
    resetDiagnostics()
    lastProcessedDiagnosticsRef.current = diagnosticsVersionRef.current

    const combinedCode = insertUserCode(challenge.formattedTemplate, userCode)
    updateEditorContent(combinedCode, challenge.id)
  }, [challenge.formattedTemplate, challenge.id, challenge.template, reset, resetDiagnostics, updateEditorContent])

  // React to editor diagnostics to determine completion state
  useEffect(() => {
    if (diagnosticsVersion === lastProcessedDiagnosticsRef.current)
      return

    lastProcessedDiagnosticsRef.current = diagnosticsVersion
    startTransition(() => {
      setHasChecked(true)
    })
    const hasErrors = diagnostics.length > 0
    const currentStatus = getStatus(challenge.id)

    if (!hasErrors) {
      if (code !== challenge.template && currentStatus !== 'completed') {
        save(challenge.id, code, 'completed')
      }
    } else if (currentStatus === 'completed' && isDirtyRef.current) {
      save(challenge.id, code, 'in-progress')
    }
  }, [challenge.id, challenge.template, code, diagnostics, diagnosticsVersion, getStatus, save])

  return (
    <EditorToolbar
      challenge={challenge}
      hasChecked={hasChecked}
      testErrors={diagnostics}
      onReset={handleReset}
    />
  )
}
