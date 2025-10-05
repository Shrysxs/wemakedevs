"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const GOALS = ["Fitness", "Coding", "Reading", "Sleep", "Mental Health"] as const;
const INSPIRATIONS = ["Videos", "Music", "Community", "Quotes"] as const;
const DISTRACTIONS = ["Morning", "Afternoon", "Night"] as const;

type Goal = typeof GOALS[number];
type Inspiration = typeof INSPIRATIONS[number];
type Distraction = typeof DISTRACTIONS[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [goal, setGoal] = useState<Goal | "">("");
  const [skill, setSkill] = useState<string>("");
  const [inspiration, setInspiration] = useState<Inspiration | "">("");
  const [distraction, setDistraction] = useState<Distraction | "">("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(error.message);
        return;
      }
      const uid = data.user?.id ?? null;
      setUserId(uid);
      // If not logged in, send to login
      if (!uid) router.replace('/login');
    };
    fetchUser();
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    if (!goal || !inspiration || !distraction) {
      setError('Please complete all selections');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          goal,
          skill: skill || null,
          inspiration,
          distraction,
        })
        .eq('id', userId);

      if (error) throw error;

      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
        <h1 className="text-2xl font-semibold">Tell us about your focus</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Goal */}
        <div className="space-y-1">
          <label className="block text-sm text-gray-300">What&apos;s your main goal?</label>
          <select
            className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:border-gray-500 focus:ring-0 focus:outline-none"
            value={goal}
            onChange={(e) => setGoal(e.target.value as Goal)}
            required
          >
            <option value="" disabled>Select a goal</option>
            {GOALS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Skill */}
        <div className="space-y-1">
          <label className="block text-sm text-gray-300">What skill do you want to improve?</label>
          <input
            type="text"
            className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-0 focus:outline-none"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. DSA, writing, sleep hygiene"
          />
        </div>

        {/* Inspiration */}
        <div className="space-y-1">
          <label className="block text-sm text-gray-300">What inspires you?</label>
          <select
            className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:border-gray-500 focus:ring-0 focus:outline-none"
            value={inspiration}
            onChange={(e) => setInspiration(e.target.value as Inspiration)}
            required
          >
            <option value="" disabled>Select one</option>
            {INSPIRATIONS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        {/* Distraction */}
        <div className="space-y-1">
          <label className="block text-sm text-gray-300">When are you most distracted?</label>
          <select
            className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:border-gray-500 focus:ring-0 focus:outline-none"
            value={distraction}
            onChange={(e) => setDistraction(e.target.value as Distraction)}
            required
          >
            <option value="" disabled>Select time</option>
            {DISTRACTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

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
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
