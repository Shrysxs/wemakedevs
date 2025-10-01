"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AppUsage } from '@/types';

interface DashboardData {
  totalMinutes: number;
  topApps: AppUsage[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Ensure authenticated
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const uid = auth.user?.id ?? null;
        setUserId(uid);
        if (!uid) {
          router.replace('/login');
          return;
        }

        // Fetch dashboard usage for today
        const res = await fetch(`/api/dashboard?userId=${encodeURIComponent(uid)}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to load dashboard');
        }
        const j = await res.json();
        setData(j);
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const topThree = (data?.topApps || []).slice(0, 3);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button
            onClick={() => router.push('/insights')}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            Get My AI Insights
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-6">
            <div className="rounded border p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total minutes today</p>
                <p className="text-4xl font-bold">{data?.totalMinutes ?? 0}</p>
              </div>
              <div>
                <button
                  onClick={() => router.push('/usage')}
                  className="px-4 py-2 border rounded"
                >
                  Add Usage
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Top apps today</h2>
              {topThree.length === 0 ? (
                <p className="text-gray-600 text-sm">No usage logged yet.</p>
              ) : (
                <ul className="divide-y rounded border">
                  {topThree.map((app) => (
                    <li key={app.name} className="flex items-center justify-between p-3">
                      <span className="font-medium">{app.name}</span>
                      <span className="text-sm text-gray-700">{app.minutes} min</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
