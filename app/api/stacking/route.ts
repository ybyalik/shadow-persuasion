import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';

/**
 * The old "technique stacking" tool is retired: it planned influence moves on
 * someone, which isn't what the app is for any more. Planning a hard
 * conversation now lives in Plan a Conversation (/app/warroom).
 */
export async function POST(req: NextRequest) {
  try {
    await requireAppUser(req);
    return NextResponse.json(
      { error: 'This tool has moved. Use Plan a Conversation to get ready for a hard talk.', moved: '/app/warroom' },
      { status: 410 }
    );
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[stacking]', err);
  }
}
