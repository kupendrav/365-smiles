type SearchItem = {
  title: string
  link: string
  snippet: string
  displayLink?: string
  pagemap?: Record<string, unknown>
}

export type NewsResult = {
  title: string
  url: string
  summary: string
  source?: string
  image?: string
  publishedAt?: string
}

const API_KEY = process.env.GOOGLE_API_KEY
const CX = process.env.GOOGLE_CX
const WORLD_NEWS_KEY = process.env.WORLD_NEWS_API_KEY

async function fetchWithRetry(url: string, attempts = 3, backoff = 300) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 * 30 } })
      if (!res.ok) {
        const text = await res.text()
        const err = new Error(`Google CSE error ${res.status}: ${text}`) as Error & { status?: number }
        err.status = res.status
        throw err
      }
      return res
    } catch (e) {
      if (i === attempts - 1) throw e
      // exponential backoff
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)))
    }
  }
  throw new Error('unreachable')
}

function buildQuery(topic: 'old-age' | 'orphans') {
  const base = topic === 'old-age'
    ? 'elderly OR senior citizens OR old age home'
    : 'orphans OR orphanage OR child welfare'
  return `${base} site:.in OR India`
}

export async function fetchNews(topic: 'old-age' | 'orphans', opts?: { limit?: number; recentDays?: number }) {
  if (!API_KEY || !CX) {
    throw new Error('Google CSE env vars missing (GOOGLE_API_KEY/GOOGLE_CX)')
  }
  const q = buildQuery(topic)
  const num = Math.min(Math.max(opts?.limit ?? 8, 1), 10)
  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', API_KEY)
  url.searchParams.set('cx', CX)
  url.searchParams.set('q', q)
  url.searchParams.set('num', String(num))
  url.searchParams.set('gl', 'in')
  url.searchParams.set('lr', 'lang_en')
  url.searchParams.set('safe', 'active')
  const res = await fetchWithRetry(url.toString())
  const data = await res.json() as { items?: SearchItem[] }
  const items = (data.items ?? [])
  let results: NewsResult[] = items.map((it) => ({
    title: it.title,
    url: it.link,
    summary: it.snippet,
    source: it.displayLink,
    image: extractImage(it.pagemap),
    publishedAt: extractDate(it.pagemap),
  }))
  if (opts?.recentDays) {
    const cutoff = Date.now() - opts.recentDays * 24 * 60 * 60 * 1000
    results = results.filter(r => r.publishedAt ? Date.parse(r.publishedAt) >= cutoff : false)
  }
  return results
}

function extractImage(pagemap: Record<string, unknown> | undefined): string | undefined {
  try {
    const metatags = pagemap?.metatags as Array<Record<string, string>> | undefined
    const cseImage = pagemap?.cse_image as Array<Record<string, string>> | undefined
    const og = metatags?.[0]?.['og:image'] || cseImage?.[0]?.src
    if (typeof og === 'string' && og.startsWith('http')) return og
  } catch {}
  return undefined
}

function extractDate(pagemap: Record<string, unknown> | undefined): string | undefined {
  try {
    const metatags = pagemap?.metatags as Array<Record<string, string>> | undefined
    const meta = metatags?.[0] || {}
    const candidates = [
      meta['article:published_time'],
      meta['og:published_time'],
      meta['og:updated_time'],
      meta['datePublished'],
      meta['dateModified'],
      meta['pubdate'],
    ].filter(Boolean)
    for (const c of candidates) {
      const d = new Date(c)
      if (!isNaN(d.getTime())) return d.toISOString()
    }
  } catch {}
  return undefined
}

export async function fetchCombinedNews(opts?: { limit?: number; recentDays?: number }) {
  const limit = opts?.limit ?? 12
  const recentDays = opts?.recentDays ?? 7
  const perTopic = Math.ceil(limit / 2)

  // Simple combined fetch: pull two topic lists and merge/dedupe
  const [oldAge, orphans] = await Promise.all([
    (async () => {
      try { return await fetchNews('old-age', { limit: perTopic, recentDays }) } catch { return [] as NewsResult[] }
    })(),
    (async () => {
      try { return await fetchNews('orphans', { limit: perTopic, recentDays }) } catch { return [] as NewsResult[] }
    })(),
  ])

  let merged: NewsResult[] = [...(oldAge || []), ...(orphans || [])]

  // Filter by recentDays
  if (recentDays) {
    const cutoff = Date.now() - recentDays * 24 * 60 * 60 * 1000
    merged = merged.filter(r => r.publishedAt ? Date.parse(r.publishedAt) >= cutoff : false)
  }

  const dedup = new Map<string, NewsResult>()
  for (const item of merged) {
    if (item.url && !dedup.has(item.url)) dedup.set(item.url, item)
  }

  return Array.from(dedup.values()).sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return tb - ta
  }).slice(0, limit)
}

