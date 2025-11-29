"use client";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ThankYou() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid name and positive amount.");
      return;
    }

    setUploading(true);

    let imageUrl = null;
    if (imageFile) {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("public-donations")
        .upload(fileName, imageFile);

      if (uploadError) {
        setError("Image upload failed. Please try again.");
        setUploading(false);
        return;
      }

      // Get public URL of uploaded image
      imageUrl = supabase.storage.from("public-donations").getPublicUrl(uploadData.path).data.publicUrl;
    }

    // Insert donor record into public-donations table
    const { error: insertError } = await supabase
      .from("public-donations")
      .insert({
        name: name.trim(),
        amount: Number(amount),
        message: message.trim() || null,
        image_url: imageUrl,
      });

    if (insertError) {
      setError("Failed to save donation info. Please try again.");
      setUploading(false);
      return;
    }

    setUploading(false);
    setSuccess(true);

    // Optionally redirect after a delay
    setTimeout(() => router.push("/"), 4000);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files[0]) {
      setImageFile(files[0]);
    }
  }

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white flex flex-col items-center justify-center px-4 py-16">
      {!success ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl w-full bg-gray-800/90 p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-pink-500/15 ring-1 ring-pink-500/30">
              <span className="text-2xl">🙏</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Thank you!</h1>
            <p className="mt-2 text-white/70 max-w-prose">
              Please fill your details to show up on our website. This helps us
              acknowledge your contribution and inspire others.
            </p>
          </div>

          {error && (
            <p className="mb-4 text-red-400 font-semibold text-center">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
            <span className="block mb-1 font-semibold">Name *</span>
            <input
              type="text"
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-pink-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={uploading}
            />
            </label>

            <label className="block">
            <span className="block mb-1 font-semibold">Amount Donated (₹) *</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-pink-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={uploading}
            />
            </label>
          </div>

          <label className="block mb-4">
            <span className="block mb-1 font-semibold">Message (Optional)</span>
            <textarea
              rows={3}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-pink-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={uploading}
            />
          </label>

          <div className="mb-6">
            <label className="block">
              <span className="block mb-1 font-semibold">Upload Image (Optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
            </label>
            {previewUrl && (
              <div className="mt-3 flex items-center gap-4">
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="h-16 w-16 rounded-md object-cover ring-1 ring-white/20"
                />
                <p className="text-sm text-white/60">We may feature this on our donors gallery.</p>
              </div>
            )}
          </div>

          <p className="text-xs text-white/50 mb-4">
            By submitting, you agree to display your name, donated amount and
            optional message on our public donors page.
          </p>

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 px-6 py-3 font-semibold hover:from-pink-600 hover:to-fuchsia-700 disabled:opacity-60 transition shadow-lg shadow-pink-500/20"
          >
            {uploading ? "Submitting..." : "Submit"}
          </button>

          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <a
              href="/"
              className="text-white/70 hover:text-white underline underline-offset-4"
            >
              Go to homepage
            </a>
            <span className="text-white/30">•</span>
            <a
              href="/recentdonars"
              className="text-white/70 hover:text-white underline underline-offset-4"
            >
              View recent donors
            </a>
          </div>
        </form>
      ) : (
        <div className="text-center max-w-md px-4">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-green-500/15 ring-1 ring-green-500/30">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-3 text-pink-400">Thank You!</h2>
          <p className="text-lg mb-4">Your details have been saved successfully.</p>
          <p className="text-white/70 mb-6">Redirecting to homepage shortly...</p>

          <div className="flex items-center justify-center gap-3">
            <a
              href="/"
              className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/15 transition"
            >
              Go Home
            </a>
            <a
              href="/recentdonars"
              className="rounded-lg bg-pink-500 px-4 py-2 hover:bg-pink-600 transition"
            >
              See Donors
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
