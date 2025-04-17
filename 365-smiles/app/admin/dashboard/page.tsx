'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const { data, error } = await supabase
  .from('donations')
  .select('*')
  .order('created_at', { ascending: false });

console.log('Fetched donations:', data);
console.log('Supabase error:', error);


      if (error) {
        console.error('Error fetching donations:', error);
      } else {
        setDonations(data || []);
      }

      setLoading(false);
    };

    fetchDonations();
  }, []);

  const updateStatus = async (id: string, current: string) => {
    const newStatus = current === 'pending' ? 'verified' : 'pending';

    const { error } = await supabase
  .from('donations')
  .update({ status: newStatus })
  .eq('id', id);

console.log('Supabase error:', error);

      
      if (error) {
          alert('Error updating status');
        } else {
            setDonations((prev) =>
                prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
        );
    }
  };
  
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📋 Donation Dashboard</h1>

      {loading ? (
        <p>Loading donations...</p>
      ) : donations.length === 0 ? (
        <p>No donations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead>
              <tr className="bg-blue-100 text-black text-left">
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
                <tr key={donation.id} className="border-b text-black hover:bg-gray-50">
                  <td className="p-3">{donation.name}</td>
                  <td className="p-3">{donation.email}</td>
                  <td className="p-3">₹{donation.amount}</td>
                  <td className="p-3">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">{donation.ref_id}</td>
                  <td className="p-3">
                    {donation.screenshot ? (
                      <a
                        href={donation.screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      className={`px-3 py-1 rounded text-white ${
                        donation.status === 'verified'
                          ? 'bg-green-600'
                          : 'bg-orange-500'
                      }`}
                      onClick={() => updateStatus(donation.id, donation.status || 'pending')}
                    >
                      {donation.status || 'pending'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
    
  );
}
