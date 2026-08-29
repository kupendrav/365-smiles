'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/30">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
          Something went wrong
        </h2>
        <p className="text-white/70 mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-pink-600 px-6 py-2.5 font-semibold hover:bg-pink-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="rounded-lg bg-white/10 px-6 py-2.5 hover:bg-white/15 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
