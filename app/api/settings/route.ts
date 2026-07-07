import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-api';
import { passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FALLBACK_ADMIN_EMAILS = ['ybyalik@gmail.com'];

// Only this key may be read without admin auth — the client uses it to decide
// whether to show admin UI. All other settings are admin-only.
const PUBLIC_SETTING_KEYS = new Set(['admin_emails']);

// GET: Fetch a setting by key
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'key query param is required' }, { status: 400 });
  }

  try {
    // Any key other than the public one requires an admin.
    if (!PUBLIC_SETTING_KEYS.has(key)) {
      try {
        await requireAdmin(req);
      } catch (err) {
        const authFail = passthroughAuthError(err);
        if (authFail) return authFail;
        throw err;
      }
    }

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

// PUT: Update a setting (admin only). Admin identity is verified from a real,
// signed Firebase token — the email claim can no longer be forged.
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);

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
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    console.error('[SETTINGS]', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
