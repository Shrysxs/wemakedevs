"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AppUsage } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Zap, Brain } from 'lucide-react';

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
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 text-lg">Track your digital wellness journey</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 text-lg">Loading your data...</div>
          </div>
        )}
        
        {error && (
          <Card className="border-red-900 bg-red-950/20">
            <CardContent className="pt-6">
              <p className="text-red-400 text-lg">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Usage Card */}
              <Card className="hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Screen Time</CardTitle>
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <CardDescription>Total minutes today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{data?.totalMinutes ?? 0}</span>
                    <span className="text-2xl text-gray-400">min</span>
                  </div>
                  <Button 
                    onClick={() => router.push('/usage')} 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    Add Usage
                  </Button>
                </CardContent>
              </Card>

              {/* Focus Session Card */}
              <Card className="hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Focus Mode</CardTitle>
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <CardDescription>
                    {activeSessionId ? 'Session in progress' : 'Start a focus session'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeSessionId ? (
                    <>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-5xl font-bold text-white">{minutesSince(activeStartedAt!)}</span>
                        <span className="text-2xl text-gray-400">min</span>
                      </div>
                      <Button onClick={endFocus} variant="destructive" className="w-full">
                        End Focus Session
                      </Button>
                    </>
                  ) : (
                    <Button onClick={startFocus} className="w-full">
                      Start Focus Session
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Apps */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Top Apps Today</CardTitle>
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <CardDescription>Your most used applications</CardDescription>
              </CardHeader>
              <CardContent>
                {topThree.length === 0 ? (
                  <p className="text-gray-400">No usage logged yet. Add your first entry!</p>
                ) : (
                  <div className="space-y-4">
                    {topThree.map((app, idx) => (
                      <div key={app.name} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
                            {idx + 1}
                          </div>
                          <span className="text-lg font-medium text-white">{app.name}</span>
                        </div>
                        <span className="text-xl font-bold text-white">{app.minutes} <span className="text-sm text-gray-400">min</span></span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Focus Sessions List */}
            {todaySessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Today's Focus Sessions</CardTitle>
                  <CardDescription>{todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''} completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaySessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-gray-300">
                          {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {s.ended_at && ' – ' + new Date(s.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-lg font-semibold text-white">
                          {durationBetween(s.started_at, s.ended_at)} min
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">AI Insights</CardTitle>
                    <CardDescription>Personalized recommendations for you</CardDescription>
                  </div>
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <p className="text-gray-400">Generating insights...</p>
                ) : !insights || insights.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No insights available yet.</p>
                    <Button onClick={() => router.push('/insights')} variant="outline">
                      View All Insights
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {insights.map((s, idx) => (
                      <div key={`${s.title}-${idx}`} className="p-4 bg-gray-800/50 rounded-lg space-y-2">
                        <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                        <p className="text-gray-300">{s.description}</p>
                        {s.link && (
                          <a
                            href={s.link}
                            target={s.link.startsWith('http') ? '_blank' : undefined}
                            rel={s.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="inline-block text-white hover:text-gray-300 underline transition-colors mt-2"
                          >
                            Learn more →
                          </a>
                        )}
                      </div>
                    ))}
                    <Button onClick={() => router.push('/insights')} variant="outline" className="w-full">
                      View All Insights
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

