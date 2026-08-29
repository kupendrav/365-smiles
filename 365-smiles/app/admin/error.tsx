'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-300">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Admin Error
        </h2>
        <p className="text-gray-600 mb-6">
          Something went wrong in the admin panel. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-gray-900 text-white px-6 py-2.5 font-semibold hover:bg-gray-800 transition"
          >
            Try Again
          </button>
          <a
            href="/admin/frontpage"
            className="rounded-lg bg-gray-200 text-gray-900 px-6 py-2.5 hover:bg-gray-300 transition"
          >
            Admin Home
          </a>
        </div>
      </div>
    </div>
  );
}
