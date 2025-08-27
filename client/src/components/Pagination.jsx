import React from 'react'

export default function Pagination({ page, onChange, disabledNext = false }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
      <span style={{ color: '#9fb0d1' }}>Page {page}</span>
      <button onClick={() => onChange(page + 1)} disabled={disabledNext}>Next</button>
    </div>
  )
}
