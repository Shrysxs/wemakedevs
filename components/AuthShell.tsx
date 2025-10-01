"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
      className={`block px-3 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200 font-medium' : ''}`}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  // If not authed, we already redirected; render nothing
  if (!authed) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 border-r bg-white p-4 space-y-2">
        <div className="px-2 py-1 text-sm font-semibold text-gray-700">Reclaim</div>
        <nav className="space-y-1">
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
        <header className="h-12 border-b bg-white flex items-center justify-end px-4">
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </header>
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
