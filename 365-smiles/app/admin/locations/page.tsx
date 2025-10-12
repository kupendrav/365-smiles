"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

const MAPS_URL =
  "https://www.bing.com/maps/search?mepi=0%7ELocal%7EEmbedded%7ELocal_Magazine_List_Card_See_More&ty=17&poicount=18&usebfpr=true&v=2&sV=1&FORM=MPSRPL&q=old+age%2Corphan++houses+in+bengaluru%3Bmaps&mb=13.028347%7E77.52755%7E12.890301%7E77.663712&ppois=12.959813117980957_77.64916229248047_Cheshire+Homes+India+Bangalore_YN4070x14796544520806149215%7E12.989803314208984_77.54080963134766_Sri+Mahalakshmi+Old+Age+Home_YN4070x2438317620397808909%7E12.890300750732422_77.60977172851562_OMASHRAM+TRUST-Old+Age+Care_YN4070x15032731168664328406%7E12.9166841506958_77.52754974365234_Sudhama+Old+Age+Home_YN4070x13299771174552426567%7E13.02834701538086_77.66371154785156_Sneha+Orphanage+%28Horamavu%2C+Bangalore%29+Regd._YN4070x56379526901169597%7E12.992399215698242_77.58875274658203_Angels_YN4070x17388905218039410225%7E&segment=Local&cp=12.977927%7E77.606415&lvl=12&style=r";

export default function AdminLocations() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Optional: protect route
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) router.push("/admin/login");
    })();
    return () => {
      alive = false;
    };
  }, [router, supabase]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Locations of Orphan/Old Age House
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
        {/* Map card */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Bengaluru
            </h2>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Open in new tab
            </a>
          </div>
          {/* 90% of the screen height */}
          <div className="h-[90vh]">
            {/* Note: If the site blocks embedding (X-Frame-Options/CSP), the iframe may appear blank. */}
            <iframe
              title="Bengaluru Orphan/Old Age Houses — Bing Maps"
              src={MAPS_URL}
              className="h-full w-full"
            />
          </div>
        </section>

        {/* Footer actions */}
        <section className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/admin/frontpage")}
            className="inline-flex justify-center rounded-lg bg-gray-900 text-white px-6 py-2.5 font-semibold hover:bg-gray-800 transition"
          >
            Main Menu
          </button>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center rounded-lg bg-indigo-600 text-white px-6 py-2.5 font-semibold hover:bg-indigo-700 transition"
          >
            Open Location
          </a>
        </section>
      </main>
    </div>
  );
}
