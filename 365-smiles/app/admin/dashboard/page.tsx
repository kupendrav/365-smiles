"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type DonationRow = {
  id: string;
  name: string;
  email: string;
  amount: number | string;
  ref_id?: string | null;
  screenshot?: string | null;
  status?: "pending" | "verified" | null;
  created_at: string;
};

export default function AdminDashboard() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const router = useRouter();

  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const fetchStats = async () => {
    // Pull only necessary columns
    const { data, error } = await supabase
      .from("donations")
      .select("id,name,email,amount,ref_id,screenshot,status,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching donations:", error);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as DonationRow[];
    setDonations(rows);

    const sum = rows.reduce((acc, d) => {
      const val = typeof d.amount === "string" ? parseFloat(d.amount) : d.amount;
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    setTotalAmount(sum);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) {
        router.push("/admin/login");
        return;
      }
      await fetchStats();
    })();

    return () => {
      alive = false;
    };
  }, [router, supabase]);

  const updateStatus = async (id: string, current: string | null | undefined) => {
    const newStatus = current === "verified" ? "pending" : "verified";

    const { error } = await supabase.from("donations").update({ status: newStatus }).eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      alert("Error updating status");
      return;
    }

    // Update UI in place
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus as "pending" | "verified" } : d))
    );

    // Recompute total (if you want total only for verified, adjust filter here)
    const sum = donations.reduce((acc, d) => {
      const val = typeof d.amount === "string" ? parseFloat(d.amount) : d.amount;
      const amt = isNaN(val) ? 0 : val;
      // if total should only include verified rows, use:
      // return acc + ((d.id === id ? newStatus : d.status) === "verified" ? amt : 0);
      return acc + amt;
    }, 0);
    setTotalAmount(sum);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Top bar with back arrow and stat card on right */}
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
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Donation Dashboard</h1>
          </div>

          {/* Top-right total summary card */}
          <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <div className="text-xs text-gray-500">Total Donations Received</div>
            <div className="text-lg md:text-xl font-extrabold text-gray-900">
              ₹ {totalAmount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Logs table in a translucent card */}
        <section className="rounded-2xl border border-white/30 bg-white/50 backdrop-blur-xl shadow-xl p-4 md:p-6">
          {loading ? (
            <p className="text-gray-700">Loading donations...</p>
          ) : donations.length === 0 ? (
            <p className="text-gray-700">No donations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white/60 backdrop-blur rounded-xl">
                <thead>
                  <tr className="bg-blue-100/70 text-black text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Screenshot</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-b text-black hover:bg-gray-50/70">
                      <td className="p-3">{donation.name}</td>
                      <td className="p-3">{donation.email}</td>
                      <td className="p-3">
                        ₹
                        {(
                          typeof donation.amount === "string"
                            ? parseFloat(donation.amount)
                            : donation.amount
                        ).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">{donation.ref_id || "—"}</td>
                      <td className="p-3">
                        {donation.screenshot ? (
                          <a
                            href={donation.screenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          className={`px-3 py-1 rounded text-white transition ${
                            donation.status === "verified"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-orange-500 hover:bg-orange-600"
                          }`}
                          onClick={() => updateStatus(donation.id, donation.status)}
                          title="Toggle status"
                        >
                          {donation.status ?? "pending"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
