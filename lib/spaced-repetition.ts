/**
 * Spaced repetition for "Spot the Tactic" Train mode (SM-2, the classic
 * flash-card schedule). Pure functions, so the API routes can use them on the
 * server. Progress is stored per person in tactic_progress, keyed by tactic slug.
 *
 * Get one wrong: it comes back tomorrow. Get it right: the gap grows
 * (1 day, 6 days, then longer each time).
 */

export type SRCard = {
  tactic_slug: string;
  ease_factor: number; // starts at 2.5
  interval_days: number;
  repetitions: number;
  next_review_at: string; // ISO timestamp
  last_review_at: string | null;
  times_right: number;
  times_wrong: number;
};

export type SRStatus = 'new' | 'learning' | 'due' | 'known';

export function newCard(slug: string, now = new Date()): SRCard {
  return {
    tactic_slug: slug,
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    next_review_at: now.toISOString(),
    last_review_at: null,
    times_right: 0,
    times_wrong: 0,
  };
}

/** quality 0 to 5 (0 = no idea, 5 = instant). A right answer in Train mode is 5, a wrong one 1. */
export function getNextReview(card: SRCard, quality: number, now = new Date()): SRCard {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  const next = { ...card };

  if (q < 3) {
    next.repetitions = 0;
    next.interval_days = 1;
    next.times_wrong += 1;
  } else {
    if (next.repetitions === 0) next.interval_days = 1;
    else if (next.repetitions === 1) next.interval_days = 6;
    else next.interval_days = Math.round(next.interval_days * next.ease_factor);
    next.repetitions += 1;
    next.times_right += 1;
  }

  next.ease_factor = Math.max(1.3, next.ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  next.last_review_at = now.toISOString();
  // A wrong answer comes back a little sooner than a full day, so it shows up again tomorrow.
  const ms = q < 3 ? 20 * 3600_000 : next.interval_days * 24 * 3600_000;
  next.next_review_at = new Date(now.getTime() + ms).toISOString();
  return next;
}

export function cardStatus(card: SRCard | null | undefined, now = new Date()): SRStatus {
  if (!card || !card.last_review_at) return 'new';
  if (new Date(card.next_review_at).getTime() <= now.getTime()) return 'due';
  if (card.repetitions >= 3) return 'known';
  return 'learning';
}

export const STATUS_LABEL: Record<SRStatus, string> = {
  new: 'Not tried',
  learning: 'Learning',
  due: 'Ready to review',
  known: 'You know this one',
};
