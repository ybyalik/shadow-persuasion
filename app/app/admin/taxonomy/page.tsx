'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function TaxonomyRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace('/app/admin/legacy'), 400);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="p-6 md:p-10">
      <div className="bg-[#111] border border-[#D4A017]/20 p-6 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A017]/70 mb-2">
          // TAXONOMY //
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#F4ECD8] mb-2">
          Categories & Use Cases
        </h1>
        <p className="text-sm text-[#F4ECD8]/70 mb-4">
          Redirecting to the legacy admin page where taxonomy management currently lives. Will be extracted to its own page in a follow-up.
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
