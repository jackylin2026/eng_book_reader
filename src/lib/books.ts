import { db } from './db'
import type { BookRecord, BookmarkRecord, ChapterRecord, Locator, TocItem } from '../types'

export async function listBooks(): Promise<BookRecord[]> {
  return db.books.orderBy('lastOpenedAt').reverse().toArray()
}

export async function getBook(bookId: string): Promise<BookRecord | undefined> {
  return db.books.get(bookId)
}

export async function getBookChapters(bookId: string): Promise<ChapterRecord[]> {
  const chapters = await db.chapters.where('bookId').equals(bookId).toArray()
  return chapters.sort((a, b) => a.order - b.order)
}

export async function getBookToc(bookId: string): Promise<TocItem[]> {
  const toc = await db.toc.get(bookId)
  return toc?.toc ?? []
}

export async function getBookLocator(bookId: string): Promise<Locator | undefined> {
  return (await db.progress.get(bookId))?.locator
}

export async function saveBookLocator(bookId: string, locator: Locator): Promise<void> {
  await db.progress.put({
    bookId,
    locator,
    updatedAt: new Date().toISOString(),
  })

  const book = await db.books.get(bookId)
  if (book) {
    await db.books.put({
      ...book,
      lastOpenedAt: new Date().toISOString(),
    })
  }
}

export async function listBookmarks(bookId: string): Promise<BookmarkRecord[]> {
  return db.bookmarks.where('bookId').equals(bookId).reverse().sortBy('createdAt')
}

export async function addBookmark(
  bookId: string,
  locator: Locator,
  note?: string,
): Promise<BookmarkRecord> {
  const bookmark: BookmarkRecord = {
    id: `${bookId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    bookId,
    locator,
    note,
    createdAt: new Date().toISOString(),
  }
  await db.bookmarks.put(bookmark)
  return bookmark
}

export async function removeBookmark(bookmarkId: string): Promise<void> {
  await db.bookmarks.delete(bookmarkId)
}
