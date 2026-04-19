'use client';

/* ════════════════════════════════════════════════════════════
   /admin/taxonomy — Categories & Use Cases
   Extracted from the former monolithic admin page.
   ════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import {
  Loader2, RefreshCw, Pencil, Check, X, Plus, Power, ArrowUp, ArrowDown, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type TaxUseCase = {
  id: string;
  category_id: string;
  title: string;
  sort_order: number;
  is_active: boolean;
};
type TaxCategory = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  useCases: TaxUseCase[];
};

export default function TaxonomyPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCat, setEditCat] = useState({ name: '', emoji: '', description: '' });
  const [editingUc, setEditingUc] = useState<string | null>(null);
  const [editUcTitle, setEditUcTitle] = useState('');
  const [newCat, setNewCat] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ name: '', emoji: '', description: '' });
  const [newUcFor, setNewUcFor] = useState<string | null>(null);
  const [newUcTitle, setNewUcTitle] = useState('');

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await user?.getIdToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const load = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/taxonomy/admin', { headers });
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const api = async (method: string, body?: unknown, params?: string) => {
    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const url = '/api/taxonomy/admin' + (params || '');
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const d = await res.json();
        console.error(d.error);
      }
      await load();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const addCategory = () => {
    if (!newCatForm.name.trim()) return;
    api('POST', { type: 'category', ...newCatForm });
    setNewCat(false);
    setNewCatForm({ name: '', emoji: '', description: '' });
  };

  const saveCatEdit = (id: string) => {
    api('PUT', { type: 'category', id, ...editCat });
    setEditingCat(null);
  };

  const toggleCat = (cat: TaxCategory) => {
    api('PUT', { type: 'category', id: cat.id, is_active: !cat.is_active });
  };

  const deleteCat = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}" and all its use cases?`)) return;
    api('DELETE', undefined, `?type=category&id=${id}`);
  };

  const addUseCase = (categoryId: string) => {
    if (!newUcTitle.trim()) return;
    api('POST', { type: 'use_case', category_id: categoryId, title: newUcTitle });
    setNewUcFor(null);
    setNewUcTitle('');
  };

  const saveUcEdit = (id: string) => {
    api('PUT', { type: 'use_case', id, title: editUcTitle });
    setEditingUc(null);
  };

  const deleteUc = (id: string, title: string) => {
    if (!confirm(`Delete use case "${title}"?`)) return;
    api('DELETE', undefined, `?type=use_case&id=${id}`);
  };

  const moveUc = (uc: TaxUseCase, direction: 'up' | 'down', siblings: TaxUseCase[]) => {
    const sorted = [...siblings].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === uc.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    api('PUT', { type: 'use_case', id: uc.id, sort_order: other.sort_order });
    api('PUT', { type: 'use_case', id: other.id, sort_order: uc.sort_order });
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // TAXONOMY //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Categories & Use Cases
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            Hierarchical taxonomy used to classify every technique in the knowledge base.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/30 text-gray-700 dark:text-[#F4ECD8] hover:border-[#D4A017] font-mono text-xs uppercase tracking-wider"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          <button
            onClick={() => setNewCat(true)}
            className="flex items-center gap-1 px-3 py-2 bg-[#D4A017] text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#C4901A]"
          >
            <Plus className="h-3 w-3" /> Add Category
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 text-[#D4A017] animate-spin" />
        </div>
      )}

      {/* New Category Form */}
      {newCat && (
        <div className="mb-4 p-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[60px_1fr_1fr] gap-2">
            <Field label="Emoji">
              <input
                type="text"
                value={newCatForm.emoji}
                onChange={(e) => setNewCatForm((p) => ({ ...p, emoji: e.target.value }))}
                placeholder="💼"
                maxLength={4}
                className="w-full p-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm focus:outline-none focus:border-[#D4A017] text-center"
              />
            </Field>
            <Field label="Name">
              <input
                type="text"
                value={newCatForm.name}
                onChange={(e) => setNewCatForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Category name"
                className="w-full p-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm focus:outline-none focus:border-[#D4A017]"
              />
            </Field>
            <Field label="Description">
              <input
                type="text"
                value={newCatForm.description}
                onChange={(e) => setNewCatForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description"
                className="w-full p-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm focus:outline-none focus:border-[#D4A017]"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setNewCat(false);
                setNewCatForm({ name: '', emoji: '', description: '' });
              }}
              className="px-3 py-1.5 text-xs text-gray-500 dark:text-[#F4ECD8]/60 hover:text-gray-900 dark:hover:text-[#F4ECD8]"
            >
              <X className="h-3 w-3 inline mr-1" />
              Cancel
            </button>
            <button
              onClick={addCategory}
              disabled={saving || !newCatForm.name.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017] text-black text-xs font-mono font-bold hover:bg-[#C4901A] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Create
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 ${
              !cat.is_active ? 'opacity-50' : ''
            }`}
          >
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
              {editingCat === cat.id ? (
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editCat.emoji}
                    onChange={(e) => setEditCat((p) => ({ ...p, emoji: e.target.value }))}
                    className="w-12 p-1.5 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-sm text-gray-900 dark:text-[#F4ECD8] text-center focus:outline-none focus:border-[#D4A017]"
                  />
                  <input
                    type="text"
                    value={editCat.name}
                    onChange={(e) => setEditCat((p) => ({ ...p, name: e.target.value }))}
                    className="flex-1 min-w-[100px] p-1.5 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-sm text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:border-[#D4A017]"
                  />
                  <input
                    type="text"
                    value={editCat.description}
                    onChange={(e) => setEditCat((p) => ({ ...p, description: e.target.value }))}
                    className="flex-1 min-w-[100px] p-1.5 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-sm text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:border-[#D4A017]"
                  />
                  <button onClick={() => saveCatEdit(cat.id)} disabled={saving} className="p-1.5 text-green-600 dark:text-green-400 hover:text-green-700">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditingCat(null)} className="p-1.5 text-gray-500 hover:text-gray-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <div>
                      <span className="text-gray-900 dark:text-[#F4ECD8] font-medium">{cat.name}</span>
                      <span className="text-gray-500 dark:text-[#F4ECD8]/50 text-xs ml-2">{cat.description}</span>
                      <span className="text-gray-400 dark:text-[#F4ECD8]/40 text-xs ml-2">({cat.useCases.length})</span>
                    </div>
                    {expanded === cat.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 ml-auto" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
                    )}
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingCat(cat.id);
                        setEditCat({ name: cat.name, emoji: cat.emoji || '', description: cat.description || '' });
                      }}
                      className="p-1.5 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017]"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toggleCat(cat)}
                      className={`p-1.5 ${cat.is_active ? 'text-green-500 hover:text-red-500' : 'text-red-500 hover:text-green-500'}`}
                      title={cat.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteCat(cat.id, cat.name)} className="p-1.5 text-gray-500 hover:text-red-500" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Expanded use cases */}
            {expanded === cat.id && (
              <div className="px-3 pb-3 space-y-1">
                <div className="border-t border-gray-200 dark:border-[#D4A017]/10 pt-2 mb-2">
                  <button
                    onClick={() => {
                      setNewUcFor(cat.id);
                      setNewUcTitle('');
                    }}
                    className="flex items-center gap-1 text-xs text-[#D4A017] hover:text-[#C4901A]"
                  >
                    <Plus className="h-3 w-3" /> Add Use Case
                  </button>
                </div>

                {newUcFor === cat.id && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20">
                    <input
                      type="text"
                      value={newUcTitle}
                      onChange={(e) => setNewUcTitle(e.target.value)}
                      placeholder="Use case title"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addUseCase(cat.id);
                        if (e.key === 'Escape') setNewUcFor(null);
                      }}
                      className="flex-1 p-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-sm text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:border-[#D4A017]"
                    />
                    <button onClick={() => addUseCase(cat.id)} disabled={saving || !newUcTitle.trim()} className="p-1.5 text-green-500 hover:text-green-600 disabled:opacity-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setNewUcFor(null)} className="p-1.5 text-gray-500 hover:text-gray-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {[...cat.useCases].sort((a, b) => a.sort_order - b.sort_order).map((uc) => (
                  <div
                    key={uc.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 group"
                  >
                    {editingUc === uc.id ? (
                      <>
                        <input
                          type="text"
                          value={editUcTitle}
                          onChange={(e) => setEditUcTitle(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveUcEdit(uc.id);
                            if (e.key === 'Escape') setEditingUc(null);
                          }}
                          className="flex-1 p-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-sm text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:border-[#D4A017]"
                        />
                        <button onClick={() => saveUcEdit(uc.id)} disabled={saving} className="p-1 text-green-500 hover:text-green-600">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingUc(null)} className="p-1 text-gray-500 hover:text-gray-700">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-gray-800 dark:text-[#F4ECD8]/90">{uc.title}</span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => moveUc(uc, 'up', cat.useCases)} className="p-1 text-gray-500 hover:text-[#D4A017]" title="Move up">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button onClick={() => moveUc(uc, 'down', cat.useCases)} className="p-1 text-gray-500 hover:text-[#D4A017]" title="Move down">
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUc(uc.id);
                              setEditUcTitle(uc.title);
                            }}
                            className="p-1 text-gray-500 hover:text-[#D4A017]"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteUc(uc.id, uc.title)} className="p-1 text-gray-500 hover:text-red-500" title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {cat.useCases.length === 0 && (
                  <p className="text-gray-500 dark:text-[#F4ECD8]/50 text-xs text-center py-2">No use cases yet</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && categories.length === 0 && (
        <p className="text-gray-500 dark:text-[#F4ECD8]/50 text-center py-8 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20">
          No categories yet. Run the migration first.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-gray-500 dark:text-[#F4ECD8]/50 uppercase mb-1">{label}</label>
      {children}
    </div>
  );
}
