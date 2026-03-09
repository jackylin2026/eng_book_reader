import Dexie, { type Table } from 'dexie'

import type {
  BookRecord,
  BookmarkRecord,
  ChapterRecord,
  ReaderProgressRecord,
  SearchIndexRecord,
  TocItem,
} from '../types'

export interface TocRecord {
  bookId: string
  toc: TocItem[]
}

class ReaderDatabase extends Dexie {
  books!: Table<BookRecord, string>
  chapters!: Table<ChapterRecord, [string, number]>
  toc!: Table<TocRecord, string>
  bookmarks!: Table<BookmarkRecord, string>
  progress!: Table<ReaderProgressRecord, string>
  searchIndexes!: Table<SearchIndexRecord, string>

  constructor() {
    super('eng-book-reader-db')

    this.version(1).stores({
      books: 'id, title, lastOpenedAt, importedAt',
      chapters: '[bookId+order], bookId, chapterId',
      toc: 'bookId',
      bookmarks: 'id, bookId, createdAt',
      progress: 'bookId, updatedAt',
      searchIndexes: 'bookId',
    })
  }
}

export const db = new ReaderDatabase()

export async function deleteBookCascade(bookId: string): Promise<void> {
  await db.books.delete(bookId)
  await db.toc.delete(bookId)
  await db.progress.delete(bookId)
  await db.searchIndexes.delete(bookId)
  await db.chapters.where('bookId').equals(bookId).delete()
  await db.bookmarks.where('bookId').equals(bookId).delete()
}
