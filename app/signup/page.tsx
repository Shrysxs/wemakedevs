"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const user = data.user;
      if (user) {
        // Call server to ensure profile row exists
        await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, email: user.email }),
        }).catch(() => {});
      }

      router.replace('/onboarding');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign up');
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
            <h2 className="text-xl font-semibold text-white">Create your account</h2>
            <p className="text-gray-400 text-sm mt-2">Start your journey to better productivity</p>
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
              placeholder="Create a password (min. 6 characters)"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-white hover:text-gray-300 underline transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
