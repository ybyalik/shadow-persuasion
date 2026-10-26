/**
 * Angle landing pages for the first Meta ad test: /a/parent, /a/work, /a/favor, /a/ex.
 * Copy and excerpts live in app/a/angles.ts; the page itself is app/a/AngleView.tsx (shared with /b/[slug]).
 * Hidden from search engines.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ANGLES, getAngle } from '../angles';
import { AngleView } from '../AngleView';

export const dynamicParams = false;

export function generateStaticParams() {
  return ANGLES.map((a) => ({ angle: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ angle: string }> }): Promise<Metadata> {
  const { angle } = await params;
  const a = getAngle(angle);
  return {
    title: a?.metaTitle ?? 'Shadow Persuasion: The Hidden Rules of Power',
    robots: { index: false, follow: false },
  };
}

export default async function AnglePage({ params }: { params: Promise<{ angle: string }> }) {
  const { angle } = await params;
  const a = getAngle(angle);
  if (!a) notFound();
  return <AngleView a={a} />;
}
