import { NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';
import { apiError } from '@/lib/api-error';

export async function GET() {
  try {
    const { data: categories, error: catError } = await supabase
      .from('taxonomy_categories')
      .select('id, name, emoji, description, sort_order')
      .eq('is_active', true)
      .order('sort_order');

    if (catError) {
      return apiError('Failed to load categories.', 500, '[TAXONOMY]', catError);
    }

    const { data: useCases, error: ucError } = await supabase
      .from('taxonomy_use_cases')
      .select('id, category_id, title, sort_order')
      .eq('is_active', true)
      .order('sort_order');

    if (ucError) {
      return apiError('Failed to load categories.', 500, '[TAXONOMY]', ucError);
    }

    const result = (categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
      useCases: (useCases || [])
        .filter((uc) => uc.category_id === cat.id)
        .map((uc) => ({ id: uc.id, title: uc.title })),
    }));

    return NextResponse.json({ categories: result });
  } catch (err) {
    return apiError('Failed to load categories.', 500, '[TAXONOMY]', err);
  }
}
