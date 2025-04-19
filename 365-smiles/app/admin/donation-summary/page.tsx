"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
];

export default function DonationSummaryPage() {
  const supabase = createSupabaseClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("donation-logs")
        .select("*")
        .order("date", { ascending: false });

      if (!error && data) {
        setLogs(data);

        const totals: Record<string, number> = {};
        data.forEach((log) => {
          totals[log.home_name] =
            (totals[log.home_name] || 0) + parseFloat(log.amount);
        });

        setGrouped(
          Object.entries(totals).map(([name, value]) => ({ name, value }))
        );
      }

      setLoading(false);
    };

    fetchLogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this donation log?")) return;
    const { error } = await supabase.from("donation-logs").delete().eq("id", id);
    if (!error) {
      setLogs((prev) => prev.filter((log) => log.id !== id));
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold text-center mb-6">📊 Trust Donation Summary</h1>

      {loading ? (
        <p className="text-center">Loading summary...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-4 shadow rounded">
              <h2 className="text-lg font-semibold mb-2">Total Donations by Trust</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={grouped}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="value" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-800 p-4 shadow rounded">
              <h2 className="text-lg font-semibold mb-2">Pie Chart</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={grouped}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {grouped.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">All Donation Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm text-gray-100">
              <thead className="bg-gray-700 text-gray-300">
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
                  <tr key={log.id} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="p-2">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-2">{log.home_name}</td>
                    <td className="p-2">₹ {log.amount}</td>
                    <td className="p-2">{log.notes || '-'}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
