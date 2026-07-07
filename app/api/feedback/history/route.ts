import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'user_feedback';

// GET: List all feedback for the user
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return apiError('Failed to fetch feedback.', 500, '[FEEDBACK_HISTORY]', error);
    }

    return NextResponse.json({ feedback: data || [] });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[FEEDBACK_HISTORY]', error);
  }
}

// POST: Save feedback record
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();

    // Whitelist the columns a client may set; user_id always comes from the
    // verified token so nobody can write into another user's history.
    const record = {
      type: body.type,
      reference_id: body.reference_id ?? body.referenceId ?? null,
      original_advice: body.original_advice ?? body.originalAdvice ?? null,
      outcome: body.outcome ?? null,
      notes: body.notes ?? null,
      ai_analysis: body.ai_analysis ?? body.aiAnalysis ?? {},
      user_id: userId,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(record)
      .select()
      .single();

    if (error) {
      return apiError('Failed to save feedback.', 500, '[FEEDBACK_HISTORY]', error);
    }

    return NextResponse.json({ feedback: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[FEEDBACK_HISTORY]', error);
  }
}
