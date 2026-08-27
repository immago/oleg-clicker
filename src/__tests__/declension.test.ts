import { describe, expect, it } from 'vitest';
import { CURRENCY_FORMS, currencyLabel, decline } from '../i18n/declension';

describe('decline', () => {
  const forms = ['энергия', 'энергии', 'энергий'] as const;

  it('uses the nominative form for 1 and 1x endings', () => {
    expect(decline(1, forms)).toBe(forms[0]);
    expect(decline(21, forms)).toBe(forms[0]);
    expect(decline(31, forms)).toBe(forms[0]);
  });

  it('uses the genitive singular form for 2-4 and 2x-4x endings', () => {
    for (const n of [2, 3, 4, 22, 23, 24]) {
      expect(decline(n, forms)).toBe(forms[1]);
    }
  });

  it('uses the genitive plural form for 5-20, teens and round numbers', () => {
    for (const n of [0, 5, 11, 12, 19, 20, 25, 100, 1000]) {
      expect(decline(n, forms)).toBe(forms[2]);
    }
  });

  it('ignores fractional parts', () => {
    expect(decline(21.9, forms)).toBe(forms[0]); // floor -> 21 (ends in 1)
    expect(decline(14.9, forms)).toBe(forms[2]); // floor -> 14 (teens)
  });

  it('matches the shipped currency forms', () => {
    expect(CURRENCY_FORMS).toEqual(['тугрик', 'тугрика', 'тугриков']);
  });
});

describe('currencyLabel', () => {
  it('declines for one energy', () => {
    expect(currencyLabel(1)).toBe('1 тугрик');
  });

  it('declines for a few energies', () => {
    expect(currencyLabel(3)).toBe('3 тугрика');
  });

  it('declines for many energies', () => {
    expect(currencyLabel(15)).toBe('15 тугриков');
  });

  it('combines compact formatting with the correct form', () => {
    expect(currencyLabel(1234)).toBe('1.23K тугрика');
    expect(currencyLabel(500_000)).toBe('500K тугриков');
  });
});
