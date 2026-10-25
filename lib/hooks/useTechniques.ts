'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

/**
 * The book's 50 tactics (Spot the Tactic), in a short shape:
 * id = tactic slug, category = the Part Three chapter title.
 */
export interface APITechnique {
  id: string;
  name: string;
  category: string;
  difficulty: number;
  chunkCount: number;
}

let cachedTechniques: APITechnique[] | null = null;
let fetchPromise: Promise<APITechnique[]> | null = null;

async function fetchTechniques(): Promise<APITechnique[]> {
  const res = await apiFetch('/api/techniques');
  if (!res.ok) return [];
  const data = await res.json();
  return data.techniques || [];
}

export function useTechniques() {
  const [techniques, setTechniques] = useState<APITechnique[]>(cachedTechniques || []);
  const [loading, setLoading] = useState(!cachedTechniques);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedTechniques) return;
    if (!fetchPromise) fetchPromise = fetchTechniques();
    fetchPromise
      .then((data) => {
        if (data.length) cachedTechniques = data;
        setTechniques(data);
        setError(null);
      })
      .catch(() => setError("We couldn't load the tactics."))
      .finally(() => {
        setLoading(false);
        fetchPromise = null;
      });
  }, []);

  return { techniques, loading, error };
}
