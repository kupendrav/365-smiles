"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

type DonationRow = { amount: number | string; status?: string | null };

export default function AdminFrontpage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [adminEmail, setAdminEmail] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [verifiedCount, setVerifiedCount] = useState<number | null>(null);
  const [unreadEmergencyCount, setUnreadEmergencyCount] = useState<number | null>(null);
  const [news, setNews] = useState<Array<{ title: string; url: string; summary: string; source?: string; image?: string; publishedAt?: string }>>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsSource, setNewsSource] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const getUserAndStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }

      if (!alive) return;
      setAdminEmail(user.email || "");

      // Fetch donation rows that have a non-null status
      const { data: totalData, error: tErr } = await supabase
        .from("donations")
        .select("amount,status")
        .not("status", "is", null);
      if (tErr) {
        setTotalAmount(0);
      } else {
        const sum =
          (totalData as DonationRow[] | null)?.reduce((acc, item) => {
            const val =
              typeof item.amount === "string"
                ? parseFloat(item.amount)
                : (item.amount as number);
            return acc + (isNaN(val) ? 0 : val);
          }, 0) ?? 0;
        if (!alive) return;
        setTotalAmount(sum);
      }

      // Count verified rows
      const { count, error: vErr } = await supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified");
      if (!alive) return;
      setVerifiedCount(vErr ? 0 : count ?? 0);

      // Fetch unread emergency needs count
      try {
        const res = await fetch("/api/emergencyneed", { cache: "no-store" });
        const json = await res.json();
        type EmergencyRow = { read: boolean };
        const unread = (json.data as EmergencyRow[] | undefined)?.filter((x) => !x.read).length || 0;
        if (!alive) return;
        setUnreadEmergencyCount(unread);
      } catch {
        if (!alive) return;
        setUnreadEmergencyCount(0);
      }
    };

    getUserAndStats();
    return () => { alive = false };
  }, [router, supabase]);

  // Fetch combined news with diagnostics
  const loadNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const res = await fetch(`/api/news?kind=combined&limit=12&t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.ok) {
        const list = json.data || [];
        setNews(list);
        setNewsSource(json.source || null);
        if (list.length === 0) {
          const reason = json.note || 'No recent news found. Try refreshing.';
          setNewsError(reason);
          console.warn('[frontpage] combined news empty:', reason, json.debug);
        } else {
          setNewsError(null);
          console.log('[frontpage] combined news loaded count=', list.length, 'source=', json.source, json.debug);
        }
      } else {
        setNews([]);
        const errMsg = json.error || 'Failed to load news';
        setNewsError(errMsg);
        console.error('[frontpage] news fetch error:', errMsg);
      }
    } catch (e) {
      setNews([]);
      const errMsg = (e as Error)?.message || 'Failed to load news';
      setNewsError(errMsg);
      console.error('[frontpage] news fetch exception:', errMsg);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Top Nav */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => router.push("/admin/log-donation")}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
            >
              Log Donation
            </button>
            <button
              onClick={() => router.push("/admin/donation-summary")}
              className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
            >
              Donation Summary
            </button>
            <button
              onClick={() => router.push("/admin/institution")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition hover:scale-105 transform"
            >
              🏢 Charities
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
        {/* Header row under nav */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-base md:text-lg text-gray-700">
            Logged in as: <span className="font-semibold text-indigo-600">{adminEmail || "…"}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="https://mail.google.com/mail/u/1/#inbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-lg bg-emerald-600 text-white px-5 py-2.5 font-semibold hover:bg-emerald-700 transition"
            >
              Open Mail Box
            </a>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="inline-flex justify-center rounded-lg bg-blue-600 text-white px-5 py-2.5 font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push("/admin/emergencyneed")}
              className={`inline-flex justify-center rounded-lg bg-red-600 text-white px-5 py-2.5 font-semibold hover:bg-red-700 transition ${unreadEmergencyCount && unreadEmergencyCount > 0 ? "animate-pulse" : ""}`}
            >
              Emergency {unreadEmergencyCount && unreadEmergencyCount > 0 ? `(${unreadEmergencyCount})` : ""}
            </button>
          </div>
        </section>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Total Donations Received</h2>
            <p className="mt-3 text-3xl md:text-4xl font-bold text-green-600">
              ₹ {totalAmount === null ? "…" : totalAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-gray-600 mt-2">Sum of all verified/non-null entries</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Verified Donors</h2>
            <p className="mt-3 text-3xl md:text-4xl font-bold text-blue-600">
              {verifiedCount === null ? "…" : verifiedCount}
            </p>
            <p className="text-sm text-gray-600 mt-2">Count of status = verified</p>
          </div>
        </section>

        {/* NGO page with vertical combined news tab */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              Karnataka NGOs & Charities (NGObase)
            </h3>
            <a
              href="https://ngobase.org/st/IN.KA/karnataka-ngos-charities#google_vignette"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Open in new tab
            </a>
          </div>
          <div className="h-[70vh] grid grid-cols-1 md:grid-cols-[1fr_320px]">
            <div className="h-full">
              {/* Note: some sites restrict embedding via X-Frame-Options. If blank, use the link above. */}
              <iframe
                title="Karnataka NGOs & Charities"
                src="https://ngobase.org/st/IN.KA/karnataka-ngos-charities#google_vignette"
                className="h-full w-full"
              />
            </div>
            <aside className="border-l border-gray-200 bg-gray-50 h-full overflow-y-auto">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm md:text-base font-bold text-gray-900 tracking-wide">📰 Needy Care News</h4>
                  <button
                    onClick={loadNews}
                    disabled={newsLoading}
                    className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {newsLoading ? '⏳' : '🔄'}
                  </button>
                </div>
                {newsSource && (
                  <div className="text-[10px] text-gray-500 mt-1">
                    Source: {newsSource === 'worldnews' ? '🌍 World News API' : newsSource === 'supabase' ? '💾 Cached' : '📋 Sample'}
                  </div>
                )}
              </div>
              <div className="px-4 pb-4 space-y-3">
                {newsLoading && (
                  <div className="text-sm text-gray-500 py-4">⏳ Loading news…</div>
                )}
                {!newsLoading && news.length === 0 && (
                  <div className="text-sm text-gray-600 py-4">
                    {newsError ? (
                      <div className="text-red-600 font-medium">⚠️ {newsError}</div>
                    ) : (
                      <span>No news found.</span>
                    )}
                  </div>
                )}
                {!newsLoading && news.map((n, idx) => (
                  <a key={idx} href={n.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="rounded-lg bg-white border border-gray-200 p-3 shadow-sm hover:border-gray-300">
                      <div className="flex gap-3">
                        {n.image && (
                          <img src={n.image} alt="" className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <div className="text-base font-bold text-gray-900 group-hover:text-indigo-700 line-clamp-2">{n.title}</div>
                          <div className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">{n.summary}</div>
                          <div className="flex gap-2 mt-2 items-center text-xs">
                            {n.publishedAt && <div className="text-gray-500 font-medium">{new Date(n.publishedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div>}
                            {n.source && <div className="text-gray-400">• {n.source}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
