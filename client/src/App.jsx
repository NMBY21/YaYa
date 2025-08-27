import React, { useEffect, useMemo, useState } from 'react'
import { getTransactions, searchTransactions } from './api'
import Pagination from './components/Pagination'
import SearchBar from './components/SearchBar'
import TransactionTable from './components/TransactionTable'

function useQueryParam(name, defaultValue='') {
  const params = new URLSearchParams(window.location.search)
  const [value, setValue] = useState(params.get(name) || defaultValue)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (value === '' || value == null) p.delete(name); else p.set(name, value)
    const newUrl = window.location.pathname + '?' + p.toString()
    window.history.replaceState({}, '', newUrl)
  }, [name, value])
  return [value, setValue]
}

export default function App() {
  const [pageParam, setPageParam] = useQueryParam('p', '1')
  const [searchTerm, setSearchTerm] = useQueryParam('q', '')
  const [currentAccount, setCurrentAccount] = useQueryParam('acct', '')
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [disableNext, setDisableNext] = useState(false)

  const title = useMemo(() => searchTerm ? 'Search Results' : 'Transactions', [searchTerm])

  async function load() {
    try {
      setLoading(true); setError('')
      const fn = searchTerm ? () => searchTransactions(searchTerm, page) : () => getTransactions(page)
      const data = await fn()
      setItems(data.items || [])
      setDisableNext((data.items || []).length < 10)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, searchTerm])

  return (
    <div className="container">
      <div className={'card ' + (loading ? 'loading' : '')}>
        <div className="header">
          <h1>{title}</h1>
          <div className="controls">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input type="text" placeholder="Current Account Name (for Incoming/Outgoing)" value={currentAccount} onChange={e => setCurrentAccount(e.target.value)} />
            </form>
          </div>
        </div>

        <SearchBar initialQuery={searchTerm} onSearch={(q) => { setPageParam('1'); setSearchTerm(q) }} />

        {error && <div className="error">{error}</div>}

        <TransactionTable items={items} currentAccount={currentAccount} />

        <Pagination page={page} onChange={(p) => setPageParam(String(p))} disabledNext={disableNext} />
      </div>
    </div>
  )
}
