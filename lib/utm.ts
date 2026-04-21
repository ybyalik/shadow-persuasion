/**
 * UTM capture + retrieval helpers.
 *
 * When a user lands on any checkout / lead-capture page with
 * `?utm_source=...` in the URL, we save those params to
 * sessionStorage. When the lead-capture fetch fires, we pull the
 * saved UTMs and attach them to the request so the lead row records
 * where the visitor came from.
 *
 * sessionStorage over localStorage because:
 *   - UTMs should attribute THIS visit, not a visit 3 weeks ago
 *   - cleared automatically when the tab closes
 *
 * First-touch vs last-touch: we use LAST-TOUCH attribution. If the
 * user arrives with UTMs, reloads the page without UTMs, then
 * finishes checkout, the saved UTMs still apply (since sessionStorage
 * persists across page nav within the same tab). If they arrive a
 * second time WITH different UTMs (e.g. clicked step_2 after step_1),
 * the new UTMs overwrite the old. This matches marketing convention
 * and tells us which email actually closed the sale.
 */

const KEY = 'sp_utm';

type Utms = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

/**
 * Read URL params on page mount. If any UTM params are present,
 * overwrite sessionStorage. If none are present, leave existing
 * sessionStorage alone (so a user who later reloads without UTMs
 * doesn't lose the original attribution).
 */
export function captureUtms(): void {
  if (typeof window === 'undefined') return;
  try {
    const search = window.location.search;
    if (!search) return;
    const params = new URLSearchParams(search);
    const utms: Utms = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const) {
      const v = params.get(key);
      if (v) utms[key] = v;
    }
    if (Object.keys(utms).length > 0) {
      sessionStorage.setItem(KEY, JSON.stringify(utms));
    }
  } catch {
    // sessionStorage can throw in private mode / SSR; just swallow
  }
}

/** Return the UTMs captured earlier in this session, or an empty object. */
export function getUtms(): Utms {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Utms;
  } catch {
    return {};
  }
}
