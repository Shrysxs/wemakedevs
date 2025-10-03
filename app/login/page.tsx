"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const useDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = 'demo@reclaim.com';
      const demoPass = 'demo123';
      setEmail(demoEmail);
      setPassword(demoPass);
      const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
      if (error) throw error;
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to log in with demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Log in</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="space-y-1">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Log in'}
        </button>
        <button
          type="button"
          onClick={useDemo}
          className="w-full border rounded py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Please wait…' : 'Use Demo Account'}
        </button>
        <p className="text-sm">
          No account? <a className="underline" href="/signup">Create one</a>
        </p>
      </form>
    </div>
  );
}

