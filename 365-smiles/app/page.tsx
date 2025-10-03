"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

type Donor = {
  id: number;
  name: string | null;
  amount: number;
  message: string | null;
  image_url: string | null;
};

const causes = [
  {
    title: "🎓 Education",
    description:
      "Books, tuition, devices, and mentoring that unlock learning pathways for children and youth.",
    href: "/donate/education",
    bg: "from-blue-900 via-blue-700 to-cyan-700",
  },
  {
    title: "🍽️ Daily Needs",
    description:
      "Nutritious meals and essentials for orphans, the elderly, and differently-abled individuals.",
    href: "/donate/daily-needs",
    bg: "from-amber-900 via-amber-700 to-yellow-700",
  },
  {
    title: "💊 Medicine Support",
    description:
      "Medical checkups, medicines, assistive devices, and critical healthcare support.",
    href: "/donate/medicine-support",
    bg: "from-green-900 via-emerald-700 to-teal-700",
  },
];

export default function Home() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createSupabaseClient();

  // Smooth scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  // Mouse “love bubbles”
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>([]);
  const trailId = useRef(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      // create a small trail bubble
      setTrail((t) => [
        ...t.slice(-12),
        { id: trailId.current++, x: e.clientX, y: e.clientY },
      ]);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const fetchDonors = async () => {
      const { data, error } = await supabase
        .from("public-donations")
        .select("*")
        .order("id", { ascending: false })
        .limit(12);
      if (!error && data) setDonors(data as Donor[]);
      else console.error("Failed to fetch donors", error);
    };
    fetchDonors();
  }, [supabase]);

  // Map rotation on scroll
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-x-hidden">
      {/* Top Scroll Progress */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 h-1 origin-left bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 z-[60]"
      />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          {/* Left: 3-dots menu */}
          <div className="relative">
            <button
              aria-label="Menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <svg width="26" height="26" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="19" cy="12" r="2" fill="currentColor" />
              </svg>
            </button>
            {menuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute mt-2 w-44 rounded-xl border border-white/10 bg-gray-900/95 shadow-lg overflow-hidden"
              >
                <Link
                  href="/admin/login"
                  className="block px-4 py-3 hover:bg-white/10 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Login
                </Link>
                <Link
                  href="/calendar"
                  className="block px-4 py-3 hover:bg-white/10 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Donate
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-3 hover:bg-white/10 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  About Us
                </Link>
              </motion.nav>
            )}
          </div>

          {/* Right: Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg ring-2 ring-white/20 group-hover:rotate-6 transition overflow-hidden relative">
              <Image
                src="/logo.png"
                alt="365 Smiles Logo"
                fill
                className="object-contain"
                priority
              />
            </div>           
             <span className="text-lg font-semibold tracking-wide">365 Smiles</span>
          </Link>
        </div>
      </header>

      {/* Hero with video background */}
      <section id="hero" className="relative h-[100svh] w-full">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold leading-tight"
          >
            Donate birthdays. Create <b>smiles</b>. Feed lives. 
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-4 max-w-2xl text-base md:text-lg text-white/80"
          >
            Support orphans, elders, and differently-abled people—365 days a year. 
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-8 flex items-center gap-3"
          >
            <Link
              href="/donate"
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm md:text-base font-medium hover:opacity-90 active:scale-95 transition"
            >
              Sponsor a Day
            </Link>
            <Link
              href="#donors"
              className="rounded-full border border-white/20 px-6 py-3 text-sm md:text-base hover:bg-white/10 active:scale-95 transition"
            >
              Recent Donors
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Recent Donors */}
      <section
  id="donors"
  className="relative py-20 md:py-24 bg-gradient-to-b from-black to-gray-950"
