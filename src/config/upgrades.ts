import type { UpgradeDef } from '../types';

export const CURRENCY_NAME = 'Энергия';

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'betterMouse',
    name: 'Усиленный курсор',
    description: '+1 энергия за клик.',
    baseCost: 15,
    growth: 1.15,
    amount: 1,
    kind: 'click',
    perLevelPerSecond: 0,
  },
  {
    id: 'powerClick',
    name: 'Термоядерный тап',
    description: '+5 энергия за клик.',
    baseCost: 250,
    growth: 1.16,
    amount: 5,
    kind: 'click',
    perLevelPerSecond: 0,
  },
  {
    id: 'cursor',
    name: 'Авто-клик',
    description: '0.2 энергии / сек.',
    baseCost: 15,
    growth: 1.15,
    amount: 0,
    kind: 'generator',
    perLevelPerSecond: 0.2,
  },
  {
    id: 'drone',
    name: 'Дрон-сборщик',
    description: '2 энергии / сек.',
    baseCost: 100,
    growth: 1.15,
    amount: 0,
    kind: 'generator',
    perLevelPerSecond: 2,
  },
  {
    id: 'reactor',
    name: 'Плазменный реактор',
    description: '20 энергии / сек.',
    baseCost: 1_100,
    growth: 1.15,
    amount: 0,
    kind: 'generator',
    perLevelPerSecond: 20,
  },
  {
    id: 'singularity',
    name: 'Мини сингулярность',
    description: '200 энергии / сек.',
    baseCost: 12_000,
    growth: 1.15,
    amount: 0,
    kind: 'generator',
    perLevelPerSecond: 200,
  },
];

export const PRESTIGE_CONFIG = {
  /** Minimum total energy required to earn a prestige point. */
  threshold: 1_000_000,
  /** Percentage bonus per prestige point applied to all production. */
  bonusPerPoint: 0.01,
};

export const SAVE_KEY = 'cosmic-clicker-save-v1';

/** Maximum offline time that can be afk-granted (24h). */
export const OFFLINE_CAP_SECONDS = 24 * 60 * 60;

export function getUpgradeById(id: string): UpgradeDef {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) throw new Error(`Unknown upgrade id: ${id}`);
  return def;
}
