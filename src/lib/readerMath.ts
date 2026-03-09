import type { ChapterRecord, Locator, ReadingMode } from '../types'

export interface ChapterPageMap {
  chapterId: string
  chapterOrder: number
  pages: number
  startGlobalPage: number
  endGlobalPage: number
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

export function estimateCharsPerPage(
  viewportWidth: number,
  viewportHeight: number,
  fontSize: number,
  lineHeight: number,
  horizontalPadding: number,
): number {
  const contentWidth = Math.max(320, viewportWidth - horizontalPadding * 2)
  const contentHeight = Math.max(320, viewportHeight - 160)
  const linePx = Math.max(1, fontSize * lineHeight)
  const charsPerLine = Math.max(20, Math.floor(contentWidth / Math.max(7, fontSize * 0.56)))
  const linesPerPage = Math.max(10, Math.floor(contentHeight / linePx))
  return Math.max(600, charsPerLine * linesPerPage)
}

export function buildChapterPageMap(
  chapters: Pick<ChapterRecord, 'chapterId' | 'order' | 'text'>[],
  charsPerPage: number,
): ChapterPageMap[] {
  let globalPage = 1

  return chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((chapter) => {
      const pages = Math.max(1, Math.ceil(chapter.text.length / Math.max(1, charsPerPage)))
      const startGlobalPage = globalPage
      const endGlobalPage = startGlobalPage + pages - 1
      globalPage = endGlobalPage + 1

      return {
        chapterId: chapter.chapterId,
        chapterOrder: chapter.order,
        pages,
        startGlobalPage,
        endGlobalPage,
      }
    })
}

export function totalPages(pageMap: ChapterPageMap[]): number {
  if (pageMap.length === 0) return 1
  return pageMap[pageMap.length - 1].endGlobalPage
}

export function pageToChapter(
  globalPage: number,
  pageMap: ChapterPageMap[],
): { chapterId: string; localPage: number } {
  if (pageMap.length === 0) {
    return { chapterId: '', localPage: 1 }
  }

  const clampedPage = Math.min(Math.max(globalPage, 1), totalPages(pageMap))
  const hit = pageMap.find((entry) => clampedPage <= entry.endGlobalPage) ?? pageMap[0]

  return {
    chapterId: hit.chapterId,
    localPage: clampedPage - hit.startGlobalPage + 1,
  }
}

export function chapterProgressToGlobalPage(
  chapterId: string,
  chapterProgress: number,
  pageMap: ChapterPageMap[],
): number {
  const chapter = pageMap.find((entry) => entry.chapterId === chapterId)
  if (!chapter) return 1

  const localPage = Math.max(1, Math.ceil(clamp01(chapterProgress) * chapter.pages))
  return Math.min(chapter.endGlobalPage, chapter.startGlobalPage + localPage - 1)
}

export function globalPageToLocator(
  globalPage: number,
  bookId: string,
  mode: ReadingMode,
  pageMap: ChapterPageMap[],
): Locator {
  if (pageMap.length === 0) {
    return {
      bookId,
      chapterId: '',
      chapterProgress: 0,
      globalProgress: 0,
      mode,
    }
  }

  const total = totalPages(pageMap)
  const clamped = Math.min(Math.max(globalPage, 1), total)
  const { chapterId, localPage } = pageToChapter(clamped, pageMap)
  const chapter = pageMap.find((entry) => entry.chapterId === chapterId) ?? pageMap[0]

  return {
    bookId,
    chapterId,
    chapterProgress: clamp01(localPage / chapter.pages),
    globalProgress: clamp01((clamped - 1) / Math.max(1, total - 1)),
    mode,
  }
}

export function convertLocatorMode(locator: Locator, mode: ReadingMode): Locator {
  if (locator.mode === mode) return locator
  return {
    ...locator,
    mode,
  }
}
