"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export function MedicineSupportClient() {
  const params = useSearchParams();
  const date = params.get("date") ?? "";
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !amount.trim()) {
      setError("Please enter name, email, and amount.");
      return;
    }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!file) {
      setError("Please upload a screenshot of the QR code payment.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("amount", amount.trim());
    formData.append("message", message.trim());
    if (date) formData.append("date", date);
    formData.append("file", file);

    try {
      const res = await fetch("/api/public-donations", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      alert("Thank you! Your certificate will be emailed shortly.");
      router.push("/thank-you");
    } catch (err) {
      setError("Network error: " + (err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <video
        src="/medicine-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover opacity-50"
      />
      <main className="relative z-10 max-w-4xl mx-auto p-6 mt-24 sm:mt-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Support Medical Care with 365 Smiles
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12">
          365 Smiles ensures that no one is denied essential healthcare due to poverty. We provide diagnostic services, essential medicines, medical devices, and emergency treatments to vulnerable populations. Your contribution brings hope and healing to families in crisis.
        </p>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="mb-10 rounded-full bg-pink-500 px-8 py-4 text-lg font-semibold hover:bg-pink-600 transition focus:outline-none"
          aria-expanded={showForm}
          aria-controls="donation-form"
        >
          {showForm ? "Hide Donation Form" : "Donate Now"}
        </button>

        {showForm && (
          <form
            id="donation-form"
            onSubmit={handleSubmit}
            className="bg-black/70 p-8 rounded-xl max-w-xl mx-auto shadow-lg"
          >
            {error && <p className="mb-4 text-red-400 font-semibold">{error}</p>}

            {/* QR Code Image */}
            <div className="mb-6 flex justify-center">
              <Image src="/qr.png" alt="Scan QR code to pay" width={160} height={160} className="w-40 h-40 object-contain" />
            </div>

            <label className="block mb-4 text-left">
              <span className="block mb-1 font-semibold">Name *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              />
            </label>

            <label className="block mb-4 text-left">
              <span className="block mb-1 font-semibold">Email *</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              />
            </label>

            <label className="block mb-4 text-left">
              <span className="block mb-1 font-semibold">Amount (₹) *</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={submitting}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              />
            </label>

            <label className="block mb-4 text-left">
              <span className="block mb-1 font-semibold">Message (Optional)</span>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              />
            </label>

            <label className="block mb-6 text-left">
              <span className="block mb-1 font-semibold">Upload QR Code Screenshot *</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
                disabled={submitting}
                className="w-full text-white"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-pink-600 py-3 font-semibold hover:bg-pink-700 transition disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit Donation"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
