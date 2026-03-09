import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { BookmarksPanel } from '../components/BookmarksPanel'
import { PaginatedReader } from '../components/PaginatedReader'
import { ReaderControls } from '../components/ReaderControls'
import { ScrollReader } from '../components/ScrollReader'
import { SearchPanel } from '../components/SearchPanel'
import {
  addBookmark,
  getBook,
  getBookChapters,
  getBookLocator,
  getBookToc,
  listBookmarks,
  saveBookLocator,
  removeBookmark,
} from '../lib/books'
import { convertLocatorMode } from '../lib/readerMath'
import { queryBookSearch } from '../lib/searchQuery'
import { useReaderStore } from '../store/readerStore'
import { useUIStore } from '../store/uiStore'
import type {
  BookRecord,
  BookmarkRecord,
  ChapterRecord,
  Locator,
  ReadingMode,
  SearchResultItem,
  TocItem,
} from '../types'

function isSameLocator(a?: Locator, b?: Locator): boolean {
  if (!a || !b) return false
  const epsilon = 0.0001
  return (
    a.bookId === b.bookId &&
    a.chapterId === b.chapterId &&
    a.mode === b.mode &&
    Math.abs(a.chapterProgress - b.chapterProgress) < epsilon &&
    Math.abs(a.globalProgress - b.globalProgress) < epsilon &&
    (a.anchor ?? '') === (b.anchor ?? '')
  )
}

