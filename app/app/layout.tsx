'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/app/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { appSerif, appType } from './fonts';

type AccessInfo = { ok: boolean; kind: string; until: string | null; daysLeft: number | null };

// Pages a person can still open after their access ends.
const OPEN_WHEN_LAPSED = ['/app/keep', '/app/settings'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [access, setAccess] = React.useState<AccessInfo | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user
      .getIdToken()
      .then((token) => fetch('/api/app/access', { headers: { Authorization: `Bearer ${token}` } }))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && d && setAccess(d))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  const lapsed = access && !access.ok;
  React.useEffect(() => {
    if (lapsed && !OPEN_WHEN_LAPSED.some((p) => pathname.startsWith(p))) router.replace('/app/keep');
  }, [lapsed, pathname, router]);

  const shell = `sp-app ${appSerif.variable} ${appType.variable}`;

  if (loading || !user) {
    return (
      <div className={`${shell} flex h-screen items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-[color:var(--app-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Only the included book access shows a countdown; subscribers and admins don't need one.
  const daysLeft = access?.ok && access.kind === 'book' ? access.daysLeft : null;

  return (
    <div className={`${shell} flex min-h-screen`}>
      <Sidebar daysLeft={daysLeft} />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
