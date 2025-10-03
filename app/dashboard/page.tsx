"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AppUsage } from '@/types';

interface DashboardData {
  totalMinutes: number;
  topApps: AppUsage[];
}

type Suggestion = {
  title: string;
  description: string;
  link?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<Suggestion[] | null>(null);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(true);
  // Focus state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeStartedAt, setActiveStartedAt] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0); // forces re-render each minute
  const [todaySessions, setTodaySessions] = useState<Array<{ id: string; started_at: string; ended_at: string | null }>>([]);

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

  useEffect(() => {
    const runInsights = async () => {
      if (!userId) return;
      setInsightsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];

        // 1) Try to get today's insights directly from Supabase
        const { data: row, error } = await supabase
          .from('insights_daily')
          .select('suggestions')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        if (error && (error as any).code !== 'PGRST116') {
          throw error;
        }

        if (row?.suggestions && Array.isArray(row.suggestions)) {
          setInsights(row.suggestions as Suggestion[]);
          return;
        }

        // 2) If not found, request generation via API with Bearer token
        const { data: sessionRes } = await supabase.auth.getSession();
        const token = sessionRes.session?.access_token;

        if (!token) {
          // Can't generate without a token; leave insights null
          setInsights(null);
          return;
        }

        const genRes = await fetch('/api/generate-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!genRes.ok) {
          // Non-fatal: we simply show fallback text
          setInsights(null);
          return;
        }

        const genJson = await genRes.json();
        const suggestions: Suggestion[] | undefined = genJson?.data;
        setInsights(Array.isArray(suggestions) ? suggestions : null);
      } catch (e) {
        // Non-fatal; keep dashboard usable
        setInsights(null);
      } finally {
        setInsightsLoading(false);
      }
    };

    runInsights();
  }, [userId]);

  // Load focus sessions (and detect active session)
  useEffect(() => {
    if (!userId) return;
    const loadFocus = async () => {
      // Detect active session
      const { data: active, error: activeErr } = await supabase
        .from('focus_sessions')
        .select('id, started_at, ended_at')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!activeErr && active) {
        setActiveSessionId(active.id);
        setActiveStartedAt(active.started_at);
      } else {
        setActiveSessionId(null);
        setActiveStartedAt(null);
      }

      // Load today's sessions
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const { data: sessions, error } = await supabase
        .from('focus_sessions')
        .select('id, started_at, ended_at')
        .eq('user_id', userId)
        .gte('started_at', start.toISOString())
        .lt('started_at', end.toISOString())
        .order('started_at', { ascending: true });
      if (!error && sessions) setTodaySessions(sessions as any);
    };
    loadFocus();
  }, [userId, tick]);

  // Timer tick every 30s to keep timer fresh (and durations in list for ongoing)
  useEffect(() => {
    if (!activeSessionId) return;
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, [activeSessionId]);

  const minutesSince = (iso: string) => {
    const start = new Date(iso).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - start) / 60000));
  };

  const durationBetween = (startIso: string, endIso: string | null) => {
    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 60000));
  };

  const startFocus = async () => {
    if (!userId || activeSessionId) return;
    const res = await fetch('/api/focus/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return;
    const j = await res.json();
    setActiveSessionId(j.sessionId);
    setActiveStartedAt(j.started_at);
    setTick((t) => t + 1);
  };

  const endFocus = async () => {
    if (!userId || !activeSessionId) return;
    const res = await fetch('/api/focus/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId: activeSessionId }),
    });
    if (!res.ok) return;
    // const j = await res.json(); // ended_at not needed here
    setActiveSessionId(null);
    setActiveStartedAt(null);
    setTick((t) => t + 1); // refresh list
  };

  const topThree = (data?.topApps || []).slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="reclaim-brand-small">RECLAIM</h1>
            <p className="text-gray-400 text-sm mt-1">Dashboard</p>
          </div>
          <button
            onClick={() => router.push('/insights')}
            className="btn-accent"
          >
            AI Insights
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-8">
            <div className="card-minimal flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total minutes today</p>
                <p className="text-4xl font-bold text-white">{data?.totalMinutes ?? 0}</p>
              </div>
              <div>
                <button
                  onClick={() => router.push('/usage')}
                  className="btn-secondary"
                >
                  Add Usage
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Top apps today</h2>
              {topThree.length === 0 ? (
                <p className="text-gray-400 text-sm">No usage logged yet.</p>
              ) : (
                <div className="card-minimal">
                  {topThree.map((app) => (
                    <div key={app.name} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                      <span className="font-medium text-white">{app.name}</span>
                      <span className="text-sm text-gray-400">{app.minutes} min</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Focus controls */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Focus</h2>
              <div className="card-minimal flex items-center justify-between">
                <div>
                  {activeSessionId ? (
                    <>
                      <p className="text-sm text-gray-400">Focus session active</p>
                      <p className="text-2xl font-semibold text-white">{minutesSince(activeStartedAt!)} min</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No active focus session</p>
                  )}
                </div>
                <div className="flex gap-3">
                  {!activeSessionId ? (
                    <button onClick={startFocus} className="btn-success">
                      Start Focus
                    </button>
                  ) : (
                    <button onClick={endFocus} className="btn-danger">
                      End Focus
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-white">Today&apos;s Focus Sessions</h3>
                {todaySessions.length === 0 ? (
                  <p className="text-gray-400 text-sm">No focus sessions yet today.</p>
                ) : (
                  <div className="card-minimal">
                    {todaySessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                        <span className="text-sm text-gray-300">
                          {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {s.ended_at && ' – '}
                          {s.ended_at
                            ? new Date(s.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {durationBetween(s.started_at, s.ended_at)} min
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Today&apos;s Insights</h2>
              {insightsLoading ? (
                <p className="text-gray-400 text-sm">Loading insights...</p>
              ) : !insights || insights.length === 0 ? (
                <p className="text-gray-400 text-sm">No insights for today yet.</p>
              ) : (
                <div className="card-minimal space-y-4">
                  {insights.map((s, idx) => (
                    <div key={`${s.title}-${idx}`} className="space-y-2">
                      <p className="font-medium text-white">{s.title}</p>
                      <p className="text-sm text-gray-300">{s.description}</p>
                      {s.link && (
                        <a
                          href={s.link}
                          target={s.link.startsWith('http') ? '_blank' : undefined}
                          rel={s.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                        >
                          Learn more
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

