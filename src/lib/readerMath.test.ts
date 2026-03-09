import {
  buildChapterPageMap,
  chapterProgressToGlobalPage,
  convertLocatorMode,
  globalPageToLocator,
  pageToChapter,
  totalPages,
} from './readerMath'

describe('readerMath', () => {
  const chapters = [
    { chapterId: 'c1', order: 0, text: 'a'.repeat(1800) },
    { chapterId: 'c2', order: 1, text: 'b'.repeat(1200) },
    { chapterId: 'c3', order: 2, text: 'c'.repeat(900) },
  ]

  it('builds cumulative chapter page map', () => {
    const map = buildChapterPageMap(chapters, 600)
    expect(map).toHaveLength(3)
    expect(map[0].pages).toBe(3)
    expect(map[0].startGlobalPage).toBe(1)
    expect(map[1].startGlobalPage).toBe(4)
    expect(totalPages(map)).toBe(7)
  })

  it('maps global page to chapter and local page', () => {
    const map = buildChapterPageMap(chapters, 600)
    expect(pageToChapter(1, map)).toEqual({ chapterId: 'c1', localPage: 1 })
    expect(pageToChapter(4, map)).toEqual({ chapterId: 'c2', localPage: 1 })
    expect(pageToChapter(7, map)).toEqual({ chapterId: 'c3', localPage: 2 })
  })

  it('converts between locator mode while preserving progress fields', () => {
    const locator = {
      bookId: 'b1',
      chapterId: 'c1',
      chapterProgress: 0.42,
      globalProgress: 0.3,
      mode: 'scroll' as const,
    }

    const converted = convertLocatorMode(locator, 'pagination')
    expect(converted.mode).toBe('pagination')
    expect(converted.chapterProgress).toBe(locator.chapterProgress)
    expect(converted.globalProgress).toBe(locator.globalProgress)
  })

  it('maps chapter progress to global page and back to locator', () => {
    const map = buildChapterPageMap(chapters, 600)
    const page = chapterProgressToGlobalPage('c2', 0.5, map)
    expect(page).toBeGreaterThanOrEqual(4)

    const locator = globalPageToLocator(page, 'b1', 'pagination', map)
    expect(locator.bookId).toBe('b1')
    expect(locator.chapterId).toBe('c2')
    expect(locator.mode).toBe('pagination')
  })
})
