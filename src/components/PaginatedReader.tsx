import { type CSSProperties, useEffect, useMemo, useState } from 'react'

import {
  buildChapterPageMap,
  chapterProgressToGlobalPage,
  estimateCharsPerPage,
  globalPageToLocator,
  pageToChapter,
  totalPages,
} from '../lib/readerMath'
import type { ChapterRecord, Locator, ReaderPreferences } from '../types'

interface PaginatedReaderProps {
  bookId: string
  chapters: ChapterRecord[]
  locator?: Locator
  prefs: ReaderPreferences
  onLocatorChange: (locator: Locator) => void
}

function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}

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

export function PaginatedReader({
  bookId,
  chapters,
  locator,
  prefs,
  onLocatorChange,
}: PaginatedReaderProps) {
  const { width, height } = useWindowSize()
  const charsPerPage = estimateCharsPerPage(
    width,
    height,
    prefs.fontSize,
    prefs.lineHeight,
    prefs.horizontalPadding,
  )

  const pageMap = useMemo(
    () => buildChapterPageMap(chapters, charsPerPage),
    [chapters, charsPerPage],
  )

  const maxPage = totalPages(pageMap)
  const globalPage = useMemo(() => {
    if (!locator || locator.mode !== 'pagination') return 1
    const page = chapterProgressToGlobalPage(locator.chapterId, locator.chapterProgress, pageMap)
    return Math.min(Math.max(page, 1), maxPage)
  }, [locator, maxPage, pageMap])

  useEffect(() => {
    if (pageMap.length === 0) return
    const current = globalPageToLocator(globalPage, bookId, 'pagination', pageMap)
    if (!isSameLocator(locator, current)) {
      onLocatorChange(current)
    }
  }, [bookId, globalPage, locator, onLocatorChange, pageMap])

  const { chapterId, localPage } = pageToChapter(globalPage, pageMap)
  const chapter = chapters.find((item) => item.chapterId === chapterId) ?? chapters[0]

  const pageText = useMemo(() => {
    if (!chapter) return ''
    const start = (localPage - 1) * charsPerPage
    const end = Math.min(chapter.text.length, start + charsPerPage)
    return chapter.text.slice(start, end)
  }, [chapter, charsPerPage, localPage])

  const turnToPage = (targetPage: number) => {
    if (pageMap.length === 0) return
    const clamped = Math.min(Math.max(targetPage, 1), maxPage)
    const next = globalPageToLocator(clamped, bookId, 'pagination', pageMap)
    if (!isSameLocator(locator, next)) {
      onLocatorChange(next)
    }
  }

  return (
    <div
      className="reader-pagination"
      style={{
        '--reader-font-family': prefs.fontFamily,
        '--reader-font-size': `${prefs.fontSize}px`,
        '--reader-line-height': String(prefs.lineHeight),
        '--reader-padding-x': `${prefs.horizontalPadding}px`,
      } as CSSProperties}
    >
      <header className="chapter-heading">{chapter?.title || 'Chapter'}</header>
      <article className="pagination-page">{pageText || 'No content available.'}</article>
      <footer className="pagination-footer">
        <button onClick={() => turnToPage(globalPage - 1)}>Prev</button>
        <span>
          Page {Math.min(globalPage, maxPage)} / {maxPage}
        </span>
        <button onClick={() => turnToPage(globalPage + 1)}>Next</button>
      </footer>
    </div>
  )
}
