import { db } from './db'
import { htmlToText, sanitizeHtml } from './content'
import { sha256File } from './hash'
import { parseEbookInWorker } from './parserClient'
import { validateImportFile } from './importValidation'
import { buildSearchIndex, serializeIndex } from './search'
import type {
  ChapterRecord,
  ParseErrorCode,
  ParseProgress,
  ParseWorkerResponse,
  SearchDocument,
} from '../types'

export interface ImportResult {
  ok: boolean
  bookId?: string
  duplicated?: boolean
  code?: ParseErrorCode
  message?: string
}

export async function importBook(
  file: File,
  onProgress?: (progress: ParseProgress['payload']) => void,
): Promise<ImportResult> {
  const validation = validateImportFile(file)

  if (!validation.ok) {
    return {
      ok: false,
      code: validation.errorCode,
      message: validation.errorMessage,
    }
  }

  const bookId = await sha256File(file)
  const existing = await db.books.get(bookId)
  if (existing) {
    return {
      ok: true,
      bookId,
      duplicated: true,
    }
  }

  try {
    const parseResult = await parseEbookInWorker(file, bookId, onProgress)
    const parsed = parseResult.payload

    const chapters: ChapterRecord[] = parsed.chapters.map((chapter) => {
      const sanitized = sanitizeHtml(chapter.html)
      const text = htmlToText(sanitized)
      const estWordCount = text ? text.split(/\s+/).length : 0

      return {
        bookId,
        chapterId: chapter.chapterId,
        order: chapter.order,
        title: chapter.title,
        html: sanitized,
        text,
        estWordCount,
      }
    })

    const docs: SearchDocument[] = chapters.map((chapter) => ({
      id: `${bookId}:${chapter.chapterId}`,
      bookId,
      chapterId: chapter.chapterId,
      order: chapter.order,
      text: chapter.text,
    }))

    const index = buildSearchIndex(docs)

    await db.books.put(parsed.book)
    await db.chapters.bulkPut(chapters)
    await db.toc.put({ bookId, toc: parsed.toc })
    await db.progress.put({
      bookId,
      locator: parsed.initialLocator,
      updatedAt: new Date().toISOString(),
    })
    await db.searchIndexes.put({
      bookId,
      serialized: serializeIndex(index),
    })

    return {
      ok: true,
      bookId,
      duplicated: false,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown import error'
    const maybeCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as ParseWorkerResponse & { code?: string }).code)
        : ''

    if (message.toLowerCase().includes('quota')) {
      return {
        ok: false,
        code: 'PARSE_FAILED',
        message:
          'Storage quota exceeded. Delete one or more books and try importing again.',
      }
    }

    return {
      ok: false,
      code: (maybeCode as ParseErrorCode) || 'PARSE_FAILED',
      message,
    }
  }
}
