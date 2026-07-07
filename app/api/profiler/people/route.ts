import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'user_profiles_people';

// Map snake_case DB row to camelCase for frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    relationshipType: row.relationship_type,
    traits: row.traits || {},
    interactions: row.interactions || [],
    playbook: row.playbook,
    confidenceScore: row.confidence_score,
    keyTraitTags: row.key_trait_tags,
    riskLevel: row.risk_level,
    nextRecommendedAction: row.next_recommended_action,
    tags: row.tags,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET: List the signed-in user's people profiles
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    // Support fetching a single profile by ID (scoped to the caller)
    const singleId = searchParams.get('id');
    if (singleId) {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', singleId)
        .eq('user_id', userId)
        .single();

      if (error || !data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      return NextResponse.json({ profile: mapProfile(data) });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return apiError('Failed to fetch people profiles.', 500, '[PROFILER_PEOPLE]', error);
    }

    return NextResponse.json({ profiles: (data || []).map(mapProfile) });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[PROFILER_PEOPLE]', error);
  }
}

// POST: Create a new person profile for the signed-in user
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const insertPayload = {
      name: body.name,
      relationship_type: body.relationshipType || 'Other',
      user_id: userId,
      traits: body.traits || {},
      interactions: body.interactions || [],
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      return apiError('Failed to create profile.', 500, '[PROFILER_PEOPLE]', error);
    }

    return NextResponse.json({ profile: mapProfile(data) });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[PROFILER_PEOPLE]', error);
  }
}

// PUT: Update one of the signed-in user's person profiles (by id in body)
export async function PUT(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return apiError('Failed to update profile.', 500, '[PROFILER_PEOPLE]', error);
    }

    return NextResponse.json({ profile: mapProfile(data) });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[PROFILER_PEOPLE]', error);
  }
}

// DELETE: Delete one of the signed-in user's person profiles (by ?id=xxx)
export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete profile.', 500, '[PROFILER_PEOPLE]', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[PROFILER_PEOPLE]', error);
  }
}
