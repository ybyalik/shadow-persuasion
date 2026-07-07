'use client';

import { useState, useRef } from 'react';
import { Shield, Upload, Copy, Check, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

type Tactic = {
  name: string;
  whatTheyreDoing: string;
  whyItWorks: string;
  severity: 'low' | 'medium' | 'high';
};
type DefenseResult = {
  overallRisk: number;
  summary: string;
  tactics: Tactic[];
  redFlags: string[];
  suggestedResponse: string;
};

const sevColor: Record<string, string> = {
  low: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  medium: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30',
  high: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30',
};

function riskLabel(n: number) {
  if (n <= 1) return { label: 'Looks clean', color: 'text-green-600 dark:text-green-400' };
  if (n <= 3) return { label: 'Mild pressure', color: 'text-yellow-600 dark:text-yellow-400' };
  if (n <= 6) return { label: 'Manipulative', color: 'text-orange-600 dark:text-orange-400' };
  return { label: 'Heavy manipulation', color: 'text-red-600 dark:text-red-400' };
}

export default function DefensePage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DefenseResult | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async (payload: { text?: string; image?: string }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch('/api/defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setResult(data.result);
    } catch {
      setError('Could not reach the analyzer. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onAnalyzeText = () => {
    if (!text.trim() || loading) return;
    analyze({ text: text.trim() });
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || loading) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => analyze({ image: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const copyResponse = async () => {
    if (!result?.suggestedResponse) return;
    try {
      await navigator.clipboard.writeText(result.suggestedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const risk = result ? riskLabel(result.overallRisk) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-7 w-7 text-[#D4A017]" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">Am I Being Manipulated?</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Paste a message someone sent you (or upload a screenshot). I&apos;ll tell you, in plain English,
        whether they&apos;re using any pressure tactics on you and give you a clean way to respond.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the message you received here…"
        rows={6}
        className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-3 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
      />

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button
          onClick={onAnalyzeText}
          disabled={loading || !text.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A017] px-5 py-2.5 font-semibold text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {loading ? 'Checking…' : 'Check this message'}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-[#333] px-4 py-2.5 text-gray-700 dark:text-gray-300 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          Upload screenshot
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {result && risk && (
        <div className="mt-8 space-y-5">
          <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-5">
            <div className="flex items-center gap-3">
              {result.overallRisk <= 1 ? (
                <ShieldCheck className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-[#D4A017]" />
              )}
              <div>
                <p className={`font-bold ${risk.color}`}>{risk.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manipulation level: {result.overallRisk}/10</p>
              </div>
            </div>
            <p className="mt-3 text-gray-800 dark:text-[#E8E8E0]">{result.summary}</p>
          </div>

          {result.tactics?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                What they&apos;re doing
              </h2>
              {result.tactics.map((t, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-[#F4ECD8]">{t.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${sevColor[t.severity] || sevColor.low}`}>
                      {t.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{t.whatTheyreDoing}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-medium">Why it works:</span> {t.whyItWorks}</p>
                </div>
              ))}
            </div>
          )}

          {result.redFlags?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Red flags</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {result.redFlags.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          {result.suggestedResponse && (
            <div className="rounded-xl border border-[#D4A017]/40 bg-[#D4A017]/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#D4A017]">How to respond</h2>
                <button onClick={copyResponse} className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-[#D4A017]">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-gray-800 dark:text-[#E8E8E0]">{result.suggestedResponse}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
