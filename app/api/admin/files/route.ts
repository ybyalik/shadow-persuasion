/**
 * GET  /api/admin/files  — list every product file (all products)
 * POST /api/admin/files  — upload a new file (multipart/form-data)
 *
 * Upload flow:
 *   1. Admin picks a file in the UI + chooses a product_slug + name
 *   2. Client POSTs multipart/form-data with the file + metadata
 *   3. Server streams the file into the Supabase Storage bucket
 *      `product-files` under a unique key
 *   4. Server inserts a row in `product_files` pointing at the
 *      resulting public URL
 *
 * The bucket must exist in Supabase before uploads work — see
 * supabase/migrations/019_product_files.sql for creation notes.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-api';
import { passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'product-files';
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { data, error } = await supabase
      .from('product_files')
      .select('*')
      .order('product_slug', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ files: data ?? [] });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[admin/files GET]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productSlug = String(formData.get('productSlug') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const sortOrderRaw = formData.get('sortOrder');
    const sortOrder =
      sortOrderRaw != null && sortOrderRaw !== '' ? Number(sortOrderRaw) : null;
    // 'download' (default) for delivered PDFs, 'cover' for product
    // cover images rendered across the site.
    const rawFileType = String(formData.get('fileType') || 'download');
    const fileType = rawFileType === 'cover' ? 'cover' : 'download';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }
    if (!productSlug) {
      return NextResponse.json({ error: 'productSlug is required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Validate file type and size. Covers must be images; delivered
    // downloads must be PDFs. This stops an arbitrary/executable file
    // from being uploaded and later delivered to buyers.
    const type = file.type || '';
    if (fileType === 'cover') {
      if (!type.startsWith('image/')) {
        return NextResponse.json({ error: 'Cover files must be an image.' }, { status: 400 });
      }
    } else if (type !== 'application/pdf') {
      return NextResponse.json({ error: 'Product files must be a PDF.' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'That file is too large (max 50 MB).' }, { status: 400 });
    }

    // Generate a unique storage key so a second upload of the same
    // filename never overwrites the first. Covers live in a
    // subfolder so they're easy to spot in the bucket listing.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const subdir = fileType === 'cover' ? 'covers' : productSlug;
    const filePath = `${subdir}/${productSlug}-${Date.now()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
    if (uploadErr) {
      console.error('[admin/files POST] storage upload failed:', uploadErr.message);
      return NextResponse.json(
        { error: 'File upload failed. Please try again.' },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    // Pick sort_order: explicit wins, otherwise MAX+1 within the
    // same (product, file_type) bucket — so covers don't interleave
    // with downloads.
    let effectiveSort = sortOrder;
    if (effectiveSort == null) {
      const { data: existing } = await supabase
        .from('product_files')
        .select('sort_order')
        .eq('product_slug', productSlug)
        .eq('file_type', fileType)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      effectiveSort = ((existing?.sort_order as number | null) ?? -1) + 1;
    }

    // For covers, deactivate any existing active cover for this
    // product — we only want ONE visible cover at a time. The old
    // row stays in the DB (so admin can "re-activate" it later);
    // site just won't show it.
    if (fileType === 'cover') {
      await supabase
        .from('product_files')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('product_slug', productSlug)
        .eq('file_type', 'cover')
        .eq('is_active', true);
    }

    const { data: row, error: insertErr } = await supabase
      .from('product_files')
      .insert({
        product_slug: productSlug,
        name,
        file_path: filePath,
        storage_url: publicUrl,
        size_bytes: file.size,
        content_type: file.type || null,
        sort_order: effectiveSort,
        is_active: true,
        source: 'supabase',
        file_type: fileType,
      })
      .select('*')
      .single();
    if (insertErr) throw insertErr;

    return NextResponse.json({ file: row });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[admin/files POST]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
