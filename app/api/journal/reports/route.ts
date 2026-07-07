import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'field_reports';

// GET: List all field reports for the user, support ?period=week|month|all
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';

    let query = supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (period === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', monthAgo);
    }

    const { data, error } = await query;

    if (error) {
      return apiError('Failed to fetch reports.', 500, '[JOURNAL_REPORTS]', error);
    }

    return NextResponse.json({ reports: data || [] });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[JOURNAL_REPORTS]', error);
  }
}

// POST: Create a new field report
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();

    // user_id is set from the verified token (after the spread) so a caller
    // can never write a report under someone else's account.
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) {
      return apiError('Failed to create report.', 500, '[JOURNAL_REPORTS]', error);
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[JOURNAL_REPORTS]', error);
  }
}

// DELETE: Delete a report (by ?id=xxx)
export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('id query param is required.', 400);
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete report.', 500, '[JOURNAL_REPORTS]', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[JOURNAL_REPORTS]', error);
  }
}
