'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, Edit, Users, Swords, ClipboardList, BookOpen, Trophy, Upload, LogOut, Sun, Moon, ChevronUp, Settings, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { useAdmin } from '@/lib/hooks/useAdmin';

const navItems = [
  { href: '/app', icon: Home, label: 'Dashboard' },
  { href: '/app/analyze', icon: Search, label: 'Analyze' },
  { href: '/app/chat', icon: MessageSquare, label: 'Strategic Coach' },
  { href: '/app/rewrite', icon: Edit, label: 'Message Optimizer' },
  { href: '/app/people', icon: Users, label: 'People' },
  { href: '/app/training', icon: Swords, label: 'Training Arena' },
  { href: '/app/field-ops', icon: ClipboardList, label: 'Field Ops' },
  { href: '/app/techniques', icon: BookOpen, label: 'Techniques' },
  { href: '/app/score', icon: Trophy, label: 'Persuasion Score' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const isAdmin = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => href === '/app' ? pathname === '/app' : pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const linkClass = (href: string) =>
    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
      isActive(href)
        ? 'bg-[#D4A017] text-[#0A0A0A]'
        : 'text-gray-700 dark:text-gray-300 hover:bg-[#E5E2DB] dark:hover:bg-[#222222]'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#F5F2EB] dark:bg-[#1A1A1A] p-4 border-r border-[#E5E2DB] dark:border-[#333333]">
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Shadow Persuasion" className="w-36 dark:hidden" />
            <img src="/logo-dark.png" alt="Shadow Persuasion" className="w-36 hidden dark:block" />
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={linkClass(item.href)}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link href="/app/admin" className={linkClass('/app/admin')}>
                <Upload className="h-5 w-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Compact user footer with popup menu */}
        <div className="relative pt-3 border-t border-gray-200 dark:border-[#333333]" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#444] rounded-lg shadow-lg overflow-hidden">
              <Link
                href="/app/settings"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#E5E2DB] dark:hover:bg-[#222] transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-[#0A0A0A] text-xs font-bold shrink-0">
                {(user?.displayName || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm truncate text-gray-600 dark:text-gray-400 flex-1 text-left">
              {user?.displayName || user?.email}
            </span>
            <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#333] px-4 py-3 flex items-center justify-between">
        <img src="/logo.png" alt="Shadow Persuasion" className="h-8 dark:hidden" />
        <img src="/logo-dark.png" alt="Shadow Persuasion" className="h-8 hidden dark:block" />
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      </header>

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          {/* Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white dark:bg-[#1A1A1A] border-l border-gray-200 dark:border-[#333] flex flex-col">
            {/* Close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={linkClass(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              {isAdmin && (
                <Link href="/app/admin" onClick={() => setMobileMenuOpen(false)} className={linkClass('/app/admin')}>
                  <Upload className="h-5 w-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              )}
            </nav>
            {/* Bottom: user + settings + theme + signout */}
            <div className="p-4 border-t border-gray-200 dark:border-[#333] space-y-2">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-[#0A0A0A] text-xs font-bold">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm truncate text-gray-600 dark:text-gray-400">{user.displayName || user.email}</span>
                </div>
              )}
              <Link href="/app/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] rounded-lg">
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] rounded-lg">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#222] rounded-lg">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
