import type { BookRecord } from '../types'

interface BookshelfProps {
  books: BookRecord[]
  onOpen: (bookId: string) => void
  onDelete: (bookId: string) => Promise<void>
}

export function Bookshelf({ books, onOpen, onDelete }: BookshelfProps) {
  if (books.length === 0) {
    return (
      <section className="card">
        <h2>Bookshelf</h2>
        <p>No books imported yet.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Bookshelf</h2>
      <ul className="bookshelf-grid">
        {books.map((book) => (
          <li key={book.id} className="book-tile">
            <div className="book-meta">
              <h3 title={book.title}>{book.title}</h3>
              <p>{book.authors.join(', ') || 'Unknown author'}</p>
              <p>
                {book.format.toUpperCase()} · {(book.fileSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
            <div className="book-actions">
              <button onClick={() => onOpen(book.id)}>Open</button>
              <button className="danger" onClick={() => void onDelete(book.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
