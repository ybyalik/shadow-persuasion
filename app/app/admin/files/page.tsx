'use client';

/* ════════════════════════════════════════════════════════════
   /admin/files — product file management.

   Admin can upload new files (go to Supabase Storage bucket
   `product-files`), rename them, reassign to a different
   product, reorder, toggle active, or delete. The delivery
   email + thank-you page read from this list via
   /api/product-files so any change is live without a deploy.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  Trash2,
  Save,
  Plus,
  ExternalLink,
  RefreshCw,
  FileText,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

type ProductFile = {
  id: string;
  product_slug: string;
  name: string;
  file_path: string;
  storage_url: string;
  size_bytes: number | null;
  content_type: string | null;
  sort_order: number;
  is_active: boolean;
  source: 'static' | 'supabase';
  file_type: 'download' | 'cover';
  created_at: string;
  updated_at: string;
};

const PRODUCT_OPTIONS = [
  { slug: 'book',      label: 'Book + Bonuses' },
  { slug: 'briefing',  label: 'Pre-Conversation Briefing' },
  { slug: 'playbooks', label: 'Situation Playbooks' },
  { slug: 'vault',     label: 'Shadow Persuasion Vault' },
];

export default function FilesAdminPage() {
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Upload form state
  const [uploadSlug, setUploadSlug] = useState('book');
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/files');
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to load');
      setFiles(d.files ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) {
      setError('Pick a file to upload.');
      return;
    }
    if (!uploadName.trim()) {
      setError('Enter a display name.');
      return;
    }
    setUploadBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('productSlug', uploadSlug);
      fd.append('name', uploadName.trim());
      const res = await fetch('/api/admin/files', { method: 'POST', body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Upload failed');
      setFlash(`Uploaded: ${d.file.name}`);
      setUploadName('');
      setUploadFile(null);
      (document.getElementById('upload-file-input') as HTMLInputElement | null)?.value &&
        ((document.getElementById('upload-file-input') as HTMLInputElement).value = '');
      setTimeout(() => setFlash(null), 4000);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadBusy(false);
    }
  }

  async function handlePatch(id: string, patch: Partial<ProductFile>) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Update failed');
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...d.file } : f)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(f: ProductFile) {
    if (!confirm(`Delete "${f.name}"? Customers who buy ${f.product_slug} will no longer receive this file.`)) {
      return;
    }
    setBusy(f.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/files/${f.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      setFiles((prev) => prev.filter((x) => x.id !== f.id));
      setFlash(`Deleted: ${f.name}`);
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  // Separate downloads from covers so the UI can render them in
  // distinct sections per product.
  const downloadsByProduct: Record<string, ProductFile[]> = {};
  const coversByProduct: Record<string, ProductFile[]> = {};
  for (const f of files) {
    const bucket = (f.file_type || 'download') === 'cover'
      ? coversByProduct
      : downloadsByProduct;
    if (!bucket[f.product_slug]) bucket[f.product_slug] = [];
    bucket[f.product_slug].push(f);
  }
  // The active cover per product = first active cover in the bucket
  // (the upload endpoint guarantees at most one is active).
  function activeCoverFor(slug: string): ProductFile | null {
    return (coversByProduct[slug] || []).find((f) => f.is_active) || null;
  }

  const fmtSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <Link
        href="/app/admin"
        className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono"
      >
        <ArrowLeft className="h-4 w-4" /> Back to admin
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // PRODUCT FILES //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Product Files
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            The files delivered to buyers. Upload replaces nothing by default —
            delete or deactivate the old one if you want customers to stop
            getting it.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-[#D4A017] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-3 mb-5 font-mono text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="flex-1 break-words">{error}</span>
        </div>
      )}
      {flash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600 text-green-700 dark:text-green-300 p-3 mb-5 font-mono text-sm">
          ✓ {flash}
        </div>
      )}

      {/* ─────────── Upload form ─────────── */}
      <form
        onSubmit={handleUpload}
        className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5 mb-6 space-y-4"
      >
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
          Upload a new file
        </p>
        <div className="grid md:grid-cols-[1fr_1fr] gap-4">
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60">
              Product
            </span>
            <select
              value={uploadSlug}
              onChange={(e) => setUploadSlug(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
            >
              {PRODUCT_OPTIONS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label} ({p.slug})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60">
              Display name
            </span>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="e.g. Bonus #5 — Cold Email Openers"
              className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60">
            File
          </span>
          <input
            id="upload-file-input"
            type="file"
            accept=".pdf,.docx,.epub,.mp3,.mp4,.zip"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm text-gray-700 dark:text-[#F4ECD8]/70 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#D4A017] file:text-[#0A0A0A] file:font-mono file:text-xs file:uppercase file:font-bold hover:file:bg-[#B8860B]"
          />
          {uploadFile && (
            <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50 mt-1">
              {uploadFile.name} · {fmtSize(uploadFile.size)}
            </p>
          )}
        </label>
        <button
          type="submit"
          disabled={uploadBusy || !uploadFile || !uploadName.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] disabled:opacity-50 font-mono text-xs uppercase tracking-wider font-bold"
        >
          <Upload className="h-3 w-3" />
          {uploadBusy ? 'Uploading…' : 'Upload'}
        </button>
        <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50">
          Files go to Supabase Storage bucket <code className="text-[#D4A017]">product-files</code>.
          Make sure that bucket exists and is public (create it at Storage → New bucket in
          the Supabase dashboard).
        </p>
      </form>

      {/* ─────────── File list grouped by product ─────────── */}
      {loading && files.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#F4ECD8]/50 font-mono">Loading…</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
          No product files. Upload one above to start.
        </p>
      ) : (
        <div className="space-y-5">
          {PRODUCT_OPTIONS.map((p) => {
            const downloadItems = downloadsByProduct[p.slug] || [];
            const cover = activeCoverFor(p.slug);
            return (
              <div
                key={p.slug}
                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5"
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4A017] mb-3">
                  {p.label}
                </p>

                {/* ─ Cover image slot ─ */}
                <div className="mb-5 pb-5 border-b border-gray-100 dark:border-[#D4A017]/10">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-2">
                    Cover image
                  </p>
                  <CoverSlot
                    productSlug={p.slug}
                    current={cover}
                    onChanged={load}
                    onDelete={() => cover && handleDelete(cover)}
                  />
                </div>

                {/* ─ Downloads list ─ */}
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-2">
                  Downloads ({downloadItems.length})
                </p>
                {downloadItems.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                    No files. Customers who buy this product won&apos;t receive any downloads.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {downloadItems.map((f) => (
                      <FileRow
                        key={f.id}
                        file={f}
                        busy={busy === f.id}
                        onPatch={(patch) => handlePatch(f.id, patch)}
                        onDelete={() => handleDelete(f)}
                        fmtSize={fmtSize}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Catch-all: files on an unrecognized product_slug */}
          {Object.keys(downloadsByProduct)
            .filter((slug) => !PRODUCT_OPTIONS.some((p) => p.slug === slug))
            .map((slug) => (
              <div
                key={slug}
                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5"
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4A017] mb-3">
                  Other: {slug} ({downloadsByProduct[slug].length} files)
                </p>
                <div className="space-y-2">
                  {downloadsByProduct[slug].map((f) => (
                    <FileRow
                      key={f.id}
                      file={f}
                      busy={busy === f.id}
                      onPatch={(patch) => handlePatch(f.id, patch)}
                      onDelete={() => handleDelete(f)}
                      fmtSize={fmtSize}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── One editable row ─────────── */

function FileRow({
  file,
  busy,
  onPatch,
  onDelete,
  fmtSize,
}: {
  file: ProductFile;
  busy: boolean;
  onPatch: (patch: Partial<ProductFile>) => void;
  onDelete: () => void;
  fmtSize: (b: number | null) => string;
}) {
  const [name, setName] = useState(file.name);
  const [productSlug, setProductSlug] = useState(file.product_slug);
  const [sortOrder, setSortOrder] = useState(String(file.sort_order));

  const dirty =
    name !== file.name ||
    productSlug !== file.product_slug ||
    sortOrder !== String(file.sort_order);

  return (
    <div
      className={`border border-gray-200 dark:border-[#D4A017]/10 bg-gray-50 dark:bg-[#0A0A0A] p-3 ${
        file.is_active ? '' : 'opacity-60'
      }`}
    >
      <div className="flex items-start gap-3 flex-wrap">
        <FileText className="h-5 w-5 text-[#D4A017] mt-1 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="grid md:grid-cols-[1fr_180px_90px] gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
            />
            <select
              value={productSlug}
              onChange={(e) => setProductSlug(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-xs font-mono focus:outline-none focus:border-[#D4A017]"
            >
              {PRODUCT_OPTIONS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.slug}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              title="Sort order within product"
              className="px-2 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-xs font-mono focus:outline-none focus:border-[#D4A017]"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50">
            <span
              className={`px-1.5 py-0.5 uppercase tracking-wider ${
                file.source === 'static'
                  ? 'bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#F4ECD8]/70'
                  : 'bg-[#D4A017]/10 text-[#D4A017]'
              }`}
            >
              {file.source}
            </span>
            {!file.is_active && (
              <span className="px-1.5 py-0.5 uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                Inactive
              </span>
            )}
            <span>{fmtSize(file.size_bytes)}</span>
            <a
              href={file.storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4A017] hover:underline inline-flex items-center gap-1"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {dirty && (
            <button
              onClick={() =>
                onPatch({
                  name,
                  product_slug: productSlug,
                  sort_order: Number(sortOrder) || 0,
                })
              }
              disabled={busy}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] disabled:opacity-50 font-mono text-[10px] uppercase tracking-wider font-bold"
            >
              <Save className="h-3 w-3" />
              Save
            </button>
          )}
          <button
            onClick={() => onPatch({ is_active: !file.is_active })}
            disabled={busy}
            className="px-2 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-[10px] uppercase tracking-wider"
          >
            {file.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#111] border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 font-mono text-[10px] uppercase tracking-wider"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Cover slot: thumbnail + upload/replace ─────────── */

function CoverSlot({
  productSlug,
  current,
  onChanged,
  onDelete,
}: {
  productSlug: string;
  current: ProductFile | null;
  onChanged: () => void;
  onDelete: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('Pick an image file (PNG or JPG).');
      e.target.value = '';
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('productSlug', productSlug);
      fd.append('name', `${productSlug} cover`);
      fd.append('fileType', 'cover');
      const res = await fetch('/api/admin/files', { method: 'POST', body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Upload failed');
      onChanged();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex items-start gap-4 flex-wrap">
      {/* Thumbnail */}
      <div className="w-24 h-32 border border-gray-200 dark:border-[#D4A017]/20 bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center shrink-0 overflow-hidden">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.storage_url}
            alt={`${productSlug} cover`}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 dark:text-[#F4ECD8]/30 text-center px-2">
            No cover
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60">
          {current
            ? 'Replace with a new image. The new upload deactivates this one automatically.'
            : 'Upload a PNG or JPG to show on landing pages, checkout, and the order bump.'}
        </p>
        {err && (
          <p className="text-xs text-red-700 dark:text-red-400 font-mono">{err}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] cursor-pointer font-mono text-[10px] uppercase tracking-wider font-bold">
            <Upload className="h-3 w-3" />
            {busy ? 'Uploading…' : current ? 'Replace' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={handlePick}
              className="hidden"
            />
          </label>
          {current && (
            <button
              onClick={onDelete}
              disabled={busy}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#111] border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-mono text-[10px] uppercase tracking-wider"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          )}
          {current && (
            <a
              href={current.storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017] font-mono text-[10px] uppercase tracking-wider"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
