import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FALLBACK_ADMIN_EMAILS = ['ybyalik@gmail.com'];

// GET: Fetch a setting by key
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'key query param is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      // Return fallback for admin_emails
      if (key === 'admin_emails') {
        return NextResponse.json({ key, value: FALLBACK_ADMIN_EMAILS });
      }
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json({ key, value: data.value });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a setting (admin only)
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get the user's email from the auth token
    // We need to check against current admin list
    const { data: currentSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_emails')
      .single();

    const adminEmails: string[] = currentSetting?.value || FALLBACK_ADMIN_EMAILS;

    // We need to verify the user is admin — get email from Firebase token
    const authHeader = req.headers.get('Authorization');
    let userEmail: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userEmail = payload.email;
      } catch {
        // ignore
      }
    }

    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.error('[SETTINGS]', 'Failed to update setting:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('[SETTINGS]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
