import { type ChangeEvent, useState } from 'react'

import { importBook } from '../lib/importBook'

interface BookImporterProps {
  onImported: (bookId: string) => void
  onRefresh: () => Promise<void>
}

export function BookImporter({ onImported, onRefresh }: BookImporterProps) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const onSelectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBusy(true)
    setError('')
    setProgress('Preparing import...')

    const result = await importBook(file, (p) => {
      if (p.phase === 'chapters') {
        setProgress(`Parsing chapters ${p.completed}/${p.total || 1}...`)
      } else if (p.phase === 'metadata') {
        setProgress('Reading book metadata...')
      } else {
        setProgress('Finalizing import...')
      }
    })

    setBusy(false)

    if (!result.ok) {
      setError(result.message ?? 'Import failed')
      setProgress('')
      event.target.value = ''
      return
    }

    await onRefresh()
    setProgress(result.duplicated ? 'Book already exists. Opened existing copy.' : 'Import complete.')

    if (result.bookId) onImported(result.bookId)

    event.target.value = ''
  }

  return (
    <section className="card import-card">
      <h2>Import Ebook</h2>
      <p>Supported formats: .mobi and .azw3 (KF8), up to 100MB.</p>
      <label className="file-input-label" aria-disabled={busy}>
        <span>{busy ? 'Importing...' : 'Choose ebook file'}</span>
        <input
          disabled={busy}
          type="file"
          accept=".mobi,.azw3"
          onChange={onSelectFile}
        />
      </label>
      {progress && <p className="status-line">{progress}</p>}
      {error && <p className="error-line">{error}</p>}
    </section>
  )
}
