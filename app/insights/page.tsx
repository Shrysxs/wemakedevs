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
              <h2 className="text-lg font-semibold mb-3">Recommended Videos & Resources</h2>
              {data.alternatives?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.alternatives.map((alt, idx) => (
                    <a
                      key={idx}
                      href={alt.url || '#'}
                      target={alt.url ? '_blank' : undefined}
                      rel={alt.url ? 'noreferrer' : undefined}
                      className="block border rounded p-4 hover:shadow transition-shadow duration-200 hover:border-indigo-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{alt.type}</div>
                        {alt.type.toLowerCase().includes('video') && (
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="font-medium text-gray-900 mb-1">{alt.title}</div>
                      {alt.description && <div className="text-sm text-gray-700 mb-2">{alt.description}</div>}
                      {alt.url && (
                        <div className="text-xs text-indigo-600 font-medium flex items-center">
                          <span>Watch Now</span>
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 text-sm">No video recommendations available yet.</p>
                  <p className="text-gray-500 text-xs mt-1">Complete your usage tracking to get personalized content suggestions.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
