'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  format,
  startOfMonth,
  getDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const now = new Date();
  const [cursor, setCursor] = useState<Date>(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [selected, setSelected] = useState<Date | null>(null);

  const [year, setYear] = useState<number>(now.getFullYear());
  const month = cursor.getMonth();

  // Donated dates cache — Map of yyyy-MM-dd -> donor name
  const [donatedDates, setDonatedDates] = useState<Map<string, string>>(
    new Map()
  );
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donorModal, setDonorModal] = useState<{
    date: string;
    name: string;
  } | null>(null);

  // Cache for already-fetched months to avoid redundant requests (Issue #19)
  const monthCache = useRef<Map<string, Map<string, string>>>(new Map());

  // Scroll ref for months rail
  const monthRailRef = useRef<HTMLDivElement | null>(null);

  // Update cursor when year or month changes by external controls
  useEffect(() => {
    setCursor(new Date(year, month, 1));
  }, [year, month]);

  const currentYear = cursor.getFullYear();
  const currentMonth = cursor.getMonth();
  const totalDays = daysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = startOfMonth(cursor);
  const startWeekday = getDay(firstDayOfMonth);

  // Build calendar cells
  const daysArray = useMemo(() => {
    const blanks = Array.from({ length: startWeekday }, () => null as number | null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [startWeekday, totalDays]);

  const goPrev = () => {
    const nextDate = subMonths(cursor, 1);
    setCursor(nextDate);
    setYear(nextDate.getFullYear());
    scrollMonthIntoView(nextDate.getMonth());
  };

  const goNext = () => {
    const nextDate = addMonths(cursor, 1);
    setCursor(nextDate);
    setYear(nextDate.getFullYear());
    scrollMonthIntoView(nextDate.getMonth());
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const formatted = format(date, 'yyyy-MM-dd');
    if (donatedDates.has(formatted)) return;
    setSelected(date);
    router.push(`/donate?date=${formatted}`);
  };

  const scrollMonthIntoView = (monthIndex: number) => {
    if (!monthRailRef.current) return;
    const container = monthRailRef.current;
    const child = container.querySelector<HTMLElement>(
      `[data-month="${monthIndex}"]`
    );
    if (child) {
      const left =
        child.offsetLeft -
        container.clientWidth / 2 +
        child.clientWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  };

  // Fetch donation dates with caching (Issue #19)
  useEffect(() => {
    let active = true;
    const cacheKey = `${currentYear}-${currentMonth}`;

    (async () => {
      // Check cache first
      const cached = monthCache.current.get(cacheKey);
      if (cached) {
        if (active) {
          setDonatedDates(cached);
          setLoadingDonations(false);
        }
        return;
      }

      setLoadingDonations(true);
      setDonatedDates(new Map());

      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);

      const startIso = new Date(
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
      ).toISOString();
      const endIso = new Date(
        Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
      ).toISOString();

      let data: { date?: string; created_at?: string; name?: string }[] | null = null;
      let error: { message?: string } | null = null;

      // Try 'date' column first
      ({ data, error } = await supabase
        .from('donations')
        .select('date,name')
        .not('date', 'is', null)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd')));

      // Fallback to 'created_at'
      if (error || !data || data.length === 0) {
        const res = await supabase
          .from('donations')
          .select('created_at,name')
          .gte('created_at', startIso)
          .lte('created_at', endIso);
        data = res.data ?? [];
        error = res.error ?? null;
      }

      if (!active) return;

      if (error) {
        console.warn('Donations fetch error:', error);
        setLoadingDonations(false);
        return;
      }

      const map = new Map<string, string>();
      for (const row of data as {
        date?: string;
        created_at?: string;
        name?: string;
      }[]) {
        const raw = row.date ?? row.created_at;
        if (!raw) continue;
        const name = row.name ?? 'a donor';
        const key = /^\d{4}-\d{2}-\d{2}$/.test(raw)
          ? raw
          : format(new Date(raw), 'yyyy-MM-dd');
        map.set(key, name);
      }

      // Cache the result
      monthCache.current.set(cacheKey, map);
      setDonatedDates(map);
      setLoadingDonations(false);
    })();

    return () => {
      active = false;
    };
  }, [supabase, currentYear, currentMonth]);

  useEffect(() => {
    scrollMonthIntoView(currentMonth);
  }, [currentMonth]);

  const handleMonthSelect = (mIdx: number) => {
    const next = new Date(year, mIdx, 1);
    setCursor(next);
    scrollMonthIntoView(mIdx);
  };

  const MIN_YEAR = now.getFullYear() - 2;
  const MAX_YEAR = now.getFullYear() + 10;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#A36BFF] via-[#F08AD1] to-[#FFC1A3] p-6 md:p-10">
      {donorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Date already sponsored"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDonorModal(null)}
          />
          <div className="relative z-10 max-w-md w-full bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              Date already sponsored
            </h3>
            <p className="text-sm text-gray-700 mb-4">{`It's ${donorModal.name} — already donated on ${donorModal.date}. Please choose another date.`}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setDonorModal(null)}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Heading */}
      <div className="mx-auto max-w-5xl text-center mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          Make a birthday wish come true—turn today into someone else&apos;s
          better tomorrow.
        </h1>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="relative rounded-3xl bg-white shadow-2xl overflow-hidden">
          <div className="pointer-events-none absolute -left-[20%] top-0 h-full w-1/2 rounded-full bg-[#3e4b85] opacity-70" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12">
            {/* Main Calendar */}
            <div className="col-span-12 lg:col-span-8 p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Previous month"
                    onClick={goPrev}
                    className="h-9 w-9 grid place-items-center rounded-full hover:bg-gray-100 active:scale-95 transition"
                  >
                    ‹
                  </button>
                  <div className="text-xl md:text-2xl font-semibold">
                    {format(cursor, 'MMM d, EEE')}
                  </div>
                  <button
                    aria-label="Next month"
                    onClick={goNext}
                    className="h-9 w-9 grid place-items-center rounded-full hover:bg-gray-100 active:scale-95 transition"
                  >
                    ›
                  </button>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-pink-400" />
                </div>
              </div>

              {/* Weekdays */}
              <div
                className="grid grid-cols-7 text-center text-xs md:text-sm text-indigo-500 font-medium mb-3"
                role="row"
              >
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-2" role="columnheader">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div
                className="grid grid-cols-7 gap-2 md:gap-3"
                role="grid"
                aria-label="Calendar days"
              >
                {daysArray.map((val, idx) => {
                  if (val === null)
                    return <div key={`b-${idx}`} className="h-10 md:h-12" />;

                  const cellDate = new Date(currentYear, currentMonth, val);
                  const key = format(cellDate, 'yyyy-MM-dd');
                  const donated = donatedDates.has(key);
                  const donorName = donated
                    ? donatedDates.get(key) ?? 'a donor'
                    : null;
                  const today = isToday(cellDate);
                  const isSelected =
                    selected && format(selected, 'yyyy-MM-dd') === key;

                  const base =
                    'relative h-10 md:h-12 rounded-full text-sm md:text-base transition';

                  let classes =
                    'bg-gray-50 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700';
                  if (isSelected)
                    classes = 'bg-indigo-600 text-white shadow-md';
                  if (today && !isSelected && !donated)
                    classes =
                      'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300';
                  if (donated)
                    classes =
                      'bg-rose-100 text-rose-700 ring-2 ring-rose-300 cursor-not-allowed';

                  return (
                    <button
                      key={val}
                      onClick={() => {
                        if (donated) {
                          setDonorModal({ date: key, name: donorName! });
                          return;
                        }
                        handleDayClick(val);
                      }}
                      className={`${base} ${classes}`}
                      title={
                        donated
                          ? `Already sponsored by ${donorName}`
                          : 'Select date'
                      }
                      role="gridcell"
                      aria-label={`${format(cellDate, 'MMMM d, yyyy')}${donated ? ` - sponsored by ${donorName}` : ''}${today ? ' (today)' : ''}`}
                    >
                      {val}
                      {today && !isSelected && !donated && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                      {donated && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer note */}
              <div className="mt-4 text-xs text-gray-500">
                {loadingDonations
                  ? 'Loading sponsorships…'
                  : 'Select a date to sponsor a day.'}
              </div>
            </div>

            {/* Right Sidebar: Year slider + scrollable months */}
            <aside className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 md:p-8 bg-white/70">
              {/* Year slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">Year</span>
                  <span className="text-sm text-black font-semibold">
                    {year}
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  step={1}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                  aria-label="Select year"
                />
              </div>

              {/* Scrollable month list */}
              <div
                ref={monthRailRef}
                className="h-64 overflow-x-hidden overflow-y-auto pr-2 scroll-smooth"
              >
                <ul className="space-y-2" role="listbox" aria-label="Select month">
                  {MONTHS.map((m, idx) => {
                    const active =
                      idx === currentMonth && year === currentYear;
                    return (
                      <li key={m}>
                        <button
                          type="button"
                          data-month={idx}
                          onClick={() => handleMonthSelect(idx)}
                          role="option"
                          aria-selected={active}
                          className={[
                            'w-full text-left px-4 py-2 rounded-xl transition',
                            active
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-700',
                          ].join(' ')}
                        >
                          {m}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
