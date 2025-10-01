"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AppEntry {
  name: string;
  minutes: number | '';
}

export default function UsageEntryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState<string>('');
  const [rows, setRows] = useState<AppEntry[]>([{ name: '', minutes: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const today = new Date().toISOString().split('T')[0];
      setDateStr(today);
    };
    init();
  }, [router]);

  const addRow = () => setRows((r) => [...r, { name: '', minutes: '' }]);
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
      .map((r) => ({ name: (r.name || '').trim(), minutes: Number(r.minutes || 0) }))
      .filter((r) => r.name.length > 0 && Number.isFinite(r.minutes) && r.minutes >= 0);

    if (apps.length === 0) {
      setError('Please add at least one app with minutes.');
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
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="space-y-2">
          <label className="block text-sm">Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm">Apps</label>
            <button
              type="button"
              onClick={addRow}
              className="text-sm px-3 py-1 border rounded"
            >
              + Add app
            </button>
          </div>

          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="App Name"
                  className="col-span-6 border rounded px-3 py-2"
                  value={row.name}
                  onChange={(e) => updateRow(idx, { name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Minutes"
                  className="col-span-4 border rounded px-3 py-2"
                  value={row.minutes}
                  onChange={(e) => updateRow(idx, { minutes: e.target.value === '' ? '' : Number(e.target.value) })}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="col-span-2 px-3 py-2 border rounded"
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
            className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
            disabled={loading || !userId}
          >
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
