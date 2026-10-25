'use client'
import { useState } from 'react'

export default function UnsubscribeForm({ token }: { token?: string }) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  async function unsubscribe() {
    setBusy(true)
    try {
      const res = await fetch('/api/newsletter/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
      setStatus('You have been unsubscribed.')
    } catch (err) { setStatus(err instanceof Error ? err.message : 'Could not connect. Please try again.') }
    finally { setBusy(false) }
  }
  if (!token) return <p>Use the unsubscribe link included with your subscription.</p>
  return <div className="tr-sec"><p>Stop receiving Applied Agentic AI updates.</p>{!done && <button className="tr-btn" type="button" disabled={busy} onClick={unsubscribe}>{busy ? 'Unsubscribing…' : 'Unsubscribe'}</button>}<p role="status">{status}</p></div>
}
