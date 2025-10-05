"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Predefined apps with display names
interface AppEntry {
  name: string;
  displayName: string;
  minutes: number | '';
}

const PREDEFINED_APPS = [
  { name: 'instagram', displayName: 'Instagram' },
  { name: 'youtube', displayName: 'YouTube' },
  { name: 'netflix', displayName: 'Netflix' },
  { name: 'twitter', displayName: 'Twitter' },
  { name: 'reddit', displayName: 'Reddit' },
  { name: 'pinterest', displayName: 'Pinterest' },
  { name: 'mobile_games', displayName: 'Mobile Games' },
];

// Helper function to format minutes to hours and minutes
function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export default function UsageEntryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState<string>('');
  const [rows, setRows] = useState<AppEntry[]>([{ name: '', displayName: '', minutes: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);

  useEffect(() => {
    // Get user and default date (today)
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(error.message);
        return;
      }
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) router.replace('/login');
      
      // Set today as default and update in real-time
      const updateDate = () => {
        const today = new Date().toISOString().split('T')[0];
        setDateStr(today);
      };
      
      updateDate();
      // Update date every minute to keep it current
      const interval = setInterval(updateDate, 60000);
      
      return () => clearInterval(interval);
    };
    init();
  }, [router]);

  // Calculate total minutes whenever rows change
  useEffect(() => {
    const total = rows.reduce((sum, row) => {
      return sum + (typeof row.minutes === 'number' ? row.minutes : 0);
    }, 0);
    setTotalMinutes(total);
  }, [rows]);

  const addRow = () => {
    // Check if we can add more apps (limit to predefined apps)
    if (rows.length < PREDEFINED_APPS.length) {
      setRows((r) => [...r, { name: '', displayName: '', minutes: '' }]);
    }
  };
  
  const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx));

  const updateRow = (idx: number, patch: Partial<AppEntry>) => {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    // Normalize/validate
    const apps = rows
      .map((r) => ({ 
        name: r.name, 
        minutes: Number(r.minutes || 0) 
      }))
      .filter((r) => r.name.length > 0 && Number.isFinite(r.minutes) && r.minutes >= 0);

    if (apps.length === 0) {
      setError('Please add at least one app with minutes.');
      return;
    }

    // Check if selected date is in the future
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      setError('Cannot select future dates. Please choose today or a past date.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, date: dateStr, apps }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to save usage');
      }

      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to save usage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Log your screen time</h1>
          {totalMinutes > 0 && (
            <div className="text-sm text-gray-400">
              Total: {formatTime(totalMinutes)}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm bg-red-900 border border-red-700 px-4 py-3 rounded-lg">{error}</p>}

        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Date</label>
          <input
            type="date"
            className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:border-gray-500 focus:ring-0 focus:outline-none"
            value={dateStr}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            onChange={(e) => setDateStr(e.target.value)}
            required
          />
          <p className="text-xs text-gray-400">Date updates automatically in real-time</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Apps</label>
            <button
              type="button"
              onClick={addRow}
              className="text-sm px-3 py-1 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              disabled={rows.length >= PREDEFINED_APPS.length}
            >
              + Add app
            </button>
          </div>

          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <select
                  className="col-span-6 border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:border-gray-500 focus:ring-0 focus:outline-none"
                  value={row.name}
                  onChange={(e) => {
                    const selectedApp = PREDEFINED_APPS.find(app => app.name === e.target.value);
                    updateRow(idx, { 
                      name: e.target.value, 
                      displayName: selectedApp?.displayName || '' 
                    });
                  }}
                  required
                >
                  <option value="" disabled>Select an app</option>
                  {PREDEFINED_APPS
                    .filter(app => !rows.some((r, i) => i !== idx && r.name === app.name))
                    .map((app) => (
                      <option key={app.name} value={app.name}>{app.displayName}</option>
                    ))}
                </select>
                <input
                  type="number"
                  min={0}
                  placeholder="Minutes"
                  className="col-span-4 border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-0 focus:outline-none"
                  value={row.minutes}
                  onChange={(e) => updateRow(idx, { minutes: e.target.value === '' ? '' : Number(e.target.value) })}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="col-span-2 px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:bg-red-600 hover:border-red-600 transition-colors"
                  disabled={rows.length === 1}
                  title={rows.length === 1 ? 'At least one entry is required' : 'Remove'}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            style={{ 
              backgroundColor: '#0A0A0A',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#10B981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0A0A0A';
            }}
            disabled={loading || !userId}
          >
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
