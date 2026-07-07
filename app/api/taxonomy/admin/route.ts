import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';
import { requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

// GET: all categories + use cases (including inactive)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { data: categories, error: catError } = await supabase
      .from('taxonomy_categories')
      .select('*')
      .order('sort_order');
    if (catError) return apiError('Failed to load taxonomy.', 500, '[taxonomy/admin GET]', catError);

    const { data: useCases, error: ucError } = await supabase
      .from('taxonomy_use_cases')
      .select('*')
      .order('sort_order');
    if (ucError) return apiError('Failed to load taxonomy.', 500, '[taxonomy/admin GET]', ucError);

    const result = (categories || []).map((cat) => ({
      ...cat,
      useCases: (useCases || []).filter((uc) => uc.category_id === cat.id),
    }));

    return NextResponse.json({ categories: result });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[taxonomy/admin GET]', err);
  }
}

// POST: create category or use case
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();

    if (body.type === 'category') {
      if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'A category name is required.' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('taxonomy_categories')
        .insert({
          id: body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
          name: body.name,
          emoji: body.emoji || null,
          description: body.description || null,
          sort_order: body.sort_order || 0,
        })
        .select()
        .single();
      if (error) return apiError('Could not create the category.', 400, '[taxonomy/admin POST]', error);
      return NextResponse.json(data);
    }

    if (body.type === 'use_case') {
      if (!body.title || !body.category_id) {
        return NextResponse.json({ error: 'A title and category are required.' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('taxonomy_use_cases')
        .insert({
          category_id: body.category_id,
          title: body.title,
          sort_order: body.sort_order || 0,
        })
        .select()
        .single();
      if (error) return apiError('Could not create the use case.', 400, '[taxonomy/admin POST]', error);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[taxonomy/admin POST]', err);
  }
}

// PUT: update category or use case
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();

    if (body.type === 'category') {
      const updates: Record<string, any> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.emoji !== undefined) updates.emoji = body.emoji;
      if (body.description !== undefined) updates.description = body.description;
      if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
      if (body.is_active !== undefined) updates.is_active = body.is_active;

      const { data, error } = await supabase
        .from('taxonomy_categories')
        .update(updates)
        .eq('id', body.id)
        .select()
        .single();
      if (error) return apiError('Could not update the category.', 400, '[taxonomy/admin PUT]', error);
      return NextResponse.json(data);
    }

    if (body.type === 'use_case') {
      const updates: Record<string, any> = {};
      if (body.title !== undefined) updates.title = body.title;
      if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
      if (body.is_active !== undefined) updates.is_active = body.is_active;
      if (body.category_id !== undefined) updates.category_id = body.category_id;

      const { data, error } = await supabase
        .from('taxonomy_use_cases')
        .update(updates)
        .eq('id', body.id)
        .select()
        .single();
      if (error) return apiError('Could not update the use case.', 400, '[taxonomy/admin PUT]', error);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[taxonomy/admin PUT]', err);
  }
}

// DELETE: remove category or use case
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    if (type === 'category') {
      const { error } = await supabase.from('taxonomy_categories').delete().eq('id', id);
      if (error) return apiError('Could not delete the category.', 400, '[taxonomy/admin DELETE]', error);
      return NextResponse.json({ ok: true });
    }

    if (type === 'use_case') {
      const { error } = await supabase.from('taxonomy_use_cases').delete().eq('id', id);
      if (error) return apiError('Could not delete the use case.', 400, '[taxonomy/admin DELETE]', error);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[taxonomy/admin DELETE]', err);
  }
}
