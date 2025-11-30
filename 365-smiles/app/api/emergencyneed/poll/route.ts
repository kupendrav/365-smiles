import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchEmergencyNews } from "@/lib/news";

// POST /api/emergencyneed/poll
// Body: { queries?: string[] }
// Requires environment variables: GOOGLE_API_KEY and GOOGLE_CX

export async function POST() {
  // Fetch emergency regional news via Google CSE utility with 7-day filter
  let news: Array<{ title: string; url: string; source?: string; publishedAt?: string }> = []
  try {
    news = await fetchEmergencyNews({ limit: 10, recentDays: 7 })
  } catch (e) {
    // If Google is disabled/forbidden, proceed with empty set
    console.warn('[poll] emergency fetch failed:', (e as Error)?.message || e)
    news = []
  }

  interface InsertedItem { title: string; link: string; id: string; platform: string | null }
  interface DuplicateItem { link: string }
  interface ErrorItem { link: string; error?: string }

  const inserted: InsertedItem[] = []
  const duplicates: DuplicateItem[] = []
  const errors: ErrorItem[] = []

  for (const n of news) {
    const title = n.title
    const link = n.url
    const platform = classifyPlatform(n.source || '')
    if (!link) continue
    const { data: exists, error: selErr } = await supabase
      .from('emergency_needs')
      .select('id')
      .eq('source_url', link)
      .limit(1)
      .maybeSingle()
    if (selErr) { errors.push({ link, error: selErr.message }); continue }
    if (exists) { duplicates.push({ link }); continue }
    const { data: insData, error: insErr } = await supabase
      .from('emergency_needs')
      .insert({ title, source_url: link, platform, read: false })
      .select()
      .single()
    if (insErr) { errors.push({ link, error: insErr.message }); continue }
    inserted.push({ title, link, id: insData.id, platform })
  }

  console.log('[poll] inserted:', inserted.length, 'duplicates:', duplicates.length, 'errors:', errors.length)
  return NextResponse.json({ inserted, duplicates, errors })
}

// Map displayLink host to a normalized platform label
function classifyPlatform(displayLink: string): string | null {
  const host = displayLink.toLowerCase();
  if (host.includes("twitter.com")) return "twitter";
  if (host.includes("facebook.com")) return "facebook";
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("reddit.com")) return "reddit";
  if (host.includes("youtube.com")) return "youtube";
  return displayLink || null;
}
