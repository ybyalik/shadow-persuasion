'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { inputClass } from '@/components/app/ui';

export type Person = { id: string; name: string; relationshipType?: string };

/** Loads the signed-in user's saved people (from My People). */
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
      <label htmlFor="person-picker" className="mb-1.5 block text-[14px] font-medium">
        Who is this about?
      </label>
      <select id="person-picker" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Someone new (I&apos;ll describe them)</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.relationshipType ? ` (${p.relationshipType})` : ''}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-[13px] text-[color:var(--app-muted)]">
        Pick someone from My People and I&apos;ll use what you already know about them.
      </p>
    </div>
  );
}
