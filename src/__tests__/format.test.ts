import { describe, expect, it } from 'vitest';
import { format, suffixIndex } from '../systems/format';

describe('format', () => {
  it('formats zero and small numbers', () => {
    expect(format(0)).toBe('0');
    expect(format(1)).toBe('1');
    expect(format(999)).toBe('999');
  });

  it('rounds to two decimals and trims trailing zeros', () => {
    expect(format(1500)).toBe('1.5K');
    expect(format(10_500)).toBe('10.5K');
    expect(format(1_000_000)).toBe('1M');
    expect(format(2_500_000)).toBe('2.5M');
  });

  it('advances through suffixes', () => {
    expect(format(1_000_000_000)).toBe('1B');
    expect(format(1_000_000_000_000)).toBe('1T');
  });

  it('uses scientific notation beyond the suffix table', () => {
    const big = 1e39;
    expect(format(big)).toContain('e39');
  });

  it('handles negative and non-finite values', () => {
    expect(format(-500)).toBe('-500');
    expect(format(Infinity)).toBe('Infinity');
  });

  it('resolves suffix indices', () => {
    expect(suffixIndex('M')).toBe(2);
    expect(suffixIndex('qaa')).toBe(6);
    expect(suffixIndex('nope')).toBeUndefined();
  });
});
