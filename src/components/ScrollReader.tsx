import { type CSSProperties, useEffect, useRef } from 'react'

import { clamp01 } from '../lib/readerMath'
import type { ChapterRecord, Locator, ReaderPreferences } from '../types'

interface ScrollReaderProps {
  bookId: string
  chapters: ChapterRecord[]
  locator?: Locator
  prefs: ReaderPreferences
  onLocatorChange: (locator: Locator) => void
}

export function ScrollReader({
  bookId,
  chapters,
  locator,
  prefs,
  onLocatorChange,
}: ScrollReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastInternalLocatorRef = useRef<Locator | undefined>(undefined)
  const lastEmittedLocatorRef = useRef<Locator | undefined>(undefined)
  const rafIdRef = useRef<number | undefined>(undefined)

  const isSameLocator = (a?: Locator, b?: Locator): boolean => {
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

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const computeAndEmit = () => {
      const scrollTop = container.scrollTop
      const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight)
      const globalProgress = clamp01(scrollTop / maxScroll)

      const chapterElements = Array.from(
        container.querySelectorAll<HTMLElement>('[data-chapter-id]'),
      )

      const middle = container.clientHeight * 0.35
      const current =
        chapterElements.find((el) => {
          const top = el.offsetTop - scrollTop
          const bottom = top + el.offsetHeight
          return top <= middle && bottom >= middle
        }) ?? chapterElements[0]

      const chapterId = current?.dataset.chapterId ?? chapters[0]?.chapterId ?? ''
      const chapterProgress = current
        ? clamp01((scrollTop - current.offsetTop + middle) / Math.max(1, current.offsetHeight))
        : 0

      const nextLocator: Locator = {
        bookId,
        chapterId,
        chapterProgress,
        globalProgress,
        mode: 'scroll',
      }

      const previous = lastEmittedLocatorRef.current
      const sameChapter = previous?.chapterId === nextLocator.chapterId
      const globalDelta = Math.abs((previous?.globalProgress ?? -1) - nextLocator.globalProgress)
      const chapterDelta = Math.abs(
        (previous?.chapterProgress ?? -1) - nextLocator.chapterProgress,
      )

      // Avoid noisy update churn from tiny scroll/DOM shifts (e.g. image load or reflow).
      if (sameChapter && globalDelta < 0.003 && chapterDelta < 0.02) {
        return
      }

      lastInternalLocatorRef.current = nextLocator
      lastEmittedLocatorRef.current = nextLocator
      onLocatorChange(nextLocator)
    }

    const onScroll = () => {
      if (rafIdRef.current !== undefined) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = undefined
        computeAndEmit()
      })
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    computeAndEmit()

    return () => {
      container.removeEventListener('scroll', onScroll)
      if (rafIdRef.current !== undefined) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [bookId, chapters, onLocatorChange])

  useEffect(() => {
    if (!locator || locator.mode !== 'scroll') return
    const container = containerRef.current
    if (!container) return
    if (isSameLocator(lastInternalLocatorRef.current, locator)) return

    let targetScrollTop = container.scrollTop

    if (locator.chapterId) {
      const target = container.querySelector<HTMLElement>(`[data-chapter-id="${locator.chapterId}"]`)
      if (target) {
        const chapterOffset = target.offsetTop
        const offset = chapterOffset + locator.chapterProgress * target.offsetHeight - 80
        targetScrollTop = Math.max(0, offset)
      } else {
        const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight)
        targetScrollTop = locator.globalProgress * maxScroll
      }
    } else {
      const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight)
      targetScrollTop = locator.globalProgress * maxScroll
    }

    // Only snap when external request is meaningfully different from current position.
    if (Math.abs(container.scrollTop - targetScrollTop) > 80) {
      container.scrollTop = targetScrollTop
    }
  }, [locator])

  return (
    <div
      className="reader-scroll-container"
      ref={containerRef}
      style={{
        '--reader-font-family': prefs.fontFamily,
        '--reader-font-size': `${prefs.fontSize}px`,
        '--reader-line-height': String(prefs.lineHeight),
        '--reader-padding-x': `${prefs.horizontalPadding}px`,
      } as CSSProperties}
    >
      {chapters.map((chapter) => (
        <article
          key={chapter.chapterId}
          data-chapter-id={chapter.chapterId}
          className="chapter-scroll"
        >
          <header className="chapter-heading">{chapter.title || `Chapter ${chapter.order + 1}`}</header>
          <div dangerouslySetInnerHTML={{ __html: chapter.html }} />
        </article>
      ))}
    </div>
  )
}
