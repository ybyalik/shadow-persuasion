'use client';

import { useState, useEffect } from 'react';

export interface TaxonomyUseCase {
  id: string;
  title: string;
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  useCases: TaxonomyUseCase[];
}

let cachedCategories: TaxonomyCategory[] | null = null;
let fetchPromise: Promise<TaxonomyCategory[]> | null = null;

async function fetchTaxonomy(): Promise<TaxonomyCategory[]> {
  const res = await fetch('/api/taxonomy');
  if (!res.ok) throw new Error(`taxonomy fetch failed: ${res.status}`);
  const data = await res.json();
  return data.categories || [];
}

export function useTaxonomy() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedCategories) {
      setCategories(cachedCategories);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchTaxonomy();
    }

    fetchPromise
      .then((data) => {
        // Only cache a real result. Leaving the cache empty on an empty
        // response lets the next mount retry instead of showing empty pickers.
        if (data.length > 0) cachedCategories = data;
        setCategories(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch taxonomy:', err);
        setError('Failed to load taxonomy');
        cachedCategories = null;
      })
      .finally(() => {
        setLoading(false);
        fetchPromise = null;
      });
  }, []);

  return { categories, loading, error };
}
