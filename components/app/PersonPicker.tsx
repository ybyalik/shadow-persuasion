'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

export type Person = { id: string; name: string; relationshipType?: string };

/** Loads the signed-in user's saved people (from the People / Profiler feature). */
export function usePeople(): Person[] {
  const [people, setPeople] = useState<Person[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/profiler/people');
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && Array.isArray(data.profiles)) setPeople(data.profiles);
      } catch {
        // non-critical: personalization is optional
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return people;
}

/**
 * Optional "Who is this about?" picker. Renders nothing if the user has no
 * saved people, so it never gets in the way. Selecting a person opts into
 * personalization; leaving it on "Someone new" keeps the generic flow.
 */
export function PersonPicker({
  people,
  value,
  onChange,
}: {
  people: Person[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (people.length === 0) return null;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Who is this about?</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-2.5 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
      >
        <option value="">Someone new (I&apos;ll describe them)</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.relationshipType ? ` (${p.relationshipType})` : ''}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Pick a saved person and I&apos;ll use what you already know about them.
      </p>
    </div>
  );
}
