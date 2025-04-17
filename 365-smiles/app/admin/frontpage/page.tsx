'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabaseClient';

export default function AdminFrontpage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [adminEmail, setAdminEmail] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [verifiedCount, setVerifiedCount] = useState<number | null>(null);

  useEffect(() => {
    const getUserAndStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
        return;
      }

      setAdminEmail(user.email || '');

      // Fetch stats from donations
      const { data: totalData } = await supabase
        .from('donations')
        .select('amount')
        .not('status', 'is', null); // skip unverified/null entries

      const verified = await supabase
        .from('donations')
        .select('*', { count: 'exact' })
        .eq('status', 'verified');

      const sum = totalData?.reduce((acc, item) => acc + parseFloat(item.amount), 0) || 0;
      setTotalAmount(sum);
      setVerifiedCount(verified.count || 0);
    };

    getUserAndStats();
  }, []);

  return (
    <main className="max-w-2xl mx-auto text-center p-8 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">👋 Welcome to SmileTeam Panel</h1>
      <p className="text-md text-gray-600">Logged in as: <strong>{adminEmail}</strong></p>

      <div className="grid grid-cols-2 gap-4 text-white">
        <div className="bg-green-500 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold">Total Donations</h2>
          <p className="text-2xl">₹ {totalAmount ?? '...'}</p>
        </div>
        <div className="bg-indigo-500 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold">Verified Donors</h2>
          <p className="text-2xl">{verifiedCount ?? '...'}</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/admin/dashboard')}
        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg mt-6"
      >
        Go to Dashboard
      </button>
    </main>
  );
}
