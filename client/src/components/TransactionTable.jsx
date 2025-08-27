import React from 'react'

function DirectionBadge({ sender, receiver, current }) {
  const isTopUp = sender && receiver && sender === receiver
  const incoming = isTopUp || (current && receiver && receiver.toLowerCase() === current.toLowerCase())
  return <span className={'badge ' + (incoming ? 'in' : 'out')}>{incoming ? 'Incoming' : 'Outgoing'}</span>
}

export default function TransactionTable({ items, currentAccount }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Sender</th>
          <th>Receiver</th>
          <th>Amount</th>
          <th>Currency</th>
          <th>Cause</th>
          <th>Created At</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {items.map((tx) => (
          <tr key={tx.id || Math.random()}>
            <td data-label="ID">{tx.id || '—'}</td>
            <td data-label="Sender">{tx.sender || '—'}</td>
            <td data-label="Receiver">{tx.receiver || '—'}</td>
            <td data-label="Amount">{tx.amount ?? '—'}</td>
            <td data-label="Currency">{tx.currency || '—'}</td>
            <td data-label="Cause">{tx.cause || '—'}</td>
            <td data-label="Created At">{tx.createdAt || '—'}</td>
            <td data-label="Type"><DirectionBadge sender={tx.sender} receiver={tx.receiver} current={currentAccount} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
