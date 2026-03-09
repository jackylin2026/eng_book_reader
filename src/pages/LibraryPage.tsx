import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BookImporter } from '../components/BookImporter'
import { Bookshelf } from '../components/Bookshelf'
import { listBooks } from '../lib/books'
import { deleteBookCascade } from '../lib/db'
import type { BookRecord } from '../types'

export function LibraryPage() {
  const [books, setBooks] = useState<BookRecord[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const refresh = async () => {
    try {
      const all = await listBooks()
      setBooks(all)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library')
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <div className="library-page">
      <BookImporter
        onRefresh={refresh}
        onImported={(bookId) => {
          navigate(`/reader/${bookId}`)
        }}
      />
      {error && <p className="error-line">{error}</p>}
      <Bookshelf
        books={books}
        onOpen={(bookId) => navigate(`/reader/${bookId}`)}
        onDelete={async (bookId) => {
          await deleteBookCascade(bookId)
          await refresh()
        }}
      />
    </div>
  )
}
