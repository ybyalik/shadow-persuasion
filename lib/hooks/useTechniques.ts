'use client';

import { useState, useEffect } from 'react';

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
  const res = await fetch('/api/techniques');
  if (!res.ok) return [];
  const data = await res.json();
  return data.techniques || [];
}

export function useTechniques() {
  const [techniques, setTechniques] = useState<APITechnique[]>(cachedTechniques || []);
  const [loading, setLoading] = useState(!cachedTechniques);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedTechniques) {
      setTechniques(cachedTechniques);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchTechniques();
    }

    fetchPromise
      .then((data) => {
        cachedTechniques = data;
        setTechniques(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch techniques:', err);
        setError('Failed to load techniques');
        cachedTechniques = null;
      })
      .finally(() => {
        setLoading(false);
        fetchPromise = null;
      });
  }, []);

  return { techniques, loading, error };
}