export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()

  const prefs = useUIStore((state) => state.prefs)
  const setFontSize = useUIStore((state) => state.setFontSize)
  const setLineHeight = useUIStore((state) => state.setLineHeight)
  const setHorizontalPadding = useUIStore((state) => state.setHorizontalPadding)
  const setTheme = useUIStore((state) => state.setTheme)

  const modeFromStore = useReaderStore((state) => state.mode)
  const setModeInStore = useReaderStore((state) => state.setMode)

  const [book, setBook] = useState<BookRecord | undefined>()
  const [chapters, setChapters] = useState<ChapterRecord[]>([])
  const [toc, setToc] = useState<TocItem[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([])
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [locator, setLocator] = useState<Locator | undefined>()
  const [error, setError] = useState('')

  const flushTimer = useRef<number | undefined>(undefined)

  const mode: ReadingMode = modeFromStore

  const handleLocatorChange = useCallback((next: Locator) => {
    setLocator((current) => (isSameLocator(current, next) ? current : next))
  }, [])

  const chapterById = useMemo(() => {
    const map = new Map<string, ChapterRecord>()
    chapters.forEach((chapter) => map.set(chapter.chapterId, chapter))
    return map
  }, [chapters])

  useEffect(() => {
    if (!bookId) {
      navigate('/library')
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const [loadedBook, loadedChapters, loadedToc, loadedLocator, loadedBookmarks] =
          await Promise.all([
            getBook(bookId),
            getBookChapters(bookId),
            getBookToc(bookId),
            getBookLocator(bookId),
            listBookmarks(bookId),
          ])

        if (cancelled) return

        if (!loadedBook) {
          setError('Book not found.')
          return
        }

        setBook(loadedBook)
        setChapters(loadedChapters)
        setToc(loadedToc)
        setBookmarks(loadedBookmarks)
        setLocator(
          loadedLocator ?? {
            bookId,
            chapterId: loadedChapters[0]?.chapterId ?? '',
            chapterProgress: 0,
            globalProgress: 0,
            mode,
          },
        )
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load reader data')
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [bookId, mode, navigate])

  useEffect(() => {
    if (!locator || !bookId) return

    if (flushTimer.current) window.clearTimeout(flushTimer.current)
    flushTimer.current = window.setTimeout(() => {
      void saveBookLocator(bookId, locator)
    }, 400)

    return () => {
      if (flushTimer.current) window.clearTimeout(flushTimer.current)
    }
  }, [bookId, locator])

  useEffect(() => {
    const flush = () => {
      if (bookId && locator) {
        void saveBookLocator(bookId, locator)
      }
    }

    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [bookId, locator])

  const handleModeChange = (nextMode: ReadingMode) => {
    setModeInStore(nextMode)
    setLocator((current) => (current ? convertLocatorMode(current, nextMode) : current))
  }

  const handleAddBookmark = async () => {
    if (!bookId || !locator) return
    await addBookmark(bookId, locator)
    setBookmarks(await listBookmarks(bookId))
  }

  const jumpToSearchResult = (result: SearchResultItem) => {
    if (!bookId) return

    setLocator({
      bookId,
      chapterId: result.chapterId,
      chapterProgress: 0,
      globalProgress: locator?.globalProgress ?? 0,
      mode,
    })
  }

  const jumpToToc = (item: TocItem) => {
    if (!bookId) return

    const target = chapters.find((chapter) => chapter.chapterId === item.href)
    if (!target) return

    setLocator({
      bookId,
      chapterId: target.chapterId,
      chapterProgress: 0,
      globalProgress: locator?.globalProgress ?? 0,
      mode,
    })
  }

  if (!bookId) return <p className="error-line">Missing book identifier.</p>

  if (error) {
    return (
      <section className="card">
        <p className="error-line">{error}</p>
        <Link to="/library">Back to library</Link>
      </section>
    )
  }

  return (
    <div className={`reader-page theme-${prefs.theme}`}>
      <section className="reader-header card">
        <div>
          <h2>{book?.title ?? 'Loading...'}</h2>
          <p>{book?.authors.join(', ') || 'Unknown author'}</p>
        </div>
        <Link to="/library">Back to library</Link>
      </section>

      <ReaderControls
        mode={mode}
        prefs={prefs}
        onModeChange={handleModeChange}
        onAddBookmark={handleAddBookmark}
        onFontSize={(delta) => setFontSize(prefs.fontSize + delta)}
        onLineHeight={(delta) => setLineHeight(prefs.lineHeight + delta)}
        onPadding={(delta) => setHorizontalPadding(prefs.horizontalPadding + delta)}
        onTheme={setTheme}
      />

      <div className="reader-body">
        <aside className="reader-side">
          <SearchPanel
            results={searchResults}
            onSearch={async (query) => {
              if (!bookId) return
              setSearchResults(await queryBookSearch(bookId, query))
            }}
            onJumpToResult={jumpToSearchResult}
          />

          <section className="card toc-panel">
            <h3>Table of Contents</h3>
            <ul>
              {toc.map((item, index) => (
                <li key={`${item.href}:${item.label}:${index}`}>
                  <button onClick={() => jumpToToc(item)}>{item.label}</button>
                </li>
              ))}
            </ul>
          </section>

          <BookmarksPanel
            bookmarks={bookmarks}
            onOpen={(bookmark) => setLocator(bookmark.locator)}
            onDelete={async (bookmarkId) => {
              await removeBookmark(bookmarkId)
              if (bookId) {
                setBookmarks(await listBookmarks(bookId))
              }
            }}
          />
        </aside>

        <section className="reader-main card">
          {mode === 'scroll' ? (
            <ScrollReader
              bookId={bookId}
              chapters={chapters}
              locator={locator}
              prefs={prefs}
              onLocatorChange={handleLocatorChange}
            />
          ) : (
            <PaginatedReader
              bookId={bookId}
              chapters={chapters}
              locator={locator}
              prefs={prefs}
              onLocatorChange={handleLocatorChange}
            />
          )}
        </section>
      </div>

      <section className="card reader-footer">
        <p>
          Current chapter: {chapterById.get(locator?.chapterId ?? '')?.title ?? locator?.chapterId ?? '-'}
        </p>
        <p>Progress: {Math.round((locator?.globalProgress ?? 0) * 100)}%</p>
      </section>
    </div>
  )
}
