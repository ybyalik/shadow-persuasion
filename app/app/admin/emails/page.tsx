'use client';

/**
 * Emails: every email the current site sends (lib/sp2/email-catalog.ts), grouped, with a preview
 * built by the same code that sends it. The wording lives in the code (and, for the free-chapter
 * series, funnel-v2/emails/free-chapter-sequence-v3.md), so this page is read-only.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

type Entry = { key: string; group: string; name: string; when: string; subject: string };

export default function EmailsPage() {
  const [emails, setEmails] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/admin/emails')
      .then((r) => r.json())
      .then((d) => {
        if (!d.emails) throw new Error(d.error || 'Could not load emails.');
        setEmails(d.emails);
        setSelected(d.emails[0]?.key ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load emails.'));
  }, []);

  useEffect(() => {
    if (!selected) return;
    apiFetch(`/api/admin/emails?key=${encodeURIComponent(selected)}`)
      .then((r) => r.json())
      .then((d) => setPreview(d.html ? d : null));
  }, [selected]);

  const groups = [...new Set(emails.map((e) => e.group))];

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">Emails</h1>
          <p className="text-sm text-gray-500 dark:text-[#F4ECD8]/60 mt-1">Every email the site sends automatically. Click one to see exactly what people receive.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/admin/emails/sends" className="px-3 py-2 text-xs font-mono uppercase tracking-wider border border-gray-300 dark:border-[#D4A017]/30 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017]">
            Send log
          </Link>
          <Link href="/app/admin/emails/unsubscribes" className="px-3 py-2 text-xs font-mono uppercase tracking-wider border border-gray-300 dark:border-[#D4A017]/30 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017]">
            Unsubscribes
          </Link>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g}>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono mb-2">{g}</p>
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 divide-y divide-gray-100 dark:divide-[#D4A017]/10">
                {emails
                  .filter((e) => e.group === g)
                  .map((e) => (
                    <button
                      key={e.key}
                      onClick={() => {
                        setPreview(null);
                        setSelected(e.key);
                      }}
                      className={`w-full text-left px-4 py-3 ${selected === e.key ? 'bg-[#D4A017]/10' : 'hover:bg-gray-50 dark:hover:bg-[#0A0A0A]'}`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#F4ECD8]">{e.name}</p>
                      <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/70 mt-0.5">“{e.subject}”</p>
                      <p className="text-[11px] text-gray-500 dark:text-[#F4ECD8]/50 mt-0.5">{e.when}</p>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-6 self-start">
          {preview ? (
            <div className="border border-gray-200 dark:border-[#D4A017]/20 bg-white">
              <div className="px-4 py-3 border-b border-gray-200 text-sm text-gray-900">
                <span className="text-gray-500">Subject:</span> <b>{preview.subject}</b>
              </div>
              <iframe title="Email preview" srcDoc={preview.html} className="w-full h-[75vh] block" sandbox="" />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading preview…</p>
          )}
          <p className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 mt-2">Links in previews are samples. To change wording, ask for the email by name.</p>
        </div>
      </div>
    </div>
  );
}
