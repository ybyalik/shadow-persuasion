'use client';

import Link from 'next/link';

export type SceneSummary = {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  description: string;
  other_person?: string | null;
  chapter?: number | null;
  chapter_title?: string | null;
};

export const DIFFICULTY_NAMES: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

/** One practice scene in the Practice Scenes list. */
export function ScenarioCard({ scenario, basePath = '/app/training' }: { scenario: SceneSummary; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/${scenario.id}`}
      className="flex h-full flex-col rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-5 transition-colors hover:border-[color:var(--app-accent)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-accent)]">{scenario.category}</span>
        <span className="app-type rounded-md bg-[color:var(--app-paper-2)] px-2 py-1 text-[11px] text-[color:var(--app-muted)]">
          {DIFFICULTY_NAMES[scenario.difficulty] ?? 'Medium'}
        </span>
      </div>
      <h3 className="app-serif mt-2 text-[21px] font-semibold leading-snug">{scenario.title}</h3>
      <p className="mt-1.5 line-clamp-3 text-[15px] leading-relaxed text-[color:var(--app-muted)]">{scenario.description}</p>
      {scenario.other_person && <p className="mt-auto pt-3 text-[14px] text-[color:var(--app-muted)]">With: {scenario.other_person}</p>}
    </Link>
  );
}
