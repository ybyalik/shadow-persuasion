'use client';

import { ReactNode } from 'react';

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#0A0A0A] text-white">
      {children}
    </div>
  );
}
