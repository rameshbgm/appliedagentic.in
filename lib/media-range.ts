export function parseMediaRange(header: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match || size < 1 || (!match[1] && !match[2])) return null
  const first = match[1] ? Number(match[1]) : null
  const last = match[2] ? Number(match[2]) : null
  if ((first !== null && !Number.isSafeInteger(first)) || (last !== null && !Number.isSafeInteger(last))) return null
  const start = first ?? Math.max(0, size - (last ?? 0))
  const end = first === null ? size - 1 : Math.min(last ?? size - 1, size - 1)
  return start < size && start <= end ? { start, end } : null
}
