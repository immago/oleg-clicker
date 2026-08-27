import type { CustomCategory, CustomizationState } from '../types';

export interface SoundPreset {
  freq: number;
  duration: number;
  type: OscillatorType;
  volume: number;
}

export interface TrailPreset {
  color: string;
  shape: 'circle' | 'square' | 'star';
  size: number;
}

export interface CursorItem {
  asset: string;
  hotspotX: number;
  hotspotY: number;
  tier?: number;
}

const TIER_PRICING = {
  1: { cost: 500_000, prestige: 0 },
  2: { cost: 3_000_000, prestige: 1 },
  3: { cost: 10_000_000, prestige: 3 },
} as const;

type CursorSpec = { id: string; name: string; asset: string; hotspotX: number; hotspotY: number; tier: number };

function makeCursor(spec: CursorSpec): CustomItem {
  const pricing = TIER_PRICING[spec.tier as keyof typeof TIER_PRICING] ?? TIER_PRICING[1];
  return {
    id: spec.id,
    name: spec.name,
    category: 'cursor',
    cost: pricing.cost,
    unlockPrestige: pricing.prestige,
    description: `Курсор «${spec.name}»`,
    asset: spec.asset,
    hotspotX: spec.hotspotX,
    hotspotY: spec.hotspotY,
    tier: spec.tier,
  };
}

export type CustomItem =
  | ({ id: string; name: string; category: 'cursor'; cost: number; unlockPrestige: number; description?: string } & CursorItem)
  | ({ id: string; name: string; category: 'buttons'; cost: number; unlockPrestige: number; description?: string } & { theme: string })
  | ({ id: string; name: string; category: 'trail'; cost: number; unlockPrestige: number; description?: string } & TrailPreset)
  | ({ id: string; name: string; category: 'sounds'; cost: number; unlockPrestige: number; description?: string } & { click: SoundPreset; buy: SoundPreset });

export const CUSTOMIZATIONS: CustomItem[] = [
  {
    id: 'cursor-default',
    name: 'Курсор по умолчанию',
    category: 'cursor',
    cost: 0,
    unlockPrestige: 0,
    description: 'Стандартный курсор системы.',
    asset: '',
    hotspotX: 0,
    hotspotY: 0,
  },
  makeCursor({
    id: 'cursor-lime',
    name: 'Лайм',
    tier: 1,
    asset: '/assets/cursors/1_lime.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-pink',
    name: 'Роза',
    tier: 1,
    asset: '/assets/cursors/1_pink.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-purple',
    name: 'Индиго',
    tier: 1,
    asset: '/assets/cursors/1_purple.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-drawing',
    name: 'Карандаш',
    tier: 2,
    asset: '/assets/cursors/2_drawing.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-face',
    name: 'Эможи',
    tier: 2,
    asset: '/assets/cursors/2_face.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-hand',
    name: 'Указка',
    tier: 2,
    asset: '/assets/cursors/2_hand.png',
    hotspotX: 16,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-stichy',
    name: 'Стежок',
    tier: 2,
    asset: '/assets/cursors/2_stichy.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-bunny',
    name: 'Кролик',
    tier: 3,
    asset: '/assets/cursors/3_bunny.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-ducks',
    name: 'Утки',
    tier: 3,
    asset: '/assets/cursors/3_ducks.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-fox',
    name: 'Лиса',
    tier: 3,
    asset: '/assets/cursors/3_fox.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-secretary',
    name: 'Секретарь',
    tier: 3,
    asset: '/assets/cursors/3_secretary.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  {
    id: 'buttons-default',
    name: 'Кнопки по умолчанию',
    category: 'buttons',
    cost: 0,
    unlockPrestige: 0,
    description: 'Базовый стиль кнопок.',
    theme: 'default',
  },
  {
    id: 'buttons-neon',
    name: 'Неоновые кнопки',
    category: 'buttons',
    cost: 1_000,
    unlockPrestige: 0,
    description: 'Кнопки с неоновой подсветкой.',
    theme: 'neon',
  },
  {
    id: 'buttons-gold',
    name: 'Золотые кнопки',
    category: 'buttons',
    cost: 50_000,
    unlockPrestige: 15,
    description: 'Роскошные золотые кнопки.',
    theme: 'gold',
  },
  {
    id: 'trail-default',
    name: 'Шлейф по умолчанию',
    category: 'trail',
    cost: 0,
    unlockPrestige: 0,
    description: 'Базовые белые частицы.',
    color: '#ffffff',
    shape: 'circle',
    size: 8,
  },
  {
    id: 'trail-ember',
    name: 'Угли',
    category: 'trail',
    cost: 3_000,
    unlockPrestige: 0,
    description: 'Искорки горящих угля.',
    color: '#ff7a2f',
    shape: 'circle',
    size: 10,
  },
  {
    id: 'trail-rainbow',
    name: 'Радуга',
    category: 'trail',
    cost: 80_000,
    unlockPrestige: 25,
    description: 'Радужные частицы за кликом.',
    color: '#ff00ff',
    shape: 'star',
    size: 12,
  },
  {
    id: 'sounds-classic',
    name: 'Классика',
    category: 'sounds',
    cost: 0,
    unlockPrestige: 0,
    description: 'Обычные тона игры.',
    click: { freq: 440, duration: 0.08, type: 'sine', volume: 0.15 },
    buy: { freq: 660, duration: 0.12, type: 'triangle', volume: 0.15 },
  },
  {
    id: 'sounds-retro',
    name: 'Ретро',
    category: 'sounds',
    cost: 1_500,
    unlockPrestige: 0,
    description: '8-битные квадратные тона.',
    click: { freq: 220, duration: 0.06, type: 'square', volume: 0.1 },
    buy: { freq: 330, duration: 0.1, type: 'square', volume: 0.1 },
  },
  {
    id: 'sounds-sci-fi',
    name: 'Научная фантастика',
    category: 'sounds',
    cost: 40_000,
    unlockPrestige: 12,
    description: 'Высокочастотные тоны будущего.',
    click: { freq: 880, duration: 0.1, type: 'sawtooth', volume: 0.1 },
    buy: { freq: 1_200, duration: 0.15, type: 'sine', volume: 0.12 },
  },
];

export const DEFAULT_CATEGORIES: CustomCategory[] = ['cursor', 'buttons', 'trail', 'sounds'];

export interface CategoryMeta {
  id: CustomCategory;
  icon: string;
  title: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'cursor', icon: '🖱️', title: 'Курсор' },
  { id: 'buttons', icon: '🔘', title: 'Кнопки' },
  { id: 'trail', icon: '✨', title: 'Шлейф' },
  { id: 'sounds', icon: '🎵', title: 'Звуки' },
];

export function createDefaultCustomization(): CustomizationState {
  const unlocked: Record<string, boolean> = {};
  const active = DEFAULT_CATEGORIES.reduce<Record<CustomCategory, string>>(
    (acc, cat) => {
      const items = itemsByCategory(cat);
      if (items.length > 0) {
        const def = items[0];
        unlocked[def.id] = true;
        acc[cat] = def.id;
      }
      return acc;
    },
    {} as Record<CustomCategory, string>,
  );
  return { unlocked, active };
}

export function getCustomById(id: string): CustomItem | undefined {
  return CUSTOMIZATIONS.find((item) => item.id === id);
}

export function itemsByCategory(category: CustomCategory): CustomItem[] {
  return CUSTOMIZATIONS.filter((item) => item.category === category);
}
