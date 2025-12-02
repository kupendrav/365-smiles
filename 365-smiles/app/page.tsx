"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { motion, useScroll, useSpring } from "framer-motion";


type Donor = {
  id: number;
  name: string | null;
  amount: number;
  message: string | null;
  image_url: string | null;
};




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


  // Map rotation on scroll - REMOVED (unused variable)

  // Controls play/pause for each video - REMOVED (unused variables)
  // const [playing, setPlaying] = useState([false, false, false]);
  // const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-x-hidden page-shell">
      {/* Top Scroll Progress */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 h-1 origin-left bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 z-[60]"
      />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/55 border-b border-white/10 supports-backdrop-filter:backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
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
                  href="/emergencyneed"
                  className="block px-4 py-3 hover:bg-white/10 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Emergency Need
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
          <Link href="/#about" className="flex items-center gap-2 group">
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
      <section id="hero" className="relative min-h-[100svh] w-full flex items-stretch">
        <video
          className="video-bg-cover"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24 lg:py-32 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-hero font-bold tracking-tight drop-shadow-xl"
          >
            Donate birthdays. Create <b>smiles</b>. Feed lives. 
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-5 max-w-2xl text-base md:text-lg lg:text-xl text-white/80 leading-relaxed"
          >
            Support orphans, elders, and differently-abled people—365 days a year. 
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/calendar"
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm md:text-base font-medium shadow-lg hover:shadow-pink-500/40 hover:opacity-95 active:scale-95 transition"
            >
              Sponsor a Day
            </Link>
            <Link
              href="#donors"
              className="rounded-full border border-white/30 px-6 py-3 text-sm md:text-base backdrop-blur-sm bg-white/5 hover:bg-white/15 active:scale-95 transition"
            >
              Recent Donors
            </Link>
          </motion.div>
        </div>
      </section>

     <section
  id="donors"
  className="relative py-20 md:py-24 bg-gradient-to-b from-black to-gray-950 min-h-[60vh]"
>
  <div className="max-w-6xl px-4 sm:px-6 mx-auto relative">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6 sm:gap-4">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">⚚ Recent Donors</h2>
      <Link href="/donate" className="text-pink-400 hover:text-pink-300 font-medium">
        Donate Now →
      </Link>
    </div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
  {donors.slice(0, 4).map((donor, idx) => (
    <motion.div
      key={donor.id}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay: idx * 0.08,
        type: "spring",
        stiffness: 80,
        damping: 18,
      }}
      whileHover={{
        scale: 1.04,
        boxShadow: "0 0 0 4px #ec4899, 0 8px 32px 0 #ec489980",
        borderColor: "#ec4899",
      }}
      className={`
        w-full sm:w-80 md:w-96 max-w-[420px] border border-pink-500/30 card-gradient p-6 rounded-2xl shadow-xl
        flex items-center ${idx % 2 === 1 ? "flex-row-reverse" : "flex-row"} gap-5
        transition-all duration-300
        relative overflow-hidden
      `}
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-pink-500/20 blur-[2px] z-0" />

      <div className="flex-1 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-xl text-pink-400 truncate drop-shadow">
            {donor.name || "Anonymous"}
          </p>
          <span className="rounded-full bg-emerald-600/30 text-emerald-200 px-4 py-1 text-base shadow">
            ₹{donor.amount}
          </span>
        </div>
        {donor.message && (
          <p className="mt-4 text-base text-white/80 italic break-words line-clamp-3">
            &ldquo;{donor.message}&rdquo;
          </p>
        )}
      </div>
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-700 shadow-lg ring-2 ring-pink-500/30 z-10">
        {donor.image_url ? (
          <Image
            src={donor.image_url}
            alt={donor.name ?? "Anonymous"}
            width={96}
            height={96}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gray-700 flex items-center justify-center text-white/40 text-2xl">
            ?
          </div>
        )}
      </div>
    </motion.div>
  ))}
</div>

    {/* View More link - bottom left */}
    <div className="absolute right-0 bottom-4">
      <Link
        href="/recentdonars"
        className="inline-block text-pink-500 hover:text-pink-600 font-bold transition"
      >
        View More →
      </Link>
    </div>
  </div>
