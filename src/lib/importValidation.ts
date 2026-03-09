import type { BookFormat, ParseErrorCode } from '../types'

export const MAX_FILE_BYTES = 100 * 1024 * 1024
const SUPPORTED_EXTENSIONS = ['mobi', 'azw3']

export interface ValidationResult {
  ok: boolean
  format?: BookFormat
  errorCode?: ParseErrorCode
  errorMessage?: string
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() ?? '' : ''
}

export function parseFormat(fileName: string): BookFormat | undefined {
  const ext = getFileExtension(fileName)
  if (ext === 'mobi') return 'mobi'
  if (ext === 'azw3') return 'azw3'
  return undefined
}

export function validateImportFile(file: File): ValidationResult {
  const format = parseFormat(file.name)

  if (!format || !SUPPORTED_EXTENSIONS.includes(getFileExtension(file.name))) {
    return {
      ok: false,
      errorCode: 'UNSUPPORTED_FORMAT',
      errorMessage: 'Unsupported file type. Please import .mobi or .azw3 files.',
    }
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: 'File is larger than 100MB. Please choose a smaller ebook.',
    }
  }

  return { ok: true, format }
}

export function classifyParseError(error: unknown): {
  code: ParseErrorCode
  message: string
} {
  const raw = error instanceof Error ? error.message : String(error)
  const normalized = raw.toLowerCase()

  if (normalized.includes('drm') || normalized.includes('encrypted') || normalized.includes('copyright')) {
    return {
      code: 'DRM_OR_ENCRYPTED',
      message:
        'This book appears to be DRM-protected or encrypted. Please use a non-DRM copy of the ebook.',
    }
  }

  if (normalized.includes('unsupported') || normalized.includes('format')) {
    return {
      code: 'UNSUPPORTED_FORMAT',
      message: 'Unsupported ebook format. Supported formats: .mobi and .azw3 (KF8).',
    }
  }

  return {
    code: 'PARSE_FAILED',
    message: 'Unable to parse this ebook. Try another MOBI/AZW3 file.',
  }
}
