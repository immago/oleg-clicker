import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Game, createInitialState } from '../game/Game';
import {
  loadGame,
  saveNow,
  validateSaveData,
} from '../state/storage';
import { getCustomById } from '../config/customization';
import type { GameState } from '../types';

class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string): string {
    return this.m.has(k) ? (this.m.get(k) as string) : '';
  }
  setItem(k: string, v: string): void {
    this.m.set(k, String(v));
  }
  removeItem(k: string): void {
    this.m.delete(k);
  }
  clear(): void {
    this.m.clear();
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: MemStorage }).localStorage = new MemStorage();
});

afterEach(() => {
  delete (globalThis as unknown as { localStorage?: MemStorage }).localStorage;
});

describe('customization gating', () => {
  it('requires both energy and prestige to buy', () => {
    const game = new Game({ ...createInitialState(), energy: 500_000 });
    expect(game.canBuyCustom('cursor-lime')).toBe(true); // tier 1, cost 500k, prestige 0

    const broke = new Game({ ...createInitialState(), energy: 499_999 });
    expect(broke.canBuyCustom('cursor-lime')).toBe(false);

    const locked = new Game({ ...createInitialState(), energy: 3_000_000 });
    expect(locked.canBuyCustom('cursor-drawing')).toBe(false); // tier 2, needs prestige 1
    locked.state.prestigePoints = 1;
    expect(locked.canBuyCustom('cursor-drawing')).toBe(true);
  });

  it('rejects unknown ids', () => {
    const game = new Game(createInitialState());
    expect(game.canBuyCustom('nope')).toBe(false);
    expect(game.isUnlocked('nope')).toBe(false);
  });
});

describe('purchase and equip', () => {
  it('spends energy and marks ownership permanently on buy', () => {
    const game = new Game({ ...createInitialState(), energy: 1000 });
    expect(game.buyCustom('buttons-neon')).toBe(true);
    expect(game.isUnlocked('buttons-neon')).toBe(true);
    expect(game.state.energy).toBe(0);
    // buying also equips the item immediately
    expect(game.activeSkin('buttons')).toBe('buttons-neon');
    // cannot buy twice without funds
    expect(game.buyCustom('buttons-neon')).toBe(false);
  });

  it('equips owned items and free defaults without purchase', () => {
    const game = new Game(createInitialState());
    // default cursor is pre-owned and pre-equipped from start (requirement #4)
    expect(game.isUnlocked('cursor-default')).toBe(true);
    expect(game.activeSkin('cursor')).toBe('cursor-default');
    // equipping the same again returns false (no change)
    expect(game.equipCustom('cursor', 'cursor-default')).toBe(false);

    const owned = new Game({ ...createInitialState(), energy: 1000 });
    owned.buyCustom('buttons-neon');
    // buying equips the item immediately, so a second equip is a no-op
    expect(owned.equipCustom('buttons', 'buttons-neon')).toBe(false);
    expect(owned.activeSkin('buttons')).toBe('buttons-neon');

    // cannot equip something not owned and not free
    const empty = new Game(createInitialState());
    expect(empty.equipCustom('trail', 'trail-ember')).toBe(false);
  });

  it('exposes the item config via helpers', () => {
    const item = getCustomById('trail-rainbow');
    expect(item).toBeDefined();
    expect((item as { shape: string }).shape).toBe('star');
  });
});

describe('prestige and reset preserve ownership', () => {
  it('keeps unlocked skins and active selection after prestige', () => {
    const game = new Game({ ...createInitialState(), energy: 1_500_000, totalEnergyEarned: 1_500_000 });
    game.buyCustom('buttons-neon'); // buying equips immediately
    game.equipCustom('trail', 'trail-ember'); // needs prestige 5 -> not owned yet
    expect(game.isUnlocked('trail-ember')).toBe(false);

    const gained = game.doPrestige();
    expect(gained).toBe(true);
    expect(game.state.energy).toBe(0);
    expect(game.state.totalEnergyEarned).toBe(0);
    expect(Object.keys(game.state.upgrades)).toHaveLength(0);

    // ownership and active selection survive prestige
    expect(game.isUnlocked('buttons-neon')).toBe(true);
    expect(game.activeSkin('buttons')).toBe('buttons-neon');
  });

  it('keeps customization across a full reset', () => {
    const game = new Game({ ...createInitialState(), energy: 2000 });
    game.buyCustom('buttons-neon');
    game.equipCustom('buttons', 'buttons-neon');
    game.reset();
    expect(game.state.energy).toBe(0);
    expect(game.state.prestigePoints).toBe(0);
    expect(game.isUnlocked('buttons-neon')).toBe(true);
    expect(game.activeSkin('buttons')).toBe('buttons-neon');
  });
});

describe('save / load round-trip', () => {
  it('persists customization and restores it exactly', () => {
    const game = new Game({ ...createInitialState(), energy: 1000 });
    game.buyCustom('buttons-neon');
    game.equipCustom('buttons', 'buttons-neon');

    saveNow(game.state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.state.customization.unlocked['buttons-neon']).toBe(true);
    expect(loaded!.state.customization.active.buttons).toBe('buttons-neon');
  });

  it('falls back to defaults when the save has no customization field', () => {
    const legacy = {
      energy: 10,
      totalEnergyEarned: 10,
      level: 1,
      upgrades: {},
      prestigePoints: 0,
      lastSaved: Date.now(),
    };
    (globalThis.localStorage as unknown as MemStorage).setItem(
      'cosmic-clicker-save-v1',
      JSON.stringify(legacy),
    );
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.state.customization.unlocked).toEqual({
      'cursor-default': true,
      'buttons-default': true,
      'trail-default': true,
      'sounds-classic': true,
    });
    expect(loaded!.state.customization.active.cursor).toBe('cursor-default');
  });

  it('rejects malformed saves', () => {
    expect(validateSaveData(null)).toBe(false);
    expect(validateSaveData({ energy: 'x' })).toBe(false);
    (globalThis.localStorage as unknown as MemStorage).setItem('cosmic-clicker-save-v1', '{not json');
    expect(loadGame()).toBeNull();
  });

  it('sanitizes unlocked to only boolean-true entries', () => {
    const state: GameState = { ...createInitialState(), energy: 5 };
    state.customization.unlocked = { 'buttons-neon': true, junk: 'yes' as unknown as boolean };
    saveNow(state);
    const loaded = loadGame();
    expect(loaded!.state.customization.unlocked['buttons-neon']).toBe(true);
    expect(loaded!.state.customization.unlocked.junk).toBeUndefined();
  });
});
