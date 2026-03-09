import { db } from './db'
import { loadSerializedIndex, searchIndex } from './search'
import type { SearchResultItem } from '../types'

const inMemoryIndexes = new Map<string, ReturnType<typeof loadSerializedIndex>>()

export async function queryBookSearch(
  bookId: string,
  query: string,
  limit = 40,
): Promise<SearchResultItem[]> {
  const clean = query.trim()
  if (!clean) return []

  let index = inMemoryIndexes.get(bookId)

  if (!index) {
    const record = await db.searchIndexes.get(bookId)
    if (!record) return []

    index = loadSerializedIndex(record.serialized)
    inMemoryIndexes.set(bookId, index)
  }

  return searchIndex(index, clean, limit)
}

export function clearCachedSearchIndex(bookId: string): void {
  inMemoryIndexes.delete(bookId)
}
