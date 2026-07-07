import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List all chat sessions with last message preview
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let query = supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (type) {
      query = query.eq('session_type', type);
    }

    if (search) {
      // Strip PostgREST filter metacharacters so the value can't break out of
      // the .or() filter (defensive: no search box wires into this yet).
      const safeSearch = search.replace(/[,()%*\\]/g, ' ').trim();
      if (safeSearch) {
        query = query.or(`title.ilike.%${safeSearch}%,goal_title.ilike.%${safeSearch}%`);
      }
    }

    const { data: sessions, error } = await query;

    if (error) {
      return apiError('Failed to fetch sessions.', 500, '[CONVERSATIONS]', error);
    }

    // Fetch last message for all sessions in a single query
    const sessionIds = (sessions || []).map((s) => s.id);
    let lastMessages: Record<string, { content: string; role: string; created_at: string }> = {};

    if (sessionIds.length > 0) {
      const { data: allMessages } = await supabase
        .from('chat_messages')
        .select('session_id, content, role, created_at')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false });

      // Keep only the most recent message per session
      for (const msg of allMessages || []) {
        if (!lastMessages[msg.session_id]) {
          lastMessages[msg.session_id] = msg;
        }
      }
    }

    const sessionsWithPreview = (sessions || []).map((session) => {
      const lastMsg = lastMessages[session.id];
      return {
        ...session,
        lastMessage: lastMsg?.content?.slice(0, 150) || null,
        lastMessageRole: lastMsg?.role || null,
        lastMessageAt: lastMsg?.created_at || null,
      };
    });

    return NextResponse.json({ sessions: sessionsWithPreview });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[CONVERSATIONS]', error);
  }
}

// POST: Create a new chat session
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();
    const { title, goal, goal_title, session_type, scenario_id } = body;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        title: title || 'New Chat',
        goal: goal || null,
        goal_title: goal_title || null,
        session_type: session_type || 'general',
        scenario_id: scenario_id || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return apiError('Failed to create session.', 500, '[CONVERSATIONS]', error);
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[CONVERSATIONS]', error);
  }
}

// DELETE: Delete a chat session by id
export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('Session id is required.', 400);
    }

    // Scope the delete to the caller so nobody can erase another user's session.
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete session.', 500, '[CONVERSATIONS]', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[CONVERSATIONS]', error);
  }
}
