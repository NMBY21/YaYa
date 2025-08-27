import React, { useState } from 'react'

export default function SearchBar({ initialQuery = '', onSearch }) {
  const [query, setQuery] = useState(initialQuery)
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(query) }} className="controls">
      <input type="text" placeholder="Search sender / receiver / cause / ID" value={query} onChange={e => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  )
}
