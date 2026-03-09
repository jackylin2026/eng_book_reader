import type { BookmarkRecord } from '../types'

interface BookmarksPanelProps {
  bookmarks: BookmarkRecord[]
  onOpen: (bookmark: BookmarkRecord) => void
  onDelete: (bookmarkId: string) => Promise<void>
}

export function BookmarksPanel({ bookmarks, onOpen, onDelete }: BookmarksPanelProps) {
  return (
    <section className="card bookmarks-panel">
      <h3>Bookmarks</h3>
      <ul className="bookmarks-list">
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id}>
            <button className="bookmark-open" onClick={() => onOpen(bookmark)}>
              Chapter {bookmark.locator.chapterId}
            </button>
            <span>{new Date(bookmark.createdAt).toLocaleString()}</span>
            <button className="danger ghost" onClick={() => void onDelete(bookmark.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
