'use client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const daysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export default function CalendarPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const handleDayClick = (month: number, day: number) => {
    const date = new Date(currentYear, month, day);
    const formatted = format(date, 'yyyy-MM-dd');
    router.push(`/donate?date=${formatted}`);
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">📅 Choose a Day to Donate</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month, monthIndex) => (
          <div key={monthIndex} className="border rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-2 text-center">{month}</h2>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: daysInMonth(monthIndex, currentYear) }, (_, day) => (
                <button
                  key={day}
                  className="bg-blue-100 hover:bg-blue-500 hover:text-white text-sm p-2 rounded"
                  onClick={() => handleDayClick(monthIndex, day + 1)}
                >
                  {day + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
