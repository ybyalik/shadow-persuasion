'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAdminEmails } from '@/lib/admin';

export function useAdmin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user?.email) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }
    setAdminLoading(true);
    getAdminEmails().then(emails => {
      setIsAdmin(emails.includes(user.email!));
    }).finally(() => {
      setAdminLoading(false);
    });
  }, [user, loading]);

  return { isAdmin, adminLoading };
}
