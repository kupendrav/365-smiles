export default function DonateLoading() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white grid place-items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/70" />
      <div className="relative z-10 text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-4" />
        <p className="text-white/70 text-lg">Loading donation form...</p>
      </div>
    </div>
  );
}
