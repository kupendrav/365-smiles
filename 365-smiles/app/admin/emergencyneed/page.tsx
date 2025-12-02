"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EmergencyRequestRow {
  id: string
  name: string
  funds_for: string
  amount: number
  photo_url: string | null
  address: string
  mobile: string
  approved: boolean
  created_at?: string
}

export default function AdminEmergencyNeed() {
  const router = useRouter();
  const [rows, setRows] = useState<EmergencyRequestRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/emergency-request?all=1', { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed')
      setRows(json.data as EmergencyRequestRow[])
    } catch (e) {
      setError((e as Error).message)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function approve(id: string) {
    setUpdating(id)
    try {
      const res = await fetch('/api/emergency-request', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved: true }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Approve failed')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally { setUpdating(null) }
  }

  const pending = rows.filter(r => !r.approved)
  const approved = rows.filter(r => r.approved)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight">Admin — Emergency Requests</h1>
          <div className="flex gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="rounded-lg bg-gray-800 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 transition">Dashboard</button>
            <button onClick={load} disabled={loading} className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">{loading ? 'Refreshing…' : 'Refresh'}</button>
          </div>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {/* Pending Requests */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pending Approval ({pending.length})</h2>
          {pending.length === 0 ? <div className="text-xs text-gray-500">No pending requests.</div> : (
            <ul className="space-y-4">
              {pending.map(r => (
                <li key={r.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col md:flex-row gap-4">
                    {r.photo_url && <img src={r.photo_url} alt="support" className="w-28 h-28 object-cover rounded-md" />}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-semibold text-gray-800">{r.name} — ₹{r.amount}</div>
                      <div className="text-xs text-gray-700">For: {r.funds_for}</div>
                      <div className="text-xs text-gray-600 line-clamp-2">{r.address}</div>
                      <div className="text-xs text-gray-500">Mobile: {r.mobile}</div>
                      {r.created_at && <div className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleString('en-IN',{ hour12:false})}</div>}
                    </div>
                    <div className="flex flex-col gap-2 justify-between">
                      <button onClick={() => approve(r.id)} disabled={updating === r.id} className="px-3 py-2 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60">{updating === r.id ? 'Approving…' : 'Approve'}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Approved Requests */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Approved (Visible Public) ({approved.length})</h2>
          {approved.length === 0 ? <div className="text-xs text-gray-500">No approved requests yet.</div> : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {approved.map(r => (
                <li key={r.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {r.photo_url && <img src={r.photo_url} alt="support" className="w-full h-32 object-cover rounded-md mb-2" />}
                  <div className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">{r.name}</div>
                  <div className="text-xs text-gray-700 mb-1">For: {r.funds_for}</div>
                  <div className="text-xs text-gray-600 mb-1 line-clamp-2">{r.address}</div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500"><span>₹{r.amount}</span><span>{r.mobile}</span></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
