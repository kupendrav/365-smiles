import { z } from 'zod';

/** Sanitize a string: trim, collapse whitespace, limit length */
function sanitize(maxLen: number) {
  return z
    .string()
    .trim()
    .transform((s) => s.replace(/\s+/g, ' '))
    .pipe(z.string().max(maxLen));
}

export const donationSchema = z.object({
  name: sanitize(100),
  email: z.string().trim().email('Invalid email address').max(254),
  amount: z.coerce.number().positive('Amount must be positive').max(10_000_000, 'Amount too large'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().or(z.literal('')),
  refId: sanitize(100).optional().or(z.literal('')),
  message: sanitize(500).optional().or(z.literal('')),
  type: z.enum(['education', 'medical-support', 'daily-needs', '']).optional(),
});

export const publicDonationSchema = z.object({
  name: sanitize(100),
  email: z.string().trim().email('Invalid email address').max(254),
  amount: z.coerce.number().positive('Amount must be positive').max(10_000_000),
  message: sanitize(500).optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  type: z.enum(['education', 'medical-support', 'daily-needs', '']).optional(),
});

export const logDonationSchema = z.object({
  homeName: sanitize(200),
  amount: z.coerce.number().positive('Amount must be positive').max(10_000_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: sanitize(1000).optional().or(z.literal('')),
});

export const emergencyRequestSchema = z.object({
  name: sanitize(100),
  address: sanitize(500),
  fundsFor: sanitize(200),
  amount: z.coerce.number().positive('Amount must be positive').max(10_000_000),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, 'Invalid account number'),
  ifsc: z
    .string()
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
});

export const emergencyApproveSchema = z.object({
  id: z.string().uuid('Invalid ID'),
  approved: z.boolean(),
});
