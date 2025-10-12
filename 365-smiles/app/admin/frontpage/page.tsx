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
    };

    getUserAndStats();
    return () => {
      alive = false;
    };
  }, [router, supabase]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Top Nav */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => router.push("/admin/log-donation")}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
            >
              Log Donation
            </button>
            <button
              onClick={() => router.push("/admin/locations")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Locations
            </button>
            <button
              onClick={() => router.push("/admin/donation-summary")}
              className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
            >
              Donation Summary
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
        {/* Header row under nav */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-gray-700">
            Logged in as: <span className="font-semibold">{adminEmail || "…"}</span>
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
          </div>
        </section>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Total Donations Received</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              ₹ {totalAmount === null ? "…" : totalAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-gray-500 mt-1">Sum of all verified/non-null entries</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Verified Donors</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              {verifiedCount === null ? "…" : verifiedCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">Count of status = verified</p>
          </div>
        </section>

        {/* Scrollable external page area (≈70% of viewport height) */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
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
          <div className="h-[70vh]">
            {/* Note: some sites restrict embedding via X-Frame-Options. If blank, use the link above. */}
            <iframe
              title="Karnataka NGOs & Charities"
              src="https://ngobase.org/st/IN.KA/karnataka-ngos-charities#google_vignette"
              className="h-full w-full"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
