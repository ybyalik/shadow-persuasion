'use client';

/* ════════════════════════════════════════════════════════════
   /admin/techniques — Technique deduplication
   Extracted from the former monolithic admin page.
   ════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { Loader2, Shuffle } from 'lucide-react';

type MergeGroup = {
  canonical: string;
  variants: string[];
  _rejected?: boolean;
};

type DedupResults = {
  totalTechniques: number;
  mergeGroups: number;
  variantsToMerge: number;
  estimatedAfter: number;
  merges: MergeGroup[];
};

export default function TechniquesPage() {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [results, setResults] = useState<DedupResults | null>(null);

  async function scan() {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch('/api/admin/dedup-techniques');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert('Failed to analyze: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  }

  async function apply() {
    if (!results) return;
    const approved = results.merges.filter((m) => !m._rejected);
    if (approved.length === 0) {
      alert('No merges selected.');
      return;
    }
    if (!confirm(`Apply ${approved.length} merges? (${results.merges.length - approved.length} rejected)`)) return;
    setApplying(true);
    try {
      const res = await fetch('/api/admin/dedup-techniques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merges: approved }),
      });
      const data = await res.json();
      alert(`Done! ${data.chunksUpdated} chunks updated.`);
      setResults(null);
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setApplying(false);
  }

  function toggleReject(i: number) {
    if (!results) return;
    const next = { ...results, merges: [...results.merges] };
    next.merges[i] = { ...next.merges[i], _rejected: !next.merges[i]._rejected };
    const approved = next.merges.filter((m) => !m._rejected);
    next.mergeGroups = approved.length;
    next.variantsToMerge = approved.reduce((sum, m) => sum + m.variants.length, 0);
    setResults(next);
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // TECHNIQUES //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Technique Deduplication
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            Find technique names across the knowledge base that should be merged into one.
          </p>
        </div>
        <button
          onClick={scan}
          disabled={loading || applying}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#C4901A] disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…</>
          ) : (
            <><Shuffle className="h-3.5 w-3.5" /> Scan for Duplicates</>
          )}
        </button>
      </div>

      {!results && !loading && (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-6 text-sm text-gray-600 dark:text-[#F4ECD8]/70">
          Click <strong>Scan for Duplicates</strong> to find technique names that should be merged.
        </div>
      )}

      {results && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total techniques" value={results.totalTechniques} color="text-gray-900 dark:text-[#F4ECD8]" />
            <Stat label="Merge groups" value={results.mergeGroups} color="text-yellow-600 dark:text-yellow-400" />
            <Stat label="Variants to merge" value={results.variantsToMerge} color="text-red-600 dark:text-red-400" />
            <Stat label="After dedup" value={`~${results.estimatedAfter}`} color="text-green-600 dark:text-green-400" />
          </div>

          {results.merges?.length > 0 ? (
            <>
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 max-h-[500px] overflow-y-auto">
                {results.merges.map((merge, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#D4A017]/10 last:border-b-0 ${
                      merge._rejected ? 'opacity-40 bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-bold">{merge.canonical}</span>
                      <span className="text-gray-400 dark:text-[#F4ECD8]/40 mx-2">←</span>
                      <span className="text-gray-700 dark:text-[#F4ECD8]/70">
                        {merge.variants.filter((v) => v !== merge.canonical).join(', ')}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleReject(i)}
                      className={`shrink-0 px-2.5 py-1 text-xs font-mono uppercase tracking-wider border transition-colors ${
                        merge._rejected
                          ? 'text-gray-500 dark:text-[#F4ECD8]/50 hover:text-green-600 border-gray-300 dark:border-[#D4A017]/30'
                          : 'text-red-500 hover:text-red-600 border-red-300 dark:border-red-500/40'
                      }`}
                    >
                      {merge._rejected ? 'Undo' : 'Reject'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={apply}
                  disabled={applying}
                  className="flex-1 py-3 bg-[#D4A017] text-black font-mono uppercase tracking-wider font-bold hover:bg-[#C4901A] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Applying…</>
                  ) : (
                    `Apply ${results.merges.filter((m) => !m._rejected).length} Merges`
                  )}
                </button>
                <button
                  onClick={() => setResults(null)}
                  disabled={applying}
                  className="px-6 py-3 border border-gray-300 dark:border-[#D4A017]/30 text-gray-700 dark:text-[#F4ECD8]/70 font-mono uppercase tracking-wider hover:border-gray-400 hover:text-gray-900 dark:hover:text-[#F4ECD8] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-6 text-sm text-green-600 dark:text-green-400">
              ✓ No duplicates found. Technique names are clean.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-1">{label}</p>
      <p className={`font-mono text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}