export async function fetchEmergencyNews(opts?: { limit?: number; recentDays?: number }) {
  if (!API_KEY || !CX) {
    // if Google not configured, we allow alternative world news API if available
    if (!WORLD_NEWS_KEY) throw new Error('Google CSE env vars missing (GOOGLE_API_KEY/GOOGLE_CX) and WORLD_NEWS_API_KEY not set')
  }
  const limit = Math.min(Math.max(opts?.limit ?? 10, 1), 10)
  const recentDays = opts?.recentDays ?? 7
  const query = 'Karnataka OR Bengaluru OR Bangalore OR India (orphan OR orphanage OR "old age home" OR elderly OR "medical emergency" OR "child welfare" OR needy OR "education" OR "hospital" OR "food")'
  let results: NewsResult[] = []

  // Try Google CSE first (if configured)
  if (API_KEY && CX) {
    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1')
      url.searchParams.set('key', API_KEY)
      url.searchParams.set('cx', CX)
      url.searchParams.set('q', query)
      url.searchParams.set('num', String(limit))
      url.searchParams.set('gl', 'in')
      url.searchParams.set('lr', 'lang_en')
      url.searchParams.set('safe', 'active')
      const res = await fetchWithRetry(url.toString())
      const data = await res.json() as { items?: SearchItem[] }
      results = (data.items ?? []).map(it => ({
        title: it.title,
        url: it.link,
        summary: it.snippet,
        source: it.displayLink,
        image: extractImage(it.pagemap),
        publishedAt: extractDate(it.pagemap),
      }))
    } catch (e) {
      console.warn('[news] fetchEmergencyNews: Google CSE failed:', (e as Error).message)
    }
  }

  // If Google returned nothing, try WorldNews API as a fallback (if configured)
  if ((results.length === 0) && WORLD_NEWS_KEY) {
    try {
      const w = await fetchWorldNews(query, limit)
      results = w
    } catch (e) {
      console.warn('[news] fetchEmergencyNews: WorldNews API failed:', (e as Error).message)
    }
  }
  const cutoff = Date.now() - recentDays * 24 * 60 * 60 * 1000
  results = results.filter(r => r.publishedAt ? Date.parse(r.publishedAt) >= cutoff : false)
  return results
}

interface WorldNewsRawItem {
  title?: string
  headline?: string
  name?: string
  url?: string
  link?: string
  sourceUrl?: string
  source_url?: string
  description?: string
  summary?: string
  snippet?: string
  source?: string | { name?: string }
  publisher?: string
  displayName?: string
  image?: string
  urlToImage?: string
  thumbnail?: string
  publishedAt?: string
  pubDate?: string
  published_at?: string
  date?: string
}

async function fetchWorldNews(query: string, limit = 10): Promise<NewsResult[]> {
  if (!WORLD_NEWS_KEY) return []
  // Try a couple of common WorldNews endpoint shapes; be tolerant in parsing
  const endpoints = [
    `https://worldnewsapi.com/api/search-news?api-key=${WORLD_NEWS_KEY}&text=${encodeURIComponent(query)}&page_size=${limit}`,
    `https://worldnewsapi.com/api/v1/news?key=${WORLD_NEWS_KEY}&q=${encodeURIComponent(query)}&limit=${limit}`,
    `https://worldnewsapi.com/api/search?key=${WORLD_NEWS_KEY}&q=${encodeURIComponent(query)}&limit=${limit}`,
  ]

  for (const ep of endpoints) {
    try {
      const res = await fetchWithRetry(ep)
      const json = await res.json()
      // possible array locations
      const arr = json?.articles || json?.news || json?.items || json?.results || json?.data || null
      if (!arr || !Array.isArray(arr) || arr.length === 0) continue
      const mapped: NewsResult[] = (arr as WorldNewsRawItem[]).slice(0, limit).map((it) => {
        let sourceVal: string | undefined
        if (typeof it.source === 'string') {
          sourceVal = it.source
        } else if (it.source && typeof it.source === 'object' && 'name' in it.source) {
          sourceVal = (it.source as { name?: string }).name
        }
        sourceVal = sourceVal || it.publisher || it.displayName
        return {
          title: it.title || it.headline || it.name || '',
          url: it.url || it.link || it.sourceUrl || it.source_url || '',
          summary: it.description || it.summary || it.snippet || '',
          source: sourceVal,
          image: it.image || it.urlToImage || it.thumbnail || undefined,
          publishedAt: it.publishedAt || it.pubDate || it.published_at || it.date || undefined,
        }
      })
      return mapped.filter(m => m.url)
    } catch {
      continue
    }
  }
  return []
}
