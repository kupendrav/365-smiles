import { NextResponse } from 'next/server'
import { fetchNews, fetchCombinedNews, fetchEmergencyNews, NewsResult } from '@/lib/news'
import { supabase } from '@/lib/supabase'

type EmergencyNeedRow = {
  title: string
  source_url: string
  platform: string | null
  created_at: string
  read?: boolean
}
type DummyNewsRow = {
  title?: string
  url?: string
  summary?: string
  source?: string
  published_at?: string
}

// Dummy news fallback: tries `dummy_news` table; if absent/empty returns hardcoded items.
async function getDummyNews(limit: number): Promise<(NewsResult & { _dummy?: boolean })[]> {
  let rows: DummyNewsRow[] | null = null
  try {
    const res = await supabase
      .from('dummy_news')
      .select('title, url, summary, source, published_at')
      .order('published_at', { ascending: false })
      .limit(limit)
    rows = (res.data as DummyNewsRow[]) || []
  } catch {
    rows = []
  }
  let mapped: (NewsResult & { _dummy?: boolean })[] = (rows || []).map(r => ({
    title: r.title ?? 'Untitled',
    url: r.url ?? 'https://example.com',
    summary: r.summary ?? '',
    source: r.source ?? 'Local',
    image: undefined,
    publishedAt: r.published_at ?? new Date().toISOString(),
    _dummy: false,
  }))
  if (mapped.length === 0) {
    const now = Date.now()
    const base = [
      {
        title: 'Community drive supports elderly homes',
        url: 'https://365-smiles.local/dummy/community-drive',
        summary: 'Local volunteers organized a support drive for senior citizens providing meals and medical check-ups.',
        source: '365 Smiles',
        publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Education kits delivered to orphanage',
        url: 'https://365-smiles.local/dummy/education-kits',
        summary: 'New school year starter kits (books & stationery) were delivered to children at a partner orphanage.',
        source: '365 Smiles',
        publishedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Medical support provided for critical child case',
        url: 'https://365-smiles.local/dummy/medical-support',
        summary: 'Emergency funds allocated for a child requiring urgent treatment earlier today.',
        source: '365 Smiles',
        publishedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Daily meals initiative expands coverage',
        url: 'https://365-smiles.local/dummy/daily-meals',
        summary: 'Meal sponsorship program added two new distribution points increasing daily reach.',
        source: '365 Smiles',
        publishedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Volunteer orientation program concluded successfully',
        url: 'https://365-smiles.local/dummy/volunteer-orientation',
        summary: 'New volunteers received training on donation logging and beneficiary interaction protocols.',
        source: '365 Smiles',
        publishedAt: new Date(now - 10 * 60 * 60 * 1000).toISOString(),
      },
    ]
    mapped = base.slice(0, limit).map(b => ({ ...b, image: undefined, _dummy: true }))
    // Attempt to seed table for future (ignore errors)
    try {
      await supabase.from('dummy_news').upsert(
        mapped.map(m => ({
          title: m.title,
            url: m.url,
            summary: m.summary,
            source: m.source,
            published_at: m.publishedAt,
        }))
      )
    } catch {}
  }
  return mapped
}

