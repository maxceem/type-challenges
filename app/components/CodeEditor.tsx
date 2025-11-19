'use client'

import { useCallback, useEffect, useRef } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import type { editor, IDisposable } from 'monaco-editor'
import { useEditor } from '@/lib/editor-context'
import { useTheme } from '@/lib/theme-context'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  utilsTypes?: string
  enableHover?: boolean
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  utilsTypes,
  enableHover = false
}: CodeEditorProps) {
  const { editorRef, runWithSuppressedModelChange, updateDiagnostics } = useEditor()
  const { resolvedTheme } = useTheme()
  const monacoRef = useRef<Monaco | null>(null)
  const utilsLibRef = useRef<IDisposable[]>([])
  const editorValueRef = useRef(value)
  const markerListenerRef = useRef<IDisposable | null>(null)
  const modelUriRef = useRef<string | null>(null)
  const readOnlyLineRef = useRef(0)
  const decorationsRef = useRef<string[]>([])
  const contentChangeListenerRef = useRef<IDisposable | null>(null)

  const disposeUtilsLibs = useCallback(() => {
    utilsLibRef.current.forEach(disposable => disposable.dispose())
    utilsLibRef.current = []
  }, [])

  const registerUtilsTypes = useCallback((monaco: Monaco) => {
    disposeUtilsLibs()

    if (!utilsTypes)
      return

    const moduleWrappedTypes = `declare module '@type-challenges/utils' {\n${utilsTypes}\n}`

    utilsLibRef.current = [
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        utilsTypes,
        'file:///utils.ts',
      ),
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        moduleWrappedTypes,
        'file:///node_modules/@type-challenges/utils/index.d.ts',
      ),
    ]
  }, [disposeUtilsLibs, utilsTypes])

  // Configure Monaco and TypeScript
  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco

    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2019,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      strict: true,
      noImplicitReturns: true,
      skipLibCheck: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      noLib: false,
      lib: ['es2019', 'dom'],
      allowNonTsExtensions: true,
      baseUrl: 'file:///',
      paths: {
        '@type-challenges/utils': ['node_modules/@type-challenges/utils/index.d.ts'],
      },
    })

    // Add utils types if provided
    registerUtilsTypes(monaco)

    // Disable default TypeScript diagnostics since we're running our own checker
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
  }

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    editorValueRef.current = editor.getValue()
    const model = editor.getModel()
    modelUriRef.current = model?.uri.toString() ?? null

    markerListenerRef.current?.dispose()
    markerListenerRef.current = monaco.editor.onDidChangeMarkers(uris => {
      const targetUri = modelUriRef.current
      if (!targetUri)
        return
      const hasTarget = uris.some(uri => uri.toString() === targetUri)
      if (!hasTarget)
        return

      const markers = monaco.editor.getModelMarkers({ resource: model?.uri })
      const severity = monaco.MarkerSeverity
      const errors = markers
        .filter(marker => marker.severity === severity.Error)
        .map(marker => ({
          file: 'editor',
          line: marker.startLineNumber,
          character: marker.startColumn,
          length: marker.endColumn - marker.startColumn,
          message: marker.message,
          code: typeof marker.code === 'number'
            ? marker.code
            : typeof marker.code === 'string'
              ? Number.parseInt(marker.code, 10) || 0
              : typeof marker.code === 'object' && marker.code && 'value' in marker.code
                ? Number.parseInt(String((marker.code as { value?: string }).value), 10) || 0
                : 0,
        }))
      updateDiagnostics(errors)
    })

    // Add read-only protection listener
    contentChangeListenerRef.current?.dispose()
    contentChangeListenerRef.current = editor.onDidChangeModelContent((e) => {
      if (e.isUndoing || e.isRedoing || e.isFlush) return

      const limit = readOnlyLineRef.current
      if (limit > 0 && e.changes.some(change => change.range.startLineNumber <= limit)) {
        Promise.resolve().then(() => {
          editor.trigger('readonly', 'undo', null)
        })
      }
    })

    // Initial decoration application
    updateReadOnlyDecorations(editor, monaco, editor.getValue())
  }

  const updateReadOnlyDecorations = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco, code: string) => {
    const lines = code.split('\n')
    let limit = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Your Code')) {
        limit = i + 1
        break
      }
    }

    readOnlyLineRef.current = limit

    if (limit > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(1, 1, limit, 1000),
          options: {
            isWholeLine: true,
            inlineClassName: 'opacity-60 cursor-not-allowed',
            className: 'cursor-not-allowed' 
          }
        }
      ])
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])
    }
  }, [])

  const handleEditorChange = useCallback((val?: string) => {
    const nextValue = val ?? ''
    editorValueRef.current = nextValue
    onChange(nextValue)
  }, [onChange])

  useEffect(() => {
    if (!monacoRef.current)
      return

    registerUtilsTypes(monacoRef.current)
  }, [registerUtilsTypes])

  useEffect(() => () => {
    disposeUtilsLibs()
    markerListenerRef.current?.dispose()
    contentChangeListenerRef.current?.dispose()
  }, [disposeUtilsLibs])

  useEffect(() => {
    if (!editorRef.current)
      return
    if (value === editorValueRef.current)
      return

    const editorInstance = editorRef.current
    const model = editorInstance.getModel()
    if (!model)
      return

    runWithSuppressedModelChange(() => {
      editorValueRef.current = value
      model.setValue(value)
      editorInstance.setScrollPosition({ scrollTop: 0, scrollLeft: 0 })
      
      // Re-apply decorations after content update
      if (monacoRef.current) {
        updateReadOnlyDecorations(editorInstance, monacoRef.current, value)
      }
    })
  }, [editorRef, runWithSuppressedModelChange, value, updateReadOnlyDecorations])

  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        defaultValue={value}
        onChange={handleEditorChange}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: true,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: !readOnly,
          renderWhitespace: 'selection',
          hover: { enabled: enableHover },
          bracketPairColorization: { enabled: true },
          colorDecorators: false,
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </div>
  )
}
