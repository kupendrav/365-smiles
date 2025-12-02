
export type NewsResult = {
  title: string
  url: string
  summary: string
  source?: string
  image?: string
  publishedAt?: string
}

const WORLD_NEWS_KEY = process.env.WORLD_NEWS_API_KEY

async function fetchWithRetry(url: string, attempts = 3, backoff = 300) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 * 30 } })
      if (!res.ok) {
        const text = await res.text()
        const err = new Error(`HTTP error ${res.status}: ${text}`) as Error & { status?: number }
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
  // Broad query for WorldNews API
  return `India (${base})`
}

export async function fetchNews(topic: 'old-age' | 'orphans', opts?: { limit?: number; recentDays?: number }) {
  const q = buildQuery(topic)
  const num = Math.min(Math.max(opts?.limit ?? 8, 1), 10)
  const results = await fetchWorldNews(q, num)
  if (opts?.recentDays) {
    const cutoff = Date.now() - opts.recentDays * 24 * 60 * 60 * 1000
    return results.filter(r => r.publishedAt ? Date.parse(r.publishedAt) >= cutoff : false)
  }
  return results
}


export async function fetchCombinedNews(opts?: { limit?: number; recentDays?: number }) {
  const limit = opts?.limit ?? 12
  const recentDays = opts?.recentDays ?? 7
  
  // Use WorldNews unified query (Google CSE fallback removed per request)
  if (WORLD_NEWS_KEY) {
    // Karnataka/India focused query for admin front page "Needy Care News"
    const queries = [
      'India orphanage elderly NGO charity',
      'Karnataka Bengaluru orphan elderly welfare',
      'India child welfare old age home donation',
    ]
    
    for (const query of queries) {
      try {
        const results = await fetchWorldNews(query, limit * 2) // fetch more, filter later
        console.log(`[news] fetchCombinedNews: query="${query}" returned ${results.length} items`)
        
        if (recentDays && results.length > 0) {
          const cutoff = Date.now() - recentDays * 24 * 60 * 60 * 1000
          // Keep items with valid dates within range, OR items without dates (give benefit of doubt)
          const filtered = results.filter(r => {
            if (!r.publishedAt) return true // keep if no date
            const parsed = Date.parse(r.publishedAt)
            return !isNaN(parsed) && parsed >= cutoff
          })
          if (filtered.length > 0) {
            return filtered.slice(0, limit)
          }
        }
        
        if (results.length > 0) return results.slice(0, limit)
      } catch (e) {
        console.warn('[news] fetchCombinedNews: WorldNews failed for query:', query, e)
      }
    }
  }
  
  return []
}

export async function fetchEmergencyNews(opts?: { limit?: number; recentDays?: number }) {
  const limit = Math.min(Math.max(opts?.limit ?? 10, 1), 10)
  const recentDays = opts?.recentDays ?? 7
  const query = 'Karnataka OR Bengaluru OR Bangalore OR India (orphan OR orphanage OR "old age home" OR elderly OR "medical emergency" OR "child welfare" OR needy OR "education" OR "hospital" OR "food")'
  let results: NewsResult[] = []
  try {
    results = await fetchWorldNews(query, limit)
  } catch (e) {
    console.warn('[news] fetchEmergencyNews: WorldNews API failed:', (e as Error).message)
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
