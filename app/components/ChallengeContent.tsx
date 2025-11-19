import { CodeEditor } from './CodeEditor'

interface ChallengeContentProps {
  combinedCode: string
  onCodeChange: (code: string) => void
  utilsTypes: string
}

export function ChallengeContent({ combinedCode, onCodeChange, utilsTypes }: ChallengeContentProps) {
  return (
    <main className="flex-1 bg-gray-800 overflow-hidden">
      <div className="h-full">
        <CodeEditor
          value={combinedCode}
          onChange={onCodeChange}
          utilsTypes={utilsTypes}
          enableHover={true}
        />
      </div>
    </main>
  )
}
