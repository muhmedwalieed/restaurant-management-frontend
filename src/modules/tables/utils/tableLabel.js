/**
 * Formats a table number/label for display, prefixing it with "طاولة"
 * exactly once — never duplicating it when the raw label already starts
 * with "طاولة" (e.g. seed label "طاولة 1" must not become "طاولة طاولة 1").
 */
export function formatTableLabel(value, fallback = '—') {
  const raw = String(value ?? '').trim() || fallback;
  return raw.startsWith('طاولة') ? raw : `طاولة ${raw}`;
}

export default formatTableLabel;
