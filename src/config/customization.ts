import type { CustomCategory, CustomizationState } from '../types';
import { ru } from '../i18n/ru';

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

type CursorSpec = { id: string; asset: string; hotspotX: number; hotspotY: number; tier: number };

function makeCursor(spec: CursorSpec): CustomItem {
  const pricing = TIER_PRICING[spec.tier as keyof typeof TIER_PRICING] ?? TIER_PRICING[1];
  return {
    id: spec.id,
    name: ru.customization.name[spec.id as keyof typeof ru.customization.name],
    category: 'cursor',
    cost: pricing.cost,
    unlockPrestige: pricing.prestige,
    description: ru.customization.description[spec.id as keyof typeof ru.customization.description],
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
    name: ru.customization.name['cursor-default'],
    category: 'cursor',
    cost: 0,
    unlockPrestige: 0,
    description: ru.customization.description['cursor-default'],
    asset: '',
    hotspotX: 0,
    hotspotY: 0,
  },
  makeCursor({
    id: 'cursor-lime',
    tier: 1,
    asset: '/assets/cursors/1_lime.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-pink',
    tier: 1,
    asset: '/assets/cursors/1_pink.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-purple',
    tier: 1,
    asset: '/assets/cursors/1_purple.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-drawing',
    tier: 2,
    asset: '/assets/cursors/2_drawing.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-face',
    tier: 2,
    asset: '/assets/cursors/2_face.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-hand',
    tier: 2,
    asset: '/assets/cursors/2_hand.png',
    hotspotX: 16,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-stichy',
    tier: 2,
    asset: '/assets/cursors/2_stichy.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-bunny',
    tier: 3,
    asset: '/assets/cursors/3_bunny.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-ducks',
    tier: 3,
    asset: '/assets/cursors/3_ducks.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-fox',
    tier: 3,
    asset: '/assets/cursors/3_fox.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  makeCursor({
    id: 'cursor-secretary',
    tier: 3,
    asset: '/assets/cursors/3_secretary.png',
    hotspotX: 0,
    hotspotY: 0,
  }),
  {
    id: 'buttons-default',
    name: ru.customization.name['buttons-default'],
    category: 'buttons',
    cost: 0,
    unlockPrestige: 0,
    description: ru.customization.description['buttons-default'],
    theme: 'default',
  },
  {
    id: 'buttons-neon',
    name: ru.customization.name['buttons-neon'],
    category: 'buttons',
    cost: 1_000,
    unlockPrestige: 0,
    description: ru.customization.description['buttons-neon'],
    theme: 'neon',
  },
  {
    id: 'buttons-gold',
    name: ru.customization.name['buttons-gold'],
    category: 'buttons',
    cost: 50_000,
    unlockPrestige: 1,
    description: ru.customization.description['buttons-gold'],
    theme: 'gold',
  },
  {
    id: 'trail-default',
    name: ru.customization.name['trail-default'],
    category: 'trail',
    cost: 0,
    unlockPrestige: 0,
    description: ru.customization.description['trail-default'],
    color: '#ffffff',
    shape: 'circle',
    size: 8,
  },
  {
    id: 'trail-ember',
    name: ru.customization.name['trail-ember'],
    category: 'trail',
    cost: 3_000,
    unlockPrestige: 0,
    description: ru.customization.description['trail-ember'],
    color: '#ff7a2f',
    shape: 'circle',
    size: 10,
  },
  {
    id: 'trail-rainbow',
    name: ru.customization.name['trail-rainbow'],
    category: 'trail',
    cost: 80_000,
    unlockPrestige: 25,
    description: ru.customization.description['trail-rainbow'],
    color: '#ff00ff',
    shape: 'star',
    size: 12,
  },
  {
    id: 'sounds-classic',
    name: ru.customization.name['sounds-classic'],
    category: 'sounds',
    cost: 0,
    unlockPrestige: 0,
    description: ru.customization.description['sounds-classic'],
    click: { freq: 440, duration: 0.08, type: 'sine', volume: 0.15 },
    buy: { freq: 660, duration: 0.12, type: 'triangle', volume: 0.15 },
  },
  {
    id: 'sounds-retro',
    name: ru.customization.name['sounds-retro'],
    category: 'sounds',
    cost: 1_500,
    unlockPrestige: 0,
    description: ru.customization.description['sounds-retro'],
    click: { freq: 220, duration: 0.06, type: 'square', volume: 0.1 },
    buy: { freq: 330, duration: 0.1, type: 'square', volume: 0.1 },
  },
  {
    id: 'sounds-sci-fi',
    name: ru.customization.name['sounds-sci-fi'],
    category: 'sounds',
    cost: 40_000,
    unlockPrestige: 1,
    description: ru.customization.description['sounds-sci-fi'],
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
  { id: 'cursor', icon: '🖱️', title: ru.categories.cursor },
  { id: 'buttons', icon: '🔘', title: ru.categories.buttons },
  { id: 'trail', icon: '✨', title: ru.categories.trail },
  { id: 'sounds', icon: '🎵', title: ru.categories.sounds },
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
