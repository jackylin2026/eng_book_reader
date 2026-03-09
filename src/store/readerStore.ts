import { create } from 'zustand'

import type { Locator, ReadingMode, SearchResultItem } from '../types'

interface ReaderState {
  bookId?: string
  mode: ReadingMode
  locator?: Locator
  searchQuery: string
  searchResults: SearchResultItem[]
  setBookId: (bookId: string | undefined) => void
  setMode: (mode: ReadingMode) => void
  setLocator: (locator: Locator) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResultItem[]) => void
  clear: () => void
}

export const useReaderStore = create<ReaderState>((set) => ({
  mode: 'scroll',
  searchQuery: '',
  searchResults: [],
  setBookId: (bookId) => set({ bookId }),
  setMode: (mode) => set({ mode }),
  setLocator: (locator) => set({ locator }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  clear: () =>
    set({
      bookId: undefined,
      mode: 'scroll',
      locator: undefined,
      searchQuery: '',
      searchResults: [],
    }),
}))
