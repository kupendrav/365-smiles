export default function CalendarLoading() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#A36BFF] via-[#F08AD1] to-[#FFC1A3] p-6 md:p-10 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full border-2 border-white border-t-transparent animate-spin mb-4" />
        <p className="text-white/80 text-lg">Loading calendar...</p>
      </div>
    </div>
  );
}