</section>

      
      {/* Causes: three fullscreen sections with snap scroll */}
      <section
        id="causes"
        className="py-20 md:py-24 bg-gradient-to-b from-black to-gray-950"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-pink-500 drop-shadow-lg">
          ⚚ Impact of 365-Smiles ⚚
        </h2>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-2 gap-14 md:gap-16 items-start">
        {/* Education */}
        <div>
          <h3 className="text-3xl md:text-5xl font-bold">🎓 Education</h3>
          <p className="mt-4 text-white/85 text-lg">
            Books, tuition, devices, and mentoring that unlock learning pathways for children and youth.
          </p>
          <ul className="mt-6 space-y-2 text-white/85">
            <li>• Scholarships and exam fees support continuity of learning.</li>
            <li>• Community libraries and after-school programs.</li>
            <li>• Devices and data packs for digital access.</li>
          </ul>
          <div className="mt-8 flex gap-3">
            <Link
              href="/donate/education"
              className="rounded-full bg-white text-black px-6 py-3 hover:bg-gray-200 transition"
            >
              Donate to Education
            </Link>
            <button
              type="button"
              className="rounded-full border border-white/30 px-6 py-3 hover:bg-white/10 transition"
              onClick={() => {
                const video = document.getElementById("video-education") as HTMLVideoElement;
                if (video) { 
                  if (video.paused) { video.play(); } else { video.pause(); }
                }
              }}
            >
              See Impact
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-[50vh] sm:h-[60vh] w-full max-w-md rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
            <video
              id="video-education"
              src="/a.mp4"
              className="w-full h-full object-cover rounded-2xl"
              loop
              controls={false}
              autoPlay={false}
              muted
              style={{ background: "black" }}
            />
          </div>
        </div>

        {/* Daily Needs */}
        <div>
          <h3 className="text-3xl md:text-5xl font-bold">🍽️ Daily Needs</h3>
          <p className="mt-4 text-white/85 text-lg">
            Nutritious meals and essentials for orphans, the elderly, and differently-abled individuals.
          </p>
          <ul className="mt-6 space-y-2 text-white/85">
            <li>• Daily hot meals and ration kits.</li>
            <li>• Hygiene packs and seasonal clothing.</li>
            <li>• Nutritional supplements for seniors.</li>
          </ul>
          <div className="mt-8 flex gap-3">
            <Link
              href="/donate/daily-needs"
              className="rounded-full bg-white text-black px-6 py-3 hover:bg-gray-200 transition"
            >
              Donate to Daily Needs
            </Link>
            <button
              type="button"
              className="rounded-full border border-white/30 px-6 py-3 hover:bg-white/10 transition"
              onClick={() => {
                const video = document.getElementById("video-daily") as HTMLVideoElement;
                if (video) { 
                  if (video.paused) { video.play(); } else { video.pause(); }
                }
              }}
            >
              See Impact
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-[50vh] sm:h-[60vh] w-full max-w-md rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
            <video
              id="video-daily"
              src="/b.mp4"
              className="w-full h-full object-cover rounded-2xl"
              loop
              controls={false}
              autoPlay={false}
              muted
              style={{ background: "black" }}
            />
          </div>
        </div>

        {/* Medicine Support */}
        <div>
          <h3 className="text-3xl md:text-5xl font-bold">💊 Medicine Support</h3>
          <p className="mt-4 text-white/85 text-lg">
            Medical checkups, medicines, assistive devices, and critical healthcare support.
          </p>
          <ul className="mt-6 space-y-2 text-white/85">
            <li>• Doctor camps and diagnostics.</li>
            <li>• Long-term medicines and assistive care.</li>
            <li>• Emergency support and referrals.</li>
          </ul>
          <div className="mt-8 flex gap-3">
            <Link
              href="/donate/medicine-support"
              className="rounded-full bg-white text-black px-6 py-3 hover:bg-gray-200 transition"
            >
              Donate to Medicine Support
            </Link>
            <button
              type="button"
              className="rounded-full border border-white/30 px-6 py-3 hover:bg-white/10 transition"
              onClick={() => {
                const video = document.getElementById("video-medicine") as HTMLVideoElement;
                if (video) { 
                  if (video.paused) { video.play(); } else { video.pause(); }
                }
              }}
            >
              See Impact
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-[50vh] sm:h-[60vh] w-full max-w-md rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
            <video
              id="video-medicine"
              src="/c.mp4"
              className="w-full h-full object-cover rounded-2xl"
              loop
              controls={false}
              autoPlay={false}
              muted
              style={{ background: "black" }}
            />
          </div>
        </div>
      </div>
    </section>

    {/* Approved emergency requests no longer displayed on homepage per request */}

      {/* What is 365-Smiles? */}
      {/* Pledge Certificate Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-16">
        <div className="p-0 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Recognition & Credibility</h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">Certificate earned from the <span className="font-semibold">Department of Social Justice and Empowerment, Government of India</span>.</p>
            <a href="/pledge-certificate.pdf" target="_blank" rel="noreferrer" className="inline-block mt-4 text-sm font-medium px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition">View Certificate</a>
          </div>
          <div className="w-full md:w-56 aspect-[4/3] overflow-hidden">
            <Image src="/pledge-certificate-1.png" alt="Pledge Certificate" width={448} height={336} className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
      <section id="about" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">What is 365-Smiles?</h2>
            <p className="mt-4 text-white/85">
              A community-led initiative enabling everyday celebrations to fund essential care across India—one day at a time. 
            </p>
            <p className="mt-3 text-white/85">
              Through verified partners, transparent tracking, and local delivery, donations reach those in need with dignity. 
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
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
          <div className="relative mt-10 md:mt-0 flex items-center justify-center">
            <div className="relative aspect-square w-64 md:w-80 rounded-full overflow-hidden shadow-lg">
              <video
                src="/india.mp4"
                className="absolute inset-0 h-full w-full object-cover scale-110"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQs (editable content area) */}
      <section id="faqs" className="py-16 md:py-20 bg-gradient-to-b from-gray-950 to-black">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
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
      <footer className="border-t border-white/10 bg-black/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-semibold text-white/90">365 Smiles</h3>
            <p className="mt-2 text-white/70">
              Simple, transparent, and community-driven giving.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white/90">Links</h4>
            <ul className="mt-2 space-y-2 text-white/80">
              <li><Link href="/calendar" className="hover:text-white">Donate</Link></li>
              <li><Link href="#about" className="hover:text-white">About</Link></li>
              <li><Link href="#impact" className="hover:text-white">Impact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white/90">Contact</h4>
            <ul className="mt-2 space-y-2 text-white/80">
              <li><a href="mailto:hello@365smiles.org" className="hover:text-white">365smilestrust@gmail.com</a></li>
              <li><a href="tel:+919740221999" className="hover:text-white">+91 9740221999</a></li>
              <li><a href="https://maps.app.goo.gl/BXkaJ1rM88RF6as79" target="_blank" className="hover:text-white" rel="noreferrer">Bangalore, India</a></li>
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
        <div className="border-t border-white/10 py-5 text-center text-white/60 text-sm tracking-wide">
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
