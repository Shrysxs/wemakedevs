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
      // If not logged in, send to login
      if (!uid) {
        router.replace('/login');
        return;
      }

      // Check for active focus session
      const { data: activeSession, error: sessionError } = await supabase
        .from('focus_sessions')
        .select('id, started_at')
        .eq('user_id', uid)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!sessionError && activeSession) {
        // Resume active session
        setSessionId(activeSession.id);
        const startTime = new Date(activeSession.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalSeconds = selectedMinutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        
        setRemainingSec(remaining);
        setInProgress(true);
      }
    };
    init();
  }, [router, selectedMinutes]);

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
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {successMsg && <p className="text-green-700 text-sm">{successMsg}</p>}

        {!inProgress ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Choose a session length</p>
            <div className="grid grid-cols-3 gap-2">
              {[20, 25, 45].map((m) => (
                <button
                  key={m}
                  className={`px-3 py-2 border rounded transition-colors ${selectedMinutes === m ? 'bg-gray-100 text-black border-gray-100' : 'hover:border-gray-300'}`}
                  onClick={() => setSelectedMinutes(m)}
                  disabled={loading}
                >
                  {m}m
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 text-center">
              Pomodoro sessions: 20min (short), 25min (classic), 45min (deep work)
            </div>
            <button
              onClick={() => startSession(selectedMinutes)}
              className="px-4 py-2 rounded bg-gray-100 text-black disabled:opacity-50"
              disabled={loading || !userId}
            >
              {loading ? 'Starting...' : 'Start Focus'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded border p-6 text-center">
              <div className="text-sm text-gray-600 mb-4">Focus Session Active</div>
              
              {/* Circular Progress Timer */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    className="text-gray-300 transition-all duration-1000 ease-linear"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - (remainingSec / (selectedMinutes * 60)))}`}
                  />
                </svg>
                
                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-900 tracking-wider">
                    {formatTime(remainingSec)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.floor(remainingSec / 60)}:{(remainingSec % 60).toString().padStart(2, '0')} remaining
                  </div>
                </div>
              </div>
              
              <div className="text-gray-700">
                {selectedMinutes}min Pomodoro Session
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-gray-300 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((selectedMinutes * 60 - remainingSec) / (selectedMinutes * 60)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={endSession}
                className="px-6 py-3 rounded bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Ending...' : 'End Session'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
