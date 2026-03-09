import { useState } from 'react'

import type { SearchResultItem } from '../types'

interface SearchPanelProps {
  results: SearchResultItem[]
  onSearch: (query: string) => Promise<void>
  onJumpToResult: (result: SearchResultItem) => void
}

export function SearchPanel({ results, onSearch, onJumpToResult }: SearchPanelProps) {
  const [query, setQuery] = useState('')

  return (
    <section className="card search-panel">
      <h3>Search</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void onSearch(query)
        }}
      >
        <div className="search-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this book"
          />
          <button type="submit">Find</button>
        </div>
      </form>
      <ul className="search-results">
        {results.map((result) => (
          <li key={result.id}>
            <button className="search-hit" onClick={() => onJumpToResult(result)}>
              <strong>Chapter {result.order + 1}</strong>
              <span>{result.snippet || 'No preview'}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
