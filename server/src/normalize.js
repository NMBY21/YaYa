
export function normalizeTransaction(tx) {
  const id = tx.id ?? tx.transaction_id ?? tx.tx_id ?? tx.reference ?? "";
  const sender =
    tx.sender?.account_name ??
    tx.sender_account_name ??
    tx.senderName ??
    tx.sender ??
    tx.from_account ??
    tx.from ??
    "";
  const receiver =
    tx.receiver?.account_name ??
    tx.receiver_account_name ??
    tx.receiverName ??
    tx.receiver ??
    tx.to_account ??
    tx.to ??
    "";
  const amountRaw = tx.amount ?? tx.value ?? tx.total ?? 0;
  const amount = typeof amountRaw === "string" ? parseFloat(amountRaw) : Number(amountRaw);
  const currency = tx.currency ?? tx.curr ?? tx.ccy ?? "ETB";
  const cause = tx.cause ?? tx.description ?? tx.note ?? "";
  const createdAt = tx.created_at ?? tx.createdAt ?? tx.timestamp ?? tx.time ?? tx.date ?? "";

  return { id, sender, receiver, amount, currency, cause, createdAt };
}

export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload.map(normalizeTransaction);
  if (payload?.data && Array.isArray(payload.data)) return payload.data.map(normalizeTransaction);
  if (payload?.items && Array.isArray(payload.items)) return payload.items.map(normalizeTransaction);
  if (payload && typeof payload === "object") return [normalizeTransaction(payload)];
  return [];
}
