'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LogDonationPage() {
  const router = useRouter();

  const [homeName, setHomeName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/log-donation', {
        method: 'POST',
        body: JSON.stringify({ homeName, amount, date, notes }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error('Something went wrong: ' + (data?.error || 'Unknown error'));
        return;
      }

      toast.success('Donation logged successfully!');
      router.push('/admin/donation-summary');
    } catch {
      setLoading(false);
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <button
            aria-label="Back to Admin Frontpage"
            onClick={() => router.push('/admin/frontpage')}
            className="h-10 w-10 grid place-items-center rounded-full bg-gray-900 text-white hover:bg-gray-800 active:scale-95 transition"
            title="Back"
          >
            ←
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
            Log Donation to a Trust
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/30 bg-white/50 backdrop-blur-xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm mb-1 text-gray-800">
                Home/Trust Name *
              </span>
              <input
                type="text"
                placeholder="Home/Trust Name"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                required
                maxLength={200}
                className="w-full rounded-lg bg-white/70 border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1 text-gray-800">
                Amount Donated (INR) *
              </span>
              <input
                type="number"
                min={1}
                placeholder="Amount Donated (INR)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg bg-white/70 border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1 text-gray-800">
                Date *
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg bg-white/70 border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1 text-gray-800">
                Notes (optional)
              </span>
              <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full rounded-lg bg-white/70 border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </label>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 py-2.5 font-semibold text-white hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Logging...' : 'Log Donation'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
