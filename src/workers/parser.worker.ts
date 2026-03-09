/// <reference lib="webworker" />

import { initKf8File, initMobiFile } from '@lingo-reader/mobi-parser'

import { classifyParseError, parseFormat } from '../lib/importValidation'
import type {
  BookRecord,
  ParseError,
  ParseRequest,
  ParseSuccess,
  ParsedChapterPayload,
  TocItem,
} from '../types'

function toTocItems(raw: unknown): TocItem[] {
  if (!Array.isArray(raw)) return []

  const walk = (items: unknown[]): TocItem[] => {
    const output: TocItem[] = []

    items.forEach((item) => {
      if (!item || typeof item !== 'object') return
      const label = String((item as { label?: unknown }).label ?? 'Untitled')
      const href = String((item as { href?: unknown }).href ?? '')
      const childrenRaw = (item as { children?: unknown }).children
      const tocItem: TocItem = { label, href }
      if (Array.isArray(childrenRaw)) {
        tocItem.children = walk(childrenRaw)
      }
      output.push(tocItem)
    })

    return output
  }

  return walk(raw)
}

self.onmessage = async (event: MessageEvent<ParseRequest>) => {
  const data = event.data
  if (data.type !== 'PARSE_BOOK') return

  try {
    const format = parseFormat(data.fileName)

    if (!format) {
      const error: ParseError = {
        type: 'PARSE_ERROR',
        code: 'UNSUPPORTED_FORMAT',
        message: 'Unsupported file type. Please import .mobi or .azw3 files.',
      }
      self.postMessage(error)
      return
    }

    self.postMessage({
      type: 'PARSE_PROGRESS',
      payload: { phase: 'metadata', completed: 0, total: 1 },
    })

    const parser =
      format === 'mobi'
        ? await initMobiFile(data.file)
        : await initKf8File(data.file)

    const metadataRaw = parser.getMetadata?.() ?? {}
    const spine = parser.getSpine?.() ?? []
    const toc = toTocItems(parser.getToc?.() ?? [])

    const titleRaw = (metadataRaw as { title?: unknown }).title
    const title = typeof titleRaw === 'string' && titleRaw.trim() ? titleRaw.trim() : data.fileName

    const authorsRaw = (metadataRaw as { author?: unknown }).author
    const authors = Array.isArray(authorsRaw)
      ? authorsRaw.map((v) => String(v)).filter((v) => v.trim())
      : []

    const languageRaw = (metadataRaw as { language?: unknown }).language
    const language = typeof languageRaw === 'string' && languageRaw.trim() ? languageRaw : undefined

    const chapters: ParsedChapterPayload[] = []
    const total = Array.isArray(spine) ? spine.length : 0

    for (let i = 0; i < total; i += 1) {
      const item = spine[i] as { id?: unknown }
      const chapterId = String(item.id ?? `chapter-${i}`)
      const loaded = parser.loadChapter?.(chapterId) as
        | { html?: unknown }
        | undefined
      const html = typeof loaded?.html === 'string' ? loaded.html : ''

      chapters.push({
        chapterId,
        order: i,
        title: `Chapter ${i + 1}`,
        html,
      })

      self.postMessage({
        type: 'PARSE_PROGRESS',
        payload: { phase: 'chapters', completed: i + 1, total },
      })
    }

    parser.destroy?.()

    const now = new Date().toISOString()
    const book: BookRecord = {
      id: data.bookId,
      title,
      authors,
      language,
      format,
      fileName: data.fileName,
      fileSize: data.file.size,
      importedAt: now,
      lastOpenedAt: now,
    }

    const initialLocator = {
      bookId: data.bookId,
      chapterId: chapters[0]?.chapterId ?? '',
      chapterProgress: 0,
      globalProgress: 0,
      mode: 'scroll' as const,
    }

    const success: ParseSuccess = {
      type: 'PARSE_SUCCESS',
      payload: {
        book,
        chapters,
        toc,
        initialLocator,
      },
    }

    self.postMessage({
      type: 'PARSE_PROGRESS',
      payload: { phase: 'finalize', completed: 1, total: 1 },
    })

    self.postMessage(success)
  } catch (error) {
    const classified = classifyParseError(error)
    const response: ParseError = {
      type: 'PARSE_ERROR',
      code: classified.code,
      message: classified.message,
    }
    self.postMessage(response)
  }
}

export {}
