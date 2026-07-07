import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Confirm the session exists and belongs to the caller. Returns true if owned.
async function callerOwnsSession(sessionId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

// GET: Get all messages for a session (only if the caller owns the session)
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return apiError('session_id is required.', 400);
    }

    if (!(await callerOwnsSession(sessionId, userId))) {
      return apiError('Conversation not found.', 404, '[MESSAGES]');
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      return apiError('Failed to fetch messages.', 500, '[MESSAGES]', error);
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[MESSAGES]', error);
  }
}

// POST: Save a message to a session (only if the caller owns the session)
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { session_id, role, content, metadata } = await req.json();

    if (!session_id || !role || !content) {
      return apiError('session_id, role, and content are required.', 400);
    }

    if (!(await callerOwnsSession(session_id, userId))) {
      return apiError('Conversation not found.', 404, '[MESSAGES]');
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id,
        role,
        content,
        metadata: metadata || {},
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return apiError('Failed to save message.', 500, '[MESSAGES]', error);
    }

    // Update session's updated_at timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', session_id)
      .eq('user_id', userId);

    return NextResponse.json({ message: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[MESSAGES]', error);
  }
}
