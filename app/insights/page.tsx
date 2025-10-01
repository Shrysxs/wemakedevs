"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface InsightData {
  summary: string;
  nudges: string[];
  alternatives: Array<{ type: string; title: string; url?: string; description?: string }>;
}

export default function InsightsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InsightData | null>(null);

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

        const res = await fetch(`/api/insights?userId=${encodeURIComponent(uid)}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to fetch insights');
        }
        const j = await res.json();
        // API returns { success: true, data }
        setData(j.data);
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Insights</h1>
          <button onClick={() => router.push('/dashboard')} className="px-4 py-2 border rounded">
            Back to Dashboard
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && data && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="rounded border p-6 bg-white">
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              <p className="text-gray-800">{data.summary}</p>
            </div>

            {/* Nudges */}
            <div className="rounded border p-6 bg-white">
              <h2 className="text-lg font-semibold mb-3">Nudges</h2>
              {data.nudges?.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {data.nudges.map((nudge, idx) => (
                    <li key={idx}>{nudge}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">No nudges yet.</p>
              )}
            </div>

            {/* Alternatives */}
            <div className="rounded border p-6 bg-white">
              <h2 className="text-lg font-semibold mb-3">Alternatives</h2>
              {data.alternatives?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.alternatives.map((alt, idx) => (
                    <a
                      key={idx}
                      href={alt.url || '#'}
                      target={alt.url ? '_blank' : undefined}
                      rel={alt.url ? 'noreferrer' : undefined}
                      className="block border rounded p-4 hover:shadow"
                    >
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{alt.type}</div>
                      <div className="font-medium">{alt.title}</div>
                      {alt.description && <div className="text-sm text-gray-700 mt-1">{alt.description}</div>}
                      {alt.url && <div className="text-xs text-indigo-600 mt-2 underline">Open link</div>}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No alternatives yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
