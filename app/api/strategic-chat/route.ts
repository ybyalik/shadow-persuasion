import { NextRequest } from 'next/server';
import { POST as coachPost } from '../chat/route';

/**
 * Kept for older links: the same calm coach as Talk It Through (/api/chat).
 * Pass { personId } for the "talk about [name]" chat on a person's page.
 */

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return coachPost(req);
}
