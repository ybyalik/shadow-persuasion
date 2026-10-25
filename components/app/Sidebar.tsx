'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, Edit, Users, Swords, ClipboardList, BookOpen, Trophy, Upload, LogOut, Sun, Moon, ChevronUp, Settings, Menu, X, Mic, Target, Zap, Route, HelpCircle, Network, LayoutGrid, Library } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { IS_V3, RESET } from '@/lib/edition';

// Grouped the way a reader uses the app: daily practice, help in the moment,
// getting ready for a conversation, the people and goals in their life, and
// (new edition) the book's own tools and add-ons. Items marked v3 only show when
// the app follows the new edition (lib/edition.ts).
type NavItem = { href: string; icon: typeof Home; label: string; v3?: boolean };

const allGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Every day',
    items: [
      { href: '/app', icon: Home, label: 'Today' },
      { href: '/app/field-ops', icon: ClipboardList, label: RESET.title },
    ],
  },
  {
    title: 'In the moment',
    items: [
      { href: '/app/analyze', icon: Search, label: 'Decode a Message' },
      { href: '/app/assist', icon: Zap, label: 'Right Now' },
      { href: '/app/rewrite', icon: Edit, label: 'Calm My Reply' },
      { href: '/app/choice-check', icon: HelpCircle, label: 'Choice Check', v3: true },
    ],
  },
  {
    title: 'Get ready',
    items: [
      { href: '/app/warroom', icon: Target, label: 'Plan a Conversation' },
      { href: '/app/power-map', icon: Network, label: 'Power Map', v3: true },
      { href: '/app/spar', icon: Mic, label: 'Rehearse It' },
      { href: '/app/training', icon: Swords, label: 'Practice Scenes' },
      { href: '/app/techniques', icon: BookOpen, label: 'Spot the Tactic' },
    ],
  },
  {
    title: 'Your life',
    items: [
      { href: '/app/people', icon: Users, label: 'My People' },
      { href: '/app/campaigns', icon: Route, label: 'Goals' },
      { href: '/app/chat', icon: MessageSquare, label: 'Talk It Through' },
      { href: '/app/score', icon: Trophy, label: 'My Progress' },
    ],
  },
  {
    title: 'The book',
    items: [
      { href: '/app/tools', icon: LayoutGrid, label: 'Eight Tools', v3: true },
      { href: '/app/library', icon: Library, label: 'Your library', v3: true },
    ],
  },
];

const navGroups = allGroups
  .map((g) => ({ ...g, items: g.items.filter((i) => !i.v3 || IS_V3) }))
  .filter((g) => g.items.length > 0);


export function Sidebar({ daysLeft }: { daysLeft?: number | null }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
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
        ? 'bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
        : 'text-[color:var(--app-ink)] hover:bg-[color:var(--app-paper-2)]'
    }`;

  const nav = (close?: () => void) => (
    <>
      {navGroups.map((g) => (
        <div key={g.title} className="mb-4">
          <p className="app-type px-3 mb-1 text-[10.5px] uppercase tracking-[0.2em] text-[color:var(--app-muted)]">{g.title}</p>
          <div className="space-y-0.5">
            {g.items.map((item) => (
              <Link key={item.href} href={item.href} onClick={close} className={linkClass(item.href)}>
                <item.icon className="h-[18px] w-[18px]" />
                <span className="text-[15px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {isAdmin && (
        <Link href="/app/admin" onClick={close} className={linkClass('/app/admin')}>
          <Upload className="h-[18px] w-[18px]" />
          <span className="text-[15px] font-medium">Admin</span>
        </Link>
      )}
    </>
  );

  const brand = (
    <Link href="/app" className="block">
      <span className="app-type text-[13px] tracking-[0.25em] text-[color:var(--app-accent)]">SHADOW PERSUASION</span>
    </Link>
  );

  const daysPill =
    typeof daysLeft === 'number' ? (
      <Link href="/app/keep" className="mx-3 mb-3 block rounded-lg border border-[color:var(--app-gold)] px-3 py-2 text-[13px] leading-snug hover:bg-[color:var(--app-paper-2)]">
        <b>{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</b> of your included access left.{' '}
        <span className="text-[color:var(--app-accent)] underline">Keep the app</span>
      </Link>
    ) : null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex print:!hidden flex-col w-[260px] sticky top-0 h-screen bg-[color:var(--app-paper-2)] p-4 border-r border-[color:var(--app-line)]">
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6 px-3 pt-1">{brand}</div>
          {daysPill}
          <nav>{nav()}</nav>
        </div>

        {/* Compact user footer with popup menu */}
        <div className="relative pt-3 border-t border-[color:var(--app-line)]" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[color:var(--app-card)] border border-[color:var(--app-line)] rounded-lg shadow-lg overflow-hidden">
              <Link
                href="/app/settings"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[color:var(--app-ink)] hover:bg-[color:var(--app-paper-2)] transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[color:var(--app-ink)] hover:bg-[color:var(--app-paper-2)] transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[color:var(--app-oxblood)] hover:bg-[color:var(--app-paper-2)] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[color:var(--app-paper)] transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[color:var(--app-gold)] flex items-center justify-center text-[#0b0a08] text-xs font-bold shrink-0">
                {(user?.displayName || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm truncate text-[color:var(--app-muted)] flex-1 text-left">
              {user?.displayName || user?.email}
            </span>
            <ChevronUp className={`h-4 w-4 text-[color:var(--app-muted)] transition-transform ${menuOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header Bar */}
      <header className="md:hidden print:hidden fixed top-0 left-0 right-0 z-50 bg-[color:var(--app-paper-2)] border-b border-[color:var(--app-line)] px-4 py-3.5 flex items-center justify-between">
        {brand}
        <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6 text-[color:var(--app-ink)]" />
        </button>
      </header>

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          {/* Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-[color:var(--app-paper)] border-l border-[color:var(--app-line)] flex flex-col">
            {/* Close button */}
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--app-line)]">
              <span className="app-type text-[12px] uppercase tracking-[0.2em] text-[color:var(--app-muted)]">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="flex min-h-[44px] min-w-[44px] items-center justify-center">
                <X className="h-5 w-5 text-[color:var(--app-muted)]" />
              </button>
            </div>
            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto p-4">
              {daysPill}
              {nav(() => setMobileMenuOpen(false))}
            </nav>
            {/* Bottom: user + settings + theme + signout */}
            <div className="p-4 border-t border-[color:var(--app-line)] space-y-2">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[color:var(--app-gold)] flex items-center justify-center text-[#0b0a08] text-xs font-bold">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm truncate text-[color:var(--app-muted)]">{user.displayName || user.email}</span>
                </div>
              )}
              <Link href="/app/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[color:var(--app-ink)] hover:bg-[color:var(--app-paper-2)] rounded-lg">
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[color:var(--app-ink)] hover:bg-[color:var(--app-paper-2)] rounded-lg">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[color:var(--app-oxblood)] hover:bg-[color:var(--app-paper-2)] rounded-lg">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
