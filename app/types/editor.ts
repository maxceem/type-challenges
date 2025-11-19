export interface TypeCheckError {
  file: string
  line: number
  character: number
  length: number
  message: string
  code: number
}
