"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface ReportResponse {
  daily: number[]; // length 7
  apps: { name: string; minutes: number }[];
  streak: number;
  badges: any[];
}

export default function ReportPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const uid = auth.user?.id ?? null;
        setUserId(uid);
        if (!uid) {
          router.replace('/login');
          return;
        }

        const res = await fetch(`/api/report?userId=${encodeURIComponent(uid)}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to fetch report');
        }
        const j = await res.json();
        setReport(j);
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // Build x-axis labels for the last 7 days (oldest -> today)
  const dayLabels = useMemo(() => {
    const labels: string[] = [];
    const start = new Date();
    start.setDate(start.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return labels;
  }, []);

  const lineData = useMemo(() => {
    if (!report) return [];
    return report.daily.map((min, idx) => ({ day: dayLabels[idx], minutes: min }));
  }, [report, dayLabels]);

  const barData = useMemo(() => {
    if (!report) return [];
    // Bar chart expects an array of objects with consistent keys
    return report.apps.map((a) => ({ name: a.name, minutes: a.minutes }));
  }, [report]);

  const under5hDays = useMemo(() => {
    if (!report) return 0;
    return report.daily.filter((m) => m < 300).length; // under 5h (300 minutes)
  }, [report]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Weekly Report</h1>
          <button className="px-4 py-2 border rounded" onClick={() => router.push('/dashboard')}>Dashboard</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && report && (
          <div className="space-y-8">
            {/* Line Chart */}
            <div className="rounded border p-4 bg-white">
              <h2 className="text-lg font-semibold mb-4">Daily Total Minutes (Last 7 Days)</h2>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <LineChart data={lineData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="minutes" stroke="#6366f1" name="Minutes" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="rounded border p-4 bg-white">
              <h2 className="text-lg font-semibold mb-4">App Breakdown (Last 7 Days)</h2>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <BarChart data={barData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="minutes" fill="#10b981" name="Minutes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Streak + Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded border p-4 bg-white">
                <h3 className="text-sm text-gray-600">Streak</h3>
                <p className="text-3xl font-bold">{report.streak} days</p>
                <p className="text-xs text-gray-500 mt-1">Consecutive days with activity</p>
                <p className="text-sm text-gray-700 mt-3">Days under 5h this week: <span className="font-semibold">{under5hDays}</span></p>
              </div>
              <div className="rounded border p-4 bg-white md:col-span-2">
                <h3 className="text-sm text-gray-600 mb-2">Achievements</h3>
                {report.badges && report.badges.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {report.badges.map((b, i) => (
                      <span key={i} className="px-3 py-1 rounded-full border text-sm">{String(b)}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No badges yet. Keep going!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
