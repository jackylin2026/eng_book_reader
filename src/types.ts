export type BookFormat = 'mobi' | 'azw3' | 'kf8'

export interface TocItem {
  label: string
  href: string
  children?: TocItem[]
}

export interface BookRecord {
  id: string
  title: string
  authors: string[]
  language?: string
  format: BookFormat
  fileName: string
  fileSize: number
  importedAt: string
  coverBlobId?: string
  coverDataUrl?: string
  lastOpenedAt?: string
}

export interface ChapterRecord {
  bookId: string
  chapterId: string
  order: number
  title?: string
  html: string
  text: string
  estWordCount: number
}

export type ReadingMode = 'scroll' | 'pagination'

export interface Locator {
  bookId: string
  chapterId: string
  chapterProgress: number
  globalProgress: number
  mode: ReadingMode
  anchor?: string
}

export interface BookmarkRecord {
  id: string
  bookId: string
  locator: Locator
  note?: string
  createdAt: string
}

export interface ParsedChapterPayload {
  chapterId: string
  order: number
  title?: string
  html: string
}

export interface ParseBookPayload {
  book: BookRecord
  chapters: ParsedChapterPayload[]
  toc: TocItem[]
  initialLocator: Locator
}

export type ParseRequest = {
  type: 'PARSE_BOOK'
  file: File
  fileName: string
  bookId: string
}

export type ParseProgress = {
  type: 'PARSE_PROGRESS'
  payload: {
    phase: 'metadata' | 'chapters' | 'finalize'
    completed: number
    total: number
  }
}

export type ParseSuccess = {
  type: 'PARSE_SUCCESS'
  payload: ParseBookPayload
}

export type ParseErrorCode =
  | 'UNSUPPORTED_FORMAT'
  | 'DRM_OR_ENCRYPTED'
  | 'PARSE_FAILED'
  | 'FILE_TOO_LARGE'

export type ParseError = {
  type: 'PARSE_ERROR'
  code: ParseErrorCode
  message: string
}

export type ParseWorkerResponse = ParseProgress | ParseSuccess | ParseError

export interface SearchDocument {
  id: string
  bookId: string
  chapterId: string
  order: number
  text: string
}

export interface SearchResultItem {
  id: string
  chapterId: string
  order: number
  score: number
  snippet: string
}

export interface ReaderPreferences {
  fontFamily: string
  fontSize: number
  lineHeight: number
  horizontalPadding: number
  theme: 'light' | 'sepia' | 'dark'
}

export interface ReaderProgressRecord {
  bookId: string
  locator: Locator
  updatedAt: string
}

export interface SearchIndexRecord {
  bookId: string
  serialized: string
}
