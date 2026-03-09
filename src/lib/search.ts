import MiniSearch from 'minisearch'

import { createSnippet } from './content'
import type { SearchDocument, SearchResultItem } from '../types'

export function buildSearchIndex(documents: SearchDocument[]): MiniSearch<SearchDocument> {
  const index = new MiniSearch<SearchDocument>({
    fields: ['text'],
    storeFields: ['id', 'chapterId', 'order', 'text'],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
    },
  })

  index.addAll(documents)
  return index
}

export function serializeIndex(index: MiniSearch<SearchDocument>): string {
  return JSON.stringify(index.toJSON())
}

export function loadSerializedIndex(serialized: string): MiniSearch<SearchDocument> {
  return MiniSearch.loadJSON<SearchDocument>(serialized, {
    fields: ['text'],
    storeFields: ['id', 'chapterId', 'order', 'text'],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
    },
  })
}

export function searchIndex(
  index: MiniSearch<SearchDocument>,
  query: string,
  limit = 40,
): SearchResultItem[] {
  const hits = index.search(query, {
    prefix: true,
    fuzzy: 0.2,
    combineWith: 'AND',
  })

  return hits.slice(0, limit).map((hit) => {
    const text = typeof hit.text === 'string' ? hit.text : ''
    const chapterId = typeof hit.chapterId === 'string' ? hit.chapterId : ''
    const id = typeof hit.id === 'string' ? hit.id : ''
    const order = typeof hit.order === 'number' ? hit.order : 0

    return {
      id,
      chapterId,
      order,
      score: hit.score,
      snippet: createSnippet(text, query),
    }
  })
}
