import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { homeName, amount, date, notes } = await req.json();

    const { error } = await supabase.from('donation-logs').insert({
      home_name: homeName,
      amount,
      date,
      notes,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[ERROR] Log Donation:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
