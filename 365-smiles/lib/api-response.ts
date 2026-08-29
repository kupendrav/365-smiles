import { NextResponse } from 'next/server';

/**
 * Standardized API response helpers.
 * All API routes should use these for consistent response format.
 */

export function apiSuccess<T>(data?: T, status = 200) {
  return NextResponse.json({ success: true, ...((data && typeof data === 'object') ? data : { data }) }, { status });
}

export function apiError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status }
  );
}

export function apiRateLimited(retryAfter: number) {
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    }
  );
}
