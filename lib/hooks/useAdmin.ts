'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAdminEmails } from '@/lib/admin';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getAdminEmails().then(emails => {
      setIsAdmin(!!user?.email && emails.includes(user.email));
    });
  }, [user]);

  return isAdmin;
}
