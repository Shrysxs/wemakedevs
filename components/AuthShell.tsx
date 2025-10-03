"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';

const publicRoutes = new Set<string>([
  '/login',
  '/signup'
]);

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-white text-black font-semibold' 
          : 'text-gray-300 hover:text-white hover:bg-gray-800'
      }`}
    >
      {label}
    </Link>
  );
}

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const isPublic = publicRoutes.has(pathname || '');

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const loggedIn = !!data.user;
      setAuthed(loggedIn);
      if (!loggedIn && !isPublic) {
        router.replace('/login');
      }
    };
    check();
    // Re-check on auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router, isPublic]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // For public routes, render directly without chrome
  if (isPublic) {
    return <>{children}</>;
  }

  // While auth status unknown, avoid flashing protected UI
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="reclaim-brand mb-4">RECLAIM</h1>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authed, we already redirected; render nothing
  if (!authed) return null;

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 p-6 space-y-6">
        <div className="px-2 py-2">
          <h1 className="reclaim-brand-small">RECLAIM</h1>
          <p className="text-gray-400 text-xs mt-1">Take back control</p>
        </div>
        <nav className="space-y-2">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/usage" label="Usage" />
          <NavLink href="/insights" label="Insights" />
          <NavLink href="/focus" label="Focus" />
          <NavLink href="/report" label="Report" />
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-gray-800 bg-black flex items-center justify-end px-6">
          <button
            onClick={handleLogout}
            className="btn-danger text-sm"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
