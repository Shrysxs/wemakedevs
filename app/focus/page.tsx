"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FocusSessionResp {
  id: string;
  userId: string;
  duration: number; // minutes
  reclaimed: number; // minutes
  startedAt: string;
  endedAt: string;
}

export default function FocusPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [remainingSec, setRemainingSec] = useState<number>(0);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(error.message);
        return;
      }
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) router.replace('/login');
    };
    init();
  }, [router]);

  // Countdown effect
  useEffect(() => {
    if (!inProgress) return;
    if (remainingSec <= 0) return;

    timerRef.current = setInterval(() => {
      setRemainingSec((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inProgress, remainingSec]);

  const startSession = async (minutes: number) => {
    if (!userId) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/focus/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, duration: minutes }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to start session');
      const session: FocusSessionResp = json.data;
      setSessionId(session.id);
      setSelectedMinutes(minutes);
      setRemainingSec(minutes * 60);
      setInProgress(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!userId || !sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/focus/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to end session');
      const session: FocusSessionResp = json.data;
      setInProgress(false);
      setSessionId(null);
      setSuccessMsg(`You reclaimed ${session.reclaimed} minutes.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to end');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Focus</h1>
          <button className="px-4 py-2 border rounded" onClick={() => router.push('/dashboard')}>Dashboard</button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {successMsg && <p className="text-green-700 text-sm">{successMsg}</p>}

        {!inProgress ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Choose a session length</p>
            <div className="flex gap-2">
              {[15, 30, 60].map((m) => (
                <button
                  key={m}
                  className={`px-3 py-2 border rounded ${selectedMinutes === m ? 'bg-black text-white' : ''}`}
                  onClick={() => setSelectedMinutes(m)}
                  disabled={loading}
                >
                  {m}m
                </button>
              ))}
            </div>
            <button
              onClick={() => startSession(selectedMinutes)}
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
              disabled={loading || !userId}
            >
              {loading ? 'Starting...' : 'Start Focus'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded border p-6 text-center">
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className="text-5xl font-bold tracking-widest">{formatTime(remainingSec)}</div>
              <div className="mt-2 text-gray-700">Session: {selectedMinutes} minutes</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={endSession}
                className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                disabled={loading}
              >
                End Session
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border rounded"
                disabled={loading}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
