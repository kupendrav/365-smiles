import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-pink-500/15 ring-1 ring-pink-500/30">
          <span className="text-5xl font-extrabold text-pink-500">404</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
          Page Not Found
        </h2>
        <p className="text-white/70 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-pink-600 px-6 py-2.5 font-semibold hover:bg-pink-700 transition"
          >
            Go Home
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg bg-white/10 px-6 py-2.5 hover:bg-white/15 transition"
          >
            Donate
          </Link>
        </div>
      </div>
    </div>
  );
}