>
  <div className="mx-auto max-w-7xl px-4">
    <div className="flex items-end justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-semibold">🌟 Recent Donors</h2>
      <Link href="/donate" className="text-pink-400 hover:text-pink-300">
        Donate Now →
      </Link>
    </div>
    <div className="no-scrollbar flex gap-6 overflow-x-auto py-2 snap-x snap-mandatory">
      {donors.slice(0, 3).map((donor, idx) => (
        <motion.div
          key={donor.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, delay: idx * 0.1 }}
          className="snap-start min-w-[420px] max-w-[420px] bg-gradient-to-r from-gray-800/70 to-gray-900/70 border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between relative"
        >
          {/* Alternate card layout */}
          <div className={`flex ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center gap-6`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-2xl text-pink-400">{donor.name || "Anonymous"}</p>
                <span className="rounded-full bg-emerald-600/20 text-emerald-300 px-3 py-1 text-lg">
                  ₹{donor.amount}
                </span>
              </div>
              {donor.message && (
                <p className="mt-4 text-base text-white/80 italic">"{donor.message}"</p>
              )}
            </div>
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-700 shadow-lg">
              {donor.image_url ? (
                <Image
                  src={donor.image_url}
                  alt={donor.name ?? "Anonymous"}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="h-full w-full bg-gray-700" />
              )}
            </div>
          </div>
          {/* Only show at bottom of 3rd card */}
          {idx === 2 && (
            <Link
              href="/recentdonors"
              className="absolute right-4 bottom-4 inline-block text-pink-400 hover:text-pink-300 font-medium transition"
            >
              View More →
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  </div>
</section>


      {/* Causes: three fullscreen sections with snap scroll */}
      <section
        id="causes"
        className="h-[300svh] snap-y snap-mandatory overflow-y-scroll no-scrollbar"
      >
        {causes.map((c, i) => (
          <div
            key={c.title}
            className="snap-start h-[100svh] relative flex items-center"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-20`}
            />
            <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-3xl md:text-5xl font-bold">{c.title}</h3>
                <p className="mt-4 text-white/85 text-lg">{c.description}</p>
                <ul className="mt-6 space-y-2 text-white/85">
                  {i === 0 && (
                    <>
                      <li>• Scholarships and exam fees support continuity of learning.</li>
                      <li>• Community libraries and after-school programs.</li>
                      <li>• Devices and data packs for digital access.</li>
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <li>• Daily hot meals and ration kits.</li>
                      <li>• Hygiene packs and seasonal clothing.</li>
                      <li>• Nutritional supplements for seniors.</li>
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <li>• Doctor camps and diagnostics.</li>
                      <li>• Long-term medicines and assistive care.</li>
                      <li>• Emergency support and referrals.</li>
                    </>
                  )}
                </ul>
                <div className="mt-8 flex gap-3">
                  <Link
                    href={c.href}
                    className="rounded-full bg-white text-black px-6 py-3 hover:bg-gray-200 active:scale-95 transition"
                  >
                    Donate to {c.title}
                  </Link>
                  <Link
                    href="/about#impact"
                    className="rounded-full border border-white/30 px-6 py-3 hover:bg-white/10 active:scale-95 transition"
                  >
                    See Impact
                  </Link>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5 }}
                className="hidden md:block"
              >
                <div className="h-[60vh] rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 shadow-inner flex items-center justify-center">
                  <span className="text-white/70">Impact visuals area</span>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </section>

      {/* What is 365-Smiles? */}
      <section id="about" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">What is 365-Smiles?</h2>
            <p className="mt-4 text-white/85">
              A community-led initiative enabling everyday celebrations to fund essential care across India—one day at a time. 
            </p>
            <p className="mt-3 text-white/85">
              Through verified partners, transparent tracking, and local delivery, donations reach those in need with dignity. 
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold">365+</p>
                <p className="text-white/80 text-sm">Days of giving</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-white/80 text-sm">Impact-first model</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold">India</p>
                <p className="text-white/80 text-sm">Nationwide reach</p>
              </div>
            </div>
          </div>
          <div className="relative h-[46vh] md:h-[56vh]">
            <motion.div
              style={{ rotate }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="h-64 w-64 md:h-80 md:w-80 rounded-full border-2 border-white/15 flex items-center justify-center">
                <div className="h-40 w-40 md:h-56 md:w-56 relative">
                  <Image
                    src="/india.svg"
                    alt="India map"
                    fill
                    className="object-contain invert opacity-90"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs (editable content area) */}
      <section id="faqs" className="py-16 md:py-20 bg-gradient-to-b from-gray-950 to-black">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">FAQs</h2>
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 overflow-hidden">
            {/* Duplicate/modify these items freely */}
            <details className="group open:bg-white/5 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg">How are donations utilized?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-white/80">
                Donations are allocated to verified programs across education, daily needs, and medical support with transparent records.
              </p>
            </details>
            <details className="group open:bg-white/5 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg">Can a date be dedicated?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-white/80">
                Yes, dedicate birthdays, anniversaries, or memorial days; we schedule impact activities on that date.
              </p>
            </details>
            <details className="group open:bg-white/5 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg">Do I get receipts?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-white/80">
                Digital receipts and impact summaries are shared post-disbursement.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60">
        <div className="mx-auto max-w-7xl px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-white/90">365 Smiles</h3>
            <p className="mt-2 text-white/70">
              Simple, transparent, and community-driven giving.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white/90">Links</h4>
            <ul className="mt-2 space-y-2 text-white/80">
              <li><Link href="/donate" className="hover:text-white">Donate</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/impact" className="hover:text-white">Impact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white/90">Contact</h4>
            <ul className="mt-2 space-y-2 text-white/80">
              <li><a href="mailto:hello@365smiles.org" className="hover:text-white">hello@365smiles.org</a></li>
              <li><a href="tel:+919999999999" className="hover:text-white">+91 99999 99999</a></li>
              <li><a href="https://maps.app.goo.gl/" target="_blank" className="hover:text-white" rel="noreferrer">Bangalore, India</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white/90">Follow</h4>
            <ul className="mt-2 space-y-2 text-white/80">
              <li><Link href="#" className="hover:text-white">Instagram</Link></li>
              <li><Link href="#" className="hover:text-white">LinkedIn</Link></li>
              <li><Link href="#" className="hover:text-white">YouTube</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-white/60 text-sm">
          © {new Date().getFullYear()} 365 Smiles. All rights reserved.
        </div>
      </footer>

      {/* Mouse love bubbles effect */}
      <motion.div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[70]"
        animate={{ x: cursorPos.x - 10, y: cursorPos.y - 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-5 w-5 rounded-full bg-pink-500/60 blur-[2px]" />
      </motion.div>
      {trail.map((t) => (
        <motion.div
          key={t.id}
          className="pointer-events-none fixed z-[60]"
          initial={{ opacity: 0.8, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.6, y: -10 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ left: t.x, top: t.y }}
        >
          <div className="h-3 w-3 rounded-full bg-rose-400/50" />
        </motion.div>
      ))}
    </div>
  );
}
