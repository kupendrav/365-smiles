"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PALETTE = [
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // amber
  "#f87171", // red
  "#38bdf8", // sky
  "#a78bfa", // violet
  "#f472b6", // pink
  "#f59e0b", // orange
  "#10b981", // emerald
  "#6366f1", // indigo
];

type LogRow = {
  id: string;
  date: string; // ISO date
  home_name: string;
  amount: number | string;
  notes?: string | null;
};

type BarDatum = { name: string; value: number };

export default function DonationSummaryPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const router = useRouter();

  const [logs, setLogs] = useState<LogRow[]>([]);
  const [grouped, setGrouped] = useState<BarDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0); // If separate metric exists, compute accordingly.

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("donation-logs")
        .select("id,date,home_name,amount,notes")
        .order("date", { ascending: false });

      if (!alive) return;

      if (!error && data) {
        const rows = (data as LogRow[]).map((r) => ({
          ...r,
          amount:
            typeof r.amount === "string" ? parseFloat(r.amount) : (r.amount as number),
        }));
        setLogs(rows);

        // Group by home_name
        const totals: Record<string, number> = {};
        rows.forEach((log) => {
          const amt = typeof log.amount === "number" ? log.amount : 0;
          totals[log.home_name] = (totals[log.home_name] || 0) + (isNaN(amt) ? 0 : amt);
        });

        const barData = Object.entries(totals).map(([name, value]) => ({ name, value }));
        setGrouped(barData);

        const sumAll = rows.reduce((acc, r) => acc + ((r.amount as number) || 0), 0);
        setTotalDonated(sumAll); // If you track “donated” differently, replace this with your logic.
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [supabase]);


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this donation log?")) return;
    const { error } = await supabase.from("donation-logs").delete().eq("id", id);
    if (!error) {
      setLogs((prev) => prev.filter((log) => log.id !== id));
      // Also update grouped and totals
      const removed = logs.find((l) => l.id === id);
      if (removed) {
        const newLogs = logs.filter((l) => l.id !== id);
        const totals: Record<string, number> = {};
        newLogs.forEach((log) => {
          const amt = typeof log.amount === "number" ? log.amount : 0;
          totals[log.home_name] = (totals[log.home_name] || 0) + (isNaN(amt) ? 0 : amt);
        });
        setGrouped(Object.entries(totals).map(([name, value]) => ({ name, value })));
        const sumAll = newLogs.reduce((acc, r) => acc + ((r.amount as number) || 0), 0);
        setTotalDonated(sumAll);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header with back arrow and title */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              aria-label="Back to Admin Frontpage"
              onClick={() => router.push("/admin/frontpage")}
              className="h-10 w-10 grid place-items-center rounded-full bg-gray-900 text-white hover:bg-gray-800 active:scale-95 transition"
              title="Back"
            >
              ←
            </button>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
              Trust Donation Summary
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
        {loading ? (
          <p className="text-gray-700 text-center">Loading summary...</p>
        ) : (
          <>
            {/* Top section: 70% chart (left) + 30% stat cards (right) */}
            <section className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              {/* Chart */}
              <div className="lg:col-span-7 rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-xl p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Total Donations by Trust
                </h2>
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grouped}>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          borderColor: "#374151",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Bar dataKey="value">
                        {grouped.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right stats (only donated metric retained) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
                  <div className="text-sm text-gray-500">Total Donated</div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                    ₹ {totalDonated.toLocaleString("en-IN")}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    If you track a separate “donated” metric, compute it here.
                  </p>
                </div>
              </div>
            </section>

            {/* Logs table */}
            <section className="rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-xl p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">All Donation Logs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-800">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Home</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Notes</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-gray-200 hover:bg-white/60">
                        <td className="p-2">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">{log.home_name}</td>
                        <td className="p-2">
                          ₹{" "}
                          {(
                            typeof log.amount === "number"
                              ? log.amount
                              : parseFloat(String(log.amount))
                          ).toLocaleString("en-IN")}
                        </td>
                        <td className="p-2">{log.notes || "-"}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-rose-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
