'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { EditorProvider, useEditor } from '@/lib/editor-context'
import { CodeEditor } from '@/components/CodeEditor'

interface PersistentEditorProps {
  utilsTypes: string
}

function PersistentEditor({ utilsTypes }: PersistentEditorProps) {
  const { currentCode, handleEditorChange } = useEditor()
  const pathname = usePathname()
  const isChallengePage = pathname?.startsWith('/challenge/')

  if (!isChallengePage) {
    return null
  }

  return (
    <main className="flex-1 bg-gray-800 overflow-hidden">
      <div className="h-full">
        <CodeEditor
          value={currentCode}
          onChange={handleEditorChange}
          utilsTypes={utilsTypes}
          enableHover={true}
        />
      </div>
    </main>
  )
}

interface EditorStateManagerProps {
  utilsTypes: string
  children: ReactNode
}

function EditorStateManager({ utilsTypes, children }: EditorStateManagerProps) {
  return (
    <>
      {children}
      <PersistentEditor utilsTypes={utilsTypes} />
    </>
  )
}

interface MainLayoutClientProps {
  children: ReactNode
  utilsTypes: string
}

export function MainLayoutClient({ children, utilsTypes }: MainLayoutClientProps) {
  return (
    <EditorProvider>
      <EditorStateManager utilsTypes={utilsTypes}>
        {children}
      </EditorStateManager>
    </EditorProvider>
  )
}
