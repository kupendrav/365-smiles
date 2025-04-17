import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const data = await req.json();

  const { name, email, amount, date } = data;

  const { error } = await supabase.from('donations').insert([
    { name, email, amount, date, status: 'pending' },
  ]);

  if (error) {
    console.error('Error saving donation:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
