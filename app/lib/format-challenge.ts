/**
 * Insert user code into the pre-formatted template
 */
export function insertUserCode(formattedTemplate: string, userCode: string): string {
  const lines = formattedTemplate.split('\n')

  // Find where user code starts (after "Your Code" divider)
  let insertIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Your Code')) {
      insertIndex = i + 1
      break
    }
  }

  if (insertIndex === -1) return formattedTemplate

  // Keep everything before the insertion point
  const before = lines.slice(0, insertIndex)

  return [...before, '', userCode.trim(), ''].join('\n')
}

/**
 * Extract user code from formatted code
 */
export function extractUserCode(formattedCode: string): string {
  const lines = formattedCode.split('\n')

  // Find where user code starts (after "Your Code" divider)
  let codeStartIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Your Code')) {
      codeStartIndex = i + 1
      break
    }
  }

  if (codeStartIndex === -1) return ''

  // Extract and clean user code (everything after the divider)
  return lines
    .slice(codeStartIndex)
    .join('\n')
    .trim()
}
