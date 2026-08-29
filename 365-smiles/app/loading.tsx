export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-4" />
        <p className="text-white/70">Loading...</p>
      </div>
    </div>
  );
}
