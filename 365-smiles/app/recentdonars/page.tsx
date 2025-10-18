"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Donor = {
  id: number;
  name: string | null;
  amount: number;
  message: string | null;
  image_url: string | null;
};

export default function RecentDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchDonors = async () => {
      const { data, error } = await supabase
        .from("public-donations")
        .select("*")
        .order("id", { ascending: false });
      if (!error && data) setDonors(data as Donor[]);
      else console.error("Failed to fetch donors", error);
    };
    fetchDonors();
  }, [supabase]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-black to-gray-950 px-4 py-14">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-pink-500 drop-shadow-lg">
  ⚚ Our Divine Donors ⚚
</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {donors.map((donor, idx) => (
          <motion.div
            key={donor.id}
            initial={{ opacity: 0, y: 120, rotate: -6 + (idx % 3) * 6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              duration: 0.88,
              delay: idx * 0.07,
              type: "spring",
              stiffness: 90,
              damping: 20,
            }}
            className={`bg-gradient-to-tr from-gray-800/80 to-pink-600/10 border border-white/10 p-7 rounded-2xl shadow-lg flex flex-col gap-4 relative overflow-hidden hover:scale-105 hover:shadow-pink-500/30 transition`}
          >
            <div
              className={`flex ${
                idx % 2 === 0 ? "flex-row" : "flex-row-reverse"
              } gap-4 items-center`}
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-700 shadow-md flex-shrink-0">
                {donor.image_url ? (
                  <Image
                    src={donor.image_url}
                    alt={donor.name ?? "Anonymous"}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-700" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-pink-400">
                  {donor.name || "Anonymous"}
                </p>
                <span className="text-emerald-300 font-medium">
                  ₹{donor.amount}
                </span>
                {donor.message && (
                  <p className="mt-2 text-base text-white/80 italic">
                    &ldquo;{donor.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
            <div className="absolute left-3 top-3 rounded-full bg-pink-500/90 px-3 py-1 text-white/90 text-xs shadow font-bold">
              Donor #{donor.id}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          href="/calendar"
          className="inline-block rounded-full border border-pink-400 px-8 py-3 text-pink-400 hover:bg-pink-400 hover:text-white transition font-semibold"
        >
          Inspire with Your Donation →
        </Link>
      </div>
    </main>
  );
}