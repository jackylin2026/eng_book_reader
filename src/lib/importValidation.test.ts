import {
  classifyParseError,
  MAX_FILE_BYTES,
  parseFormat,
  validateImportFile,
} from './importValidation'

describe('importValidation', () => {
  it('parses supported formats', () => {
    expect(parseFormat('book.mobi')).toBe('mobi')
    expect(parseFormat('book.azw3')).toBe('azw3')
    expect(parseFormat('book.epub')).toBeUndefined()
  })

  it('rejects unsupported files', () => {
    const file = new File(['x'], 'book.epub')
    const result = validateImportFile(file)
    expect(result.ok).toBe(false)
    expect(result.errorCode).toBe('UNSUPPORTED_FORMAT')
  })

  it('rejects oversized files', () => {
    const file = {
      name: 'book.mobi',
      size: MAX_FILE_BYTES + 1,
    } as File

    const result = validateImportFile(file)
    expect(result.ok).toBe(false)
    expect(result.errorCode).toBe('FILE_TOO_LARGE')
  })

  it('classifies drm-like parse errors', () => {
    const out = classifyParseError(new Error('book is DRM encrypted'))
    expect(out.code).toBe('DRM_OR_ENCRYPTED')
  })
})
