"use client";
import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center justify-center px-4 py-16">
      {!success ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-lg w-full bg-gray-800/90 p-8 rounded-xl shadow-lg backdrop-blur-md"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Thank you for your Donation!</h1>

          {error && (
            <p className="mb-4 text-red-400 font-semibold text-center">{error}</p>
          )}

          <label className="block mb-4">
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

          <label className="block mb-4">
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

          <label className="block mb-6">
            <span className="block mb-1 font-semibold">Upload Image (Optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-pink-500 px-6 py-3 font-semibold hover:bg-pink-600 disabled:opacity-60 transition"
          >
            {uploading ? "Submitting..." : "Submit"}
          </button>
        </form>
      ) : (
        <div className="text-center max-w-md px-4">
          <h2 className="text-4xl font-bold mb-4 text-pink-400">Thank You!</h2>
          <p className="text-lg mb-8">Your donation information was successfully saved.</p>
          <p className="text-white/70">Redirecting to homepage shortly...</p>
        </div>
      )}
    </div>
  );
}
