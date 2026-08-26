const SUFFIXES = [
  '',
  'K',
  'M',
  'B',
  'T',
  'tril',
  'qaa',
  'quint',
  'sex',
  'nve',
  'occ',
  'non',
  'dec',
];

const SUFFIX_INDEX = new Map<string, number>(
  SUFFIXES.map((s, i) => [s, i]),
);

/**
 * Format a non-negative number with compact suffixes (K/M/B/...).
 * Rounds to 2 decimal places, trimming trailing zeros.
 */
export function format(n: number): string {
  if (!Number.isFinite(n)) return 'Infinity';
  if (n === 0) return '0';
  if (n < 1000) {
    return roundAndTrim(n);
  }

  const exponent = Math.floor(Math.log10(n) / 3);
  if (exponent >= SUFFIXES.length) {
    return toScientific(n);
  }

  const suffix = SUFFIXES[exponent];
  const scaled = n / Math.pow(1000, exponent);
  return `${roundAndTrim(scaled)}${suffix}`;
}

function roundAndTrim(n: number): string {
  const rounded = Number(n.toFixed(2));
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }
  return String(rounded);
}

function toScientific(n: number): string {
  const exponent = Math.floor(Math.log10(n));
  const mantissa = n / Math.pow(10, exponent);
  return `${mantissa.toFixed(2)}e${exponent}`;
}

export function suffixIndex(suffix: string): number | undefined {
  return SUFFIX_INDEX.get(suffix);
}
