import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

// Expected Supabase table: emergency_requests
// Columns: id (uuid), name text, address text, funds_for text, amount numeric, mobile text,
// account_number text, ifsc text, photo_url text (nullable), approved boolean default false, created_at timestamptz default now()

async function parseForm(req: NextRequest) {
  const formData = await req.formData()
  const name = formData.get('name')?.toString().trim() || ''
  const address = formData.get('address')?.toString().trim() || ''
  const fundsFor = formData.get('fundsFor')?.toString().trim() || ''
  const amountStr = formData.get('amount')?.toString().trim() || ''
  const mobile = formData.get('mobile')?.toString().trim() || ''
  const accountNumber = formData.get('accountNumber')?.toString().trim() || ''
  const ifsc = formData.get('ifsc')?.toString().trim() || ''
  const photo = formData.get('photo')

  if (!name || !address || !fundsFor || !amountStr || !mobile || !accountNumber || !ifsc) {
    throw new Error('Missing required fields')
  }
  const amount = Number(amountStr)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount')

  return { name, address, fundsFor, amount, mobile, accountNumber, ifsc, photo }
}

export async function POST(req: NextRequest) {
  try {
    const { name, address, fundsFor, amount, mobile, accountNumber, ifsc, photo } = await parseForm(req)
    let photoUrl: string | null = null
    if (photo && photo instanceof File) {
      const buf = Buffer.from(await photo.arrayBuffer())
      const ext = photo.name.split('.').pop() || 'png'
      const objectName = `emergency/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabaseAdmin.storage.from('donation-screenshots').upload(objectName, buf, { contentType: photo.type })
      if (!error) {
        const { data: pub } = supabaseAdmin.storage.from('donation-screenshots').getPublicUrl(data.path)
        photoUrl = pub?.publicUrl || null
      }
    }
    const { error: insertErr } = await supabaseAdmin.from('emergency_requests').insert({
      name,
      address,
      funds_for: fundsFor,
      amount,
      mobile,
      account_number: accountNumber,
      ifsc,
      photo_url: photoUrl,
      approved: false,
    })
    if (insertErr) throw new Error(insertErr.message)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all')
    if (all) {
      const { data, error } = await supabaseAdmin
        .from('emergency_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return NextResponse.json({ success: true, data })
    }
    const { data, error } = await supabase
      .from('emergency_requests')
      .select('id,name,funds_for,amount,photo_url,address,mobile')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const id = body.id as string | undefined
    const approved = body.approved as boolean | undefined
    if (!id || typeof approved !== 'boolean') throw new Error('Invalid payload')
    const { error } = await supabaseAdmin.from('emergency_requests').update({ approved }).eq('id', id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 })
  }
}
