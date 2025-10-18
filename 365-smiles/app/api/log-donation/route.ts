import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { homeName, amount, date, notes } = await req.json() as {
      homeName: string;
      amount: number;
      date: string;
      notes?: string;
    };

    const { error } = await supabase.from('donation-logs').insert({
      home_name: homeName,
      amount,
      date,
      notes,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: Error | unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ERROR] Log Donation:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
