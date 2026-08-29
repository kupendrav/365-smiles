'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type CheckResult = {
  exists: boolean;
  donorName?: string;
};

export function DonateClient() {
  const params = useSearchParams();
  const date = params.get('date') ?? '';
  const router = useRouter();

  // Block state
  const [blocked, setBlocked] = useState<CheckResult>({ exists: false });
  const [checking, setChecking] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [refId, setRefId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Check if date already sponsored
  useEffect(() => {
    if (!date) {
      setChecking(false);
      return;
    }
    fetch(`/api/check-donation?date=${date}`)
      .then((res) => res.json())
      .then((res: CheckResult) => setBlocked(res))
      .catch(() => setBlocked({ exists: false }))
      .finally(() => setChecking(false));
  }, [date]);

  if (checking) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black text-white grid place-items-center">
        <video
          src="/donate.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 z-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <p className="relative z-10 text-center text-lg md:text-xl">
          Checking availability…
        </p>
      </div>
    );
  }

  if (blocked.exists) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden text-white">
        <video
          src="/donate.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 z-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/70" />
        <main className="relative z-10 max-w-lg mx-auto p-6 mt-20 text-center">
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-8 shadow-2xl">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-3">
              📅 {date} is Already Sponsored
            </h1>
            <p className="text-white/80 mb-6">
              This day is in{' '}
              <span className="font-semibold">{blocked.donorName}</span>
              &apos;s birthday celebration! Please pick another date.
            </p>
            <button
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 px-6 py-2.5 font-semibold text-white hover:opacity-95 active:scale-[0.99] transition"
              onClick={() => router.push('/calendar')}
            >
              Back to Calendar
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    // Client-side validation
    if (!name.trim() || !email.trim() || !amount.trim()) {
      setErr('Please fill in all required fields.');
      return;
    }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      setErr('Please enter a valid positive amount.');
      return;
    }
    if (!file) {
      setErr('Please upload a payment screenshot.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('amount', amount.trim());
    formData.append('refId', refId.trim());
    formData.append('file', file);
    formData.append('date', date);

    try {
      const res = await fetch('/api/submit-donation', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErr(data?.error || 'Something went wrong.');
        return;
      }

      toast.success('Thank you! Your certificate will be emailed shortly.');
      router.push('/thank-you');
    } catch (e: unknown) {
      setLoading(false);
      const errorMessage =
        e instanceof Error ? e.message : 'Unknown error';
      setErr('Network error: ' + errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Background video */}
      <video
        src="/donate.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/70" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-12">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            Donate for {date}
          </h1>
          <p className="text-white/80 mt-1">
            Scan the code, make the UPI payment, and share the details to
            receive your certificate.
          </p>
        </div>

        {/* Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: QR & tips */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
            <div className="flex flex-col items-center">
              <Image
                src="/qr.png"
                alt="UPI QR Code for payment"
                width={220}
                height={220}
                className="rounded-lg"
              />
              <p className="mt-3 font-semibold">Scan and Pay</p>
              <ul className="mt-4 text-sm text-white/80 space-y-1.5">
                <li>• Use any UPI app to complete the payment.</li>
                <li>• Take a screenshot of the success screen.</li>
                <li>• Upload the screenshot in the form.</li>
              </ul>
            </div>
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <label className="block">
                <span className="block text-sm mb-1">Your Name *</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Full Name"
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">
                  Email Address *
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                  className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">
                  Amount Donated (INR) *
                </span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g. 501"
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">
                  UPI Reference ID
                </span>
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="UPI Ref / UTR"
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">
                  Upload Payment Screenshot *
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-3 file:py-2 file:text-white hover:file:bg-pink-700 cursor-pointer"
                />
              </label>

              {err && (
                <p
                  className="text-sm text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-lg px-3 py-2"
                  role="alert"
                >
                  {err}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 py-2.5 font-semibold hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit & Receive Certificate'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/calendar')}
                className="w-full rounded-full border border-white/20 bg-white/5 py-2.5 font-semibold text-white/90 hover:bg-white/10 active:scale-[0.99] transition"
              >
                Back to Calendar
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
