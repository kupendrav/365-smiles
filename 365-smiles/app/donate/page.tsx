'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type CheckResult = {
  exists: boolean;
  donorName?: string;
};

export default function DonatePage() {
  const params = useSearchParams();
  const date = params.get('date')!;
  const router = useRouter();

  // --- Block state
  const [blocked, setBlocked] = useState<CheckResult>({ exists: false });
  const [checking, setChecking] = useState(true);

  // --- Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [refId, setRefId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ① On mount, check if date is already sponsored
  useEffect(() => {
    if (!date) return;
    fetch(`/api/check-donation?date=${date}`)
      .then((res) => res.json())
      .then((res: CheckResult) => setBlocked(res))
      .catch(() => setBlocked({ exists: false }))
      .finally(() => setChecking(false));
  }, [date]);

  // ② Show loading while checking
  if (checking) {
    return <p className="text-center mt-10">Checking availability…</p>;
  }

  // ③ If already sponsored, show message
  if (blocked.exists) {
    return (
      <main className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">
          📅 {date} is Already Sponsored
        </h1>
        <p className="mb-6">
          This day is in <strong>{blocked.donorName}</strong>’s birthday celebration!<br/>
          Please pick another date.
        </p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => router.push('/calendar')}
        >
          Back to Calendar
        </button>
      </main>
    );
  }

  // ④ Render UPI + form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('amount', amount);
    formData.append('refId', refId);
    if (file) formData.append('file', file);
    formData.append('date', date);

    const res = await fetch('/api/submit-donation', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      console.error('Server error:', data);
      alert(`Something went wrong: ${data?.error || 'Unknown error'}`);
      return;
    }

    alert('Thank you! Your certificate will be emailed shortly.');
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        Donate for {date}
      </h1>
      <div className="flex flex-col items-center">
        <Image src="/qr.png" alt="UPI QR" width={200} height={200} />
        <p className="mt-2 font-semibold text-center">Scan and Pay</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Amount Donated (INR)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="UPI Reference ID"
          value={refId}
          onChange={e => setRefId(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="file"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit & Receive Certificate'}
        </button>
      </form>
    </main>
  );
}