export const revalidate = 1800 // 30 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const kind = searchParams.get('kind') || ''
    const limitRaw = searchParams.get('limit') || '12'
    const limitParsed = parseInt(limitRaw, 10)
    const limit = Number.isFinite(limitParsed) ? limitParsed : 12
    if (kind === 'combined') {
      let cseData: NewsResult[] | null = null
      let cseError: string | undefined
      try {
        const data = await fetchCombinedNews({ limit, recentDays: 30 }) // Extend to 30 days for more results
        cseData = data
      } catch (e) {
        cseError = (e as Error)?.message || String(e)
      }
      if (cseData && cseData.length > 0) {
        return NextResponse.json({ ok: true, kind, count: cseData.length, data: cseData, source: 'worldnews', debug: { worldnews: 'ok', count: cseData.length } })
      }

      // Only fallback to Supabase if World News failed completely
      // Filter out test/manual entries
      let rows: EmergencyNeedRow[] | null = null
      let supabaseErr: string | undefined
      try {
        const res = await supabase
          .from('emergency_needs')
          .select('title, source_url, platform, created_at, read')
          .not('platform', 'eq', 'manual-test') // Exclude manual test entries
          .order('created_at', { ascending: false })
          .limit(limit)
        rows = (res.data as EmergencyNeedRow[]) || []
      } catch (e) {
        supabaseErr = (e as Error)?.message || String(e)
      }

      const mapped: NewsResult[] = (rows || []).map(r => ({
        title: r.title,
        url: r.source_url,
        summary: '',
        source: r.platform || undefined,
        image: undefined,
        publishedAt: r.created_at,
      }))

      if (!mapped.length) {
        const dummy = await getDummyNews(limit)
        const debug: Record<string, unknown> = {
          worldnews: { ok: false, error: cseError },
          supabaseEmergency: { ok: Array.isArray(rows), count: (rows || []).length, error: supabaseErr },
          dummy: { used: true, count: dummy.length }
        }
        return NextResponse.json({ ok: true, kind, count: dummy.length, data: dummy, source: 'dummy', debug, note: 'Dummy news used (combined fallback).' })
      }
      const debug: Record<string, unknown> = { worldnews: { ok: false, error: cseError }, supabase: { ok: Array.isArray(rows), count: (rows || []).length, error: supabaseErr } }
      return NextResponse.json({ ok: true, kind, count: mapped.length, data: mapped, source: 'supabase', debug })
    }
    if (kind === 'emergency') {
      let cseData: NewsResult[] | null = null
      let cseError: string | undefined
      try {
        const data = await fetchEmergencyNews({ limit, recentDays: 7 })
        cseData = data
      } catch (e) {
        cseError = (e as Error)?.message || String(e)
      }
      if (cseData && cseData.length > 0) {
        return NextResponse.json({ ok: true, kind, count: cseData.length, data: cseData, debug: { cse: 'ok' } })
      }

      let rows: EmergencyNeedRow[] | null = null
      let supabaseErr: string | undefined
      try {
        const res = await supabase
          .from('emergency_needs')
          .select('title, source_url, platform, created_at, read')
          .order('created_at', { ascending: false })
          .limit(limit)
        rows = (res.data as EmergencyNeedRow[]) || []
      } catch (e) {
        supabaseErr = (e as Error)?.message || String(e)
      }

      const mapped: NewsResult[] = (rows || []).map(r => ({
        title: r.title,
        url: r.source_url,
        summary: '',
        source: r.platform || undefined,
        image: undefined,
        publishedAt: r.created_at,
      }))

      if (!mapped.length) {
        const dummy = await getDummyNews(limit)
        const debug: Record<string, unknown> = {
          cse: { ok: false, note: 'Google CSE removed' },
          supabaseEmergency: { ok: Array.isArray(rows), count: (rows || []).length, error: supabaseErr },
          dummy: { used: true, count: dummy.length }
        }
        return NextResponse.json({ ok: true, kind, count: dummy.length, data: dummy, debug, note: 'Dummy news used (emergency fallback).' })
      }
      const debug: Record<string, unknown> = { cse: { ok: false, note: 'Google CSE removed' }, supabase: { ok: Array.isArray(rows), count: (rows || []).length, error: supabaseErr } }
      return NextResponse.json({ ok: true, kind, count: mapped.length, data: mapped, debug })
    }
    // fallback single-topic behaviour
    const topicParam = searchParams.get('topic')
    const topic = (topicParam === 'orphans' ? 'orphans' : 'old-age') as 'old-age' | 'orphans'
    const data = await fetchNews(topic, { limit, recentDays: 7 })
    return NextResponse.json({ ok: true, topic, count: data.length, data })
  } catch (err) {
    console.error('[api/news] Error:', err)
    const msg = typeof (err as Error)?.message === 'string' ? (err as Error).message : 'Unknown error'
    const statusHint: number | undefined = typeof (err as { status?: number })?.status === 'number' ? (err as { status?: number }).status : undefined
    const status = statusHint ?? 500
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}
