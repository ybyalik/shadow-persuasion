/**
 * One page per specific problem: ads go straight here. Copy: app/p/data/[slug].ts. View: app/b/ProblemView.tsx.
 * Hidden from search engines.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROBLEMS, getProblem } from '../../p/problems';
import { ProblemView } from '../ProblemView';

export const dynamicParams = false;

export function generateStaticParams() {
  return PROBLEMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProblem(slug);
  return { title: p?.metaTitle ?? 'Shadow Persuasion', description: p?.metaDescription, robots: { index: false, follow: false } };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProblem(slug);
  if (!p) notFound();
  return <ProblemView p={p} />;
}
