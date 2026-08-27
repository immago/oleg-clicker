import { format } from '../systems/format';

export type DeclensionForms = readonly [string, string, string];

/**
 * Select the correct Russian noun form for a count using the standard
 * 1 / 2-4 / 5+ rule (e.g. "энергия" | "энергии" | "энергий").
 */
export function decline(n: number, forms: DeclensionForms): string {
  const value = Math.floor(Math.abs(n));
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 5 && lastTwo <= 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

export const CURRENCY_FORMS: DeclensionForms = ['тугрик', 'тугрика', 'тугриков'];

/** Format an amount together with the declined currency label. */
export function currencyLabel(amount: number): string {
  const text = format(Math.abs(amount));
  return `${text} ${decline(abbreviatedToForm(text, Math.abs(amount)), CURRENCY_FORMS)}`;
}

function abbreviatedToForm(text: string, fallback: number): number {
  if (text.includes('e')) return Math.floor(fallback);
  const body = text.replace(/[A-Za-z]+$/, '').replace('.', '');
  const parsed = parseInt(body, 10);
  return Number.isNaN(parsed) ? Math.floor(fallback) : parsed;
}
