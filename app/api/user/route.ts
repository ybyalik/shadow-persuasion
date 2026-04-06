import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch user profile by Firebase UID (from auth header)
export async function GET(req: NextRequest) {
  try {
    const firebaseUid = await requireAuth(req);

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine for a new user
      console.error('[USER]', 'Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: data || null });
  } catch (err) {
    if (err instanceof Response) {
      return new NextResponse(err.body, { status: err.status, headers: err.headers });
    }
    console.error('[USER]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update user profile (upsert on firebase_uid)
export async function POST(req: NextRequest) {
  try {
    const firebaseUid = await requireAuth(req);
    const body = await req.json();

    const { email, display_name, photo_url, goals, skill_level } = body;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          firebase_uid: firebaseUid,
          email: email ?? undefined,
          display_name: display_name ?? undefined,
          photo_url: photo_url ?? undefined,
          goals: goals ?? undefined,
          skill_level: skill_level ?? undefined,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'firebase_uid' }
      )
      .select()
      .single();

    if (error) {
      console.error('[USER]', 'Error upserting user profile:', error);
      return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    if (err instanceof Response) {
      return new NextResponse(err.body, { status: err.status, headers: err.headers });
    }
    console.error('[USER]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
