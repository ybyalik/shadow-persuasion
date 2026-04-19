'use client';

/* ════════════════════════════════════════════════════════════
   /admin/books — Book ingestion + knowledge base management

   Currently redirects to /admin/legacy which contains the full
   books/ingest/dedup/taxonomy UI from the previous monolithic
   admin page. Will be fully extracted in a follow-up.
   ════════════════════════════════════════════════════════════ */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function BooksRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    // Small delay so the message is visible on fast navigations
    const t = setTimeout(() => router.replace('/app/admin/legacy'), 400);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="p-6 md:p-10">
      <div className="bg-[#111] border border-[#D4A017]/20 p-6 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A017]/70 mb-2">
          // BOOKS //
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#F4ECD8] mb-2">
          Book Management
        </h1>
        <p className="text-sm text-[#F4ECD8]/70 mb-4">
          Redirecting to the legacy admin page (book upload, knowledge base, dedup, taxonomy all live there).
          This section will be extracted to its own page in a follow-up.
        </p>
        <button
          onClick={() => router.push('/app/admin/legacy')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#C4901A]"
        >
          Open Legacy Admin <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
