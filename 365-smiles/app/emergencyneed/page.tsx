"use client";
import { useState } from 'react';
// Image import removed (not used currently)

interface FormState {
  name: string;
  address: string;
  fundsFor: string;
  amount: string;
  mobile: string;
  accountNumber: string;
  ifsc: string;
  photo?: File | null;
}

export default function EmergencyNeedRequestPage() {
  const [form, setForm] = useState<FormState>({
    name: '', address: '', fundsFor: '', amount: '', mobile: '', accountNumber: '', ifsc: '', photo: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!form.name.trim() || !form.address.trim() || !form.fundsFor.trim() || !form.amount.trim() || !form.mobile.trim() || !form.accountNumber.trim() || !form.ifsc.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    const amt = Number(form.amount);
    if (isNaN(amt) || amt <= 0) { setError('Amount must be a positive number.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('address', form.address.trim());
      fd.append('fundsFor', form.fundsFor.trim());
      fd.append('amount', form.amount.trim());
      fd.append('mobile', form.mobile.trim());
      fd.append('accountNumber', form.accountNumber.trim());
      fd.append('ifsc', form.ifsc.trim());
      if (form.photo) fd.append('photo', form.photo);
      const res = await fetch('/api/emergency-request', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error || 'Submission failed'); setSubmitting(false); return; }
      setSuccess('Request submitted. Awaiting admin approval.');
      setSubmitting(false);
      setForm({ name: '', address: '', fundsFor: '', amount: '', mobile: '', accountNumber: '', ifsc: '', photo: null });
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white">
      <main className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Request Emergency Support</h1>
        <p className="text-white/80 mb-10 max-w-2xl">If you are an old age home representative or someone in urgent need of funds for essential support, fill this form. Our team reviews and publishes verified needs for community assistance.</p>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
          {error && <div className="text-sm text-red-400">{error}</div>}
          {success && <div className="text-sm text-emerald-400">{success}</div>}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm flex flex-col gap-1">Name *
              <input className="rounded bg-black/40 border border-white/20 px-3 py-2" disabled={submitting} value={form.name} onChange={e=>update('name', e.target.value)} />
            </label>
            <label className="text-sm flex flex-col gap-1">Mobile Number *
              <input className="rounded bg-black/40 border border-white/20 px-3 py-2" disabled={submitting} value={form.mobile} onChange={e=>update('mobile', e.target.value)} />
            </label>
            <label className="md:col-span-2 text-sm flex flex-col gap-1">Address *
              <textarea rows={3} className="rounded bg-black/40 border border-white/20 px-3 py-2" disabled={submitting} value={form.address} onChange={e=>update('address', e.target.value)} />
            </label>
            <label className="md:col-span-2 text-sm flex flex-col gap-1">Funds Needed For *
              <input className="rounded bg-black/40 border border-white/20 px-3 py-2" disabled={submitting} value={form.fundsFor} onChange={e=>update('fundsFor', e.target.value)} placeholder="Medical treatment, ration kits, repairs..." />
            </label>
            <label className="text-sm flex flex-col gap-1">Amount (₹) *
              <input type="number" min={1} className="rounded bg-black/40 border border-white/20 px-3 py-2" disabled={submitting} value={form.amount} onChange={e=>update('amount', e.target.value)} />
            </label>
            <div className="text-sm bg-black/30 border border-white/10 rounded p-3 flex flex-col gap-2">
              <span className="font-medium">Bank Details *</span>
              <label className="flex flex-col gap-1">Account Number
                <input className="rounded bg-black/40 border border-white/20 px-3 py-2" disabled={submitting} value={form.accountNumber} onChange={e=>update('accountNumber', e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">IFSC Code
                <input className="rounded bg-black/40 border border-white/20 px-3 py-2" disabled={submitting} value={form.ifsc} onChange={e=>update('ifsc', e.target.value)} />
              </label>
            </div>
            <label className="md:col-span-2 text-sm flex flex-col gap-1">Optional Photo (supporting)
              <input type="file" accept="image/*" disabled={submitting} onChange={e=>update('photo', e.target.files?.[0] || null)} />
            </label>
          </div>
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-pink-600 py-3 font-semibold hover:bg-pink-700 transition disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Request'}</button>
        </form>
      </main>
    </div>
  );
}
