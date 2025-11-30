"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminEmergencyNeed() {
  const router = useRouter();
  interface EmergencyItem {
    id: string;
    title: string;
    source_url: string | null;
    platform: string | null;
    read: boolean;
  }

  const [items, setItems] = useState<EmergencyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/emergencyneed", { cache: "no-store" });
      const json = await res.json();
      setItems(json.data || []);
    } catch {
      setMessage("Failed to load emergency needs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/emergencyneed", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    fetchItems();
  };

  const markAllRead = async () => {
    await fetch('/api/emergencyneed', { method: 'PUT' });
    fetchItems();
  }

  const triggerPoll = async () => {
    setPolling(true);
    setMessage(null);
    try {
      const res = await fetch("/api/emergencyneed/poll", { method: "POST" });
      const json = await res.json();
      setMessage(`Inserted: ${json.inserted?.length || 0}, Duplicates: ${json.duplicates?.length || 0}`);
      fetchItems();
    } catch (e) {
      setMessage("Failed to trigger poll: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setPolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold">Admin — Emergency Needs</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="rounded-lg bg-gray-800 text-white px-4 py-2">Dashboard</button>
          </div>
        </div>

        {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Regional Emergency News (Last 7 Days)</h2>
            <div className="flex items-center gap-2">
              <button onClick={triggerPoll} disabled={polling} className="rounded bg-red-600 text-white px-3 py-1 text-xs hover:bg-red-700">
                {polling ? 'Polling…' : 'Trigger Poll'}
              </button>
              <button onClick={markAllRead} className="rounded bg-emerald-700 text-white px-3 py-1 text-xs hover:bg-emerald-800">Mark All Read</button>
            </div>
          </div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">No news found.</div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {!it.read && <span className="text-[10px] text-red-600 font-semibold">UNREAD</span>}
                        {it.platform && <span className="text-[10px] text-gray-500">{it.platform}</span>}
                      </div>
                      <div className="text-sm font-semibold text-gray-800 line-clamp-2 mt-1">{it.title}</div>
                      {it.source_url && (
                        <a href={it.source_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 underline mt-1 inline-block">Open source</a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!it.read && <button onClick={() => markRead(it.id)} className="bg-emerald-600 text-white rounded px-3 py-1 text-xs">Mark read</button>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
