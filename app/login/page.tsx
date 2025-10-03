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
    <div className="container-centered p-6">
      <div className="auth-form">
        {/* RECLAIM Branding */}
        <div className="text-center mb-8">
          <h1 className="reclaim-brand">RECLAIM</h1>
          <p className="text-gray-400 text-sm mt-2">Take back control of your time</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              className="input-minimal w-full"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              className="input-minimal w-full"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={useDemo}
            className="btn-secondary w-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : 'Try Demo Account'}
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a 
                href="/signup" 
                className="text-white hover:text-gray-300 underline transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

