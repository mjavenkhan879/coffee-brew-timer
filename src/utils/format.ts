const ML_PER_OZ = 29.5735;

export function mmss(ms: number): string {
  const safe = ms > 0 ? ms : 0;
  const total = Math.ceil(safe / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m + ':' + (s < 10 ? '0' + s : String(s));
}

export function grams(value: number): string {
  return String(Math.round(value));
}

export function waterLabel(ml: number, units: 'grams' | 'ounces'): string {
  if (units === 'ounces') {
    return (ml / ML_PER_OZ).toFixed(1) + ' oz';
  }
  return Math.round(ml) + ' ml';
}

export function ratioLabel(ratio: number): string {
  return '1:' + (Number.isInteger(ratio) ? String(ratio) : ratio.toFixed(1));
}

export function doseLabel(dose: number, units: 'grams' | 'ounces'): string {
  if (units === 'ounces') {
    return (dose / 28.3495).toFixed(1) + ' oz';
  }
  return dose + ' g';
}

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

export function dateLabel(ts: number): string {
  const d = new Date(ts);
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
}

/**
 * Only the filled glyph is ever produced. The empty counterpart is drawn as the same
 * ★ in a muted colour by the caller; the hollow-star glyph is not on the approved list (rule #15).
 */
export function stars(count: number): string {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    out += '★';
  }
  return out;
}
