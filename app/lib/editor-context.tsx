'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { editor as MonacoEditor } from 'monaco-editor'
import type { TypeCheckError } from '@/types/editor'

type CodeChangeCallback = (code: string) => void

interface EditorContextType {
  editorRef: React.MutableRefObject<MonacoEditor.IStandaloneCodeEditor | null>
  currentChallengeId: number | null
  updateEditorContent: (code: string, challengeId: number) => void
  currentCode: string
  diagnostics: TypeCheckError[]
  subscribeToChanges: (callback: CodeChangeCallback) => () => void
  diagnosticsVersion: number
  updateDiagnostics: (errors: TypeCheckError[]) => void
  resetDiagnostics: () => void
  handleEditorChange: (code: string) => void
  runWithSuppressedModelChange: (fn: () => void) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null)
  const [currentCode, setCurrentCode] = useState('')
  const [diagnostics, setDiagnosticsState] = useState<TypeCheckError[]>([])
  const [diagnosticsVersion, setDiagnosticsVersion] = useState(0)
  const subscribersRef = useRef(new Set<CodeChangeCallback>())
  const suppressChangeRef = useRef(0)

  const updateEditorContent = useCallback((code: string, challengeId: number) => {
    setCurrentChallengeId(challengeId)
    setCurrentCode(code)
  }, [])

  const subscribeToChanges = useCallback((callback: CodeChangeCallback) => {
    subscribersRef.current.add(callback)
    return () => {
      subscribersRef.current.delete(callback)
    }
  }, [])

  const runWithSuppressedModelChange = useCallback((fn: () => void) => {
    suppressChangeRef.current += 1
    try {
      fn()
    }
    finally {
      suppressChangeRef.current = Math.max(0, suppressChangeRef.current - 1)
    }
  }, [])

  const handleEditorChange = useCallback((code: string) => {
    if (suppressChangeRef.current > 0)
      return

    setCurrentCode(code)
    subscribersRef.current.forEach(callback => callback(code))
  }, [])

  const updateDiagnostics = useCallback((errors: TypeCheckError[]) => {
    setDiagnosticsState(errors)
    setDiagnosticsVersion(version => version + 1)
  }, [])

  const resetDiagnostics = useCallback(() => {
    setDiagnosticsState([])
  }, [])

  return (
    <EditorContext.Provider value={{
      editorRef,
      currentChallengeId,
      updateEditorContent,
      currentCode,
      diagnostics,
      subscribeToChanges,
      diagnosticsVersion,
      updateDiagnostics,
      resetDiagnostics,
      handleEditorChange,
      runWithSuppressedModelChange
    }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider')
  }
  return context
}
