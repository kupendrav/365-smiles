import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) {
    return NextResponse.json({ exists: false });
  }

  const { data, error } = await supabase
    .from('donations')
    .select('name')
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('check-donation error:', error);
    return NextResponse.json({ exists: false });
  }

  if (data) {
    return NextResponse.json({
      exists: true,
      donorName: data.name,
      date,
    });
  }

  return NextResponse.json({ exists: false });
}
