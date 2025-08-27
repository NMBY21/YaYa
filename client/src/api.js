export async function getTransactions(page = 1) {
  const res = await fetch(`/api/transactions?p=${page}`)
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function searchTransactions(query, page = 1) {
  const res = await fetch(`/api/transactions/search?p=${page}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error || `Failed: ${res.status}`
    throw new Error(typeof err?.details === 'string' ? `${msg}: ${err.details}` : msg)
  }
  return res.json()
}
