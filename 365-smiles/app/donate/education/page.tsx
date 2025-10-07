"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function EducationDonatePage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createSupabaseClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid name and positive amount.");
      return;
    }
    if (!file) {
      setError("Please upload a screenshot of the QR code payment.");
      return;
    }

    setSubmitting(true);

    // Upload the screenshot file
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("donation-screenshots")
      .upload(fileName, file);
    if (uploadError) {
      setError("Failed to upload screenshot. Please try again.");
      setSubmitting(false);
      return;
    }
    const screenshotUrl = supabase.storage.from("donation-screenshots").getPublicUrl(uploadData.path).data.publicUrl;

    // Insert donation record into Supabase
    const { error: insertError } = await supabase
      .from("public-donations")
      .insert({
        name: name.trim(),
        amount: Number(amount),
        message: message.trim() || null,
        image_url: screenshotUrl,
      });

    if (insertError) {
      setError("Failed to save donation details. Please try again.");
      setSubmitting(false);
      return;
    }

    // Call API to generate and send certificate (placeholder)
     await fetch('/api/submit-donation', { 
       method: 'POST', 
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         name: name.trim(),
         amount: Number(amount),
         message: message.trim() || null,
         image_url: screenshotUrl,
         cause: "education"
       })
     });

    setSubmitting(false);
    router.push("/thank-you");
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background video with 50% opacity */}
      <video
        src="/education-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover opacity-50"
      />

      <main className="relative z-10 max-w-4xl mx-auto p-6 mt-24 sm:mt-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Support Education with 365 Smiles
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12">
          365 Smiles is dedicated to transforming the lives of children and youth across India by providing scholarships, learning materials, digital devices, and mentorship programs. Your generous donation empowers dreams and builds brighter futures.
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
