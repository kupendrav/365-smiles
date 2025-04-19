'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

    const res = await fetch('/api/log-donation', {
      method: 'POST',
      body: JSON.stringify({ homeName, amount, date, notes }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert('Something went wrong: ' + data.error);
      return;
    }

    alert('Donation logged successfully!');
    router.push('/admin/dashboard');
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">📄 Log Donation to a Trust</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Home/Trust Name"
          value={homeName}
          onChange={(e) => setHomeName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Amount Donated (INR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Logging...' : 'Log Donation'}
        </button>
      </form>
    </main>
  );
}
