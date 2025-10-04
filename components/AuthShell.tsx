"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, BarChart2, Lightbulb, Clock, Activity, Menu, X, LogOut } from 'lucide-react';

const publicRoutes = new Set<string>([
  '/login',
  '/signup'
]);

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/usage', label: 'Usage', icon: BarChart2 },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/report', label: 'Report', icon: Activity },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'text-white bg-blue-600' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  if (isPublic) {
    return <>{children}</>;
  }

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            RECLAIM
          </motion.h1>
          <div className="text-gray-400 text-sm">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/80 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              className="absolute top-0 right-0 w-64 h-full bg-gray-800 p-6 shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  RECLAIM
                </h1>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      pathname === item.href ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 text-red-400 hover:bg-gray-700 w-full rounded-lg text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-gray-800 flex justify-between items-center">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-gray-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            RECLAIM
          </h1>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </header>
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 border-r border-gray-800 bg-gray-900 p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              RECLAIM
            </h1>
            <p className="text-gray-400 text-sm mt-1">Take back control</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400 w-full p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Page Content */}
        <main className="md:ml-64 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden z-30">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 flex-1 ${
                  isActive 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      <Link 
        href="/focus"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg flex items-center justify-center text-white hover:shadow-xl hover:scale-105 transition-all duration-200 z-20"
      >
        <Clock className="w-6 h-6" />
      </Link>

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
