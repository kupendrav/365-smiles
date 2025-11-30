import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Placeholder: In future, poll Google Custom Search / social APIs here
// Requires GOOGLE_API_KEY and a CSE ID for web search.
// For now, we read/write from a Supabase table `emergency_needs` with fields:
// id (uuid), title (text), source_url (text), platform (text), created_at (timestamp), read (boolean)

export async function GET() {
  const { data, error } = await supabase
    .from("emergency_needs")
    .select("id, title, source_url, platform, created_at, read")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message, data: [] }, { status: 200 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, source_url, platform } = body || {};

  if (!title || !source_url) {
    return NextResponse.json({ error: "title and source_url required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("emergency_needs")
    .insert({ title, source_url, platform: platform || "web", read: false })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, read } = body || {};

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("emergency_needs")
    .update({ read: !!read })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function PUT() {
  const { error } = await supabase
    .from('emergency_needs')
    .update({ read: true })
    .eq('read', false);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
