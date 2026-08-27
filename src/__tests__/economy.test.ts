import { describe, expect, it } from 'vitest';
import { createDefaultCustomization } from '../config/customization';
import { getUpgradeById } from '../config/upgrades';
import type { GameState } from '../types';
import {
  applyTick,
  clickPower,
  cost,
  perSecond,
  prestigeGain,
  productionMultiplier,
} from '../systems/economy';

function levels(map: Record<string, number>): Record<string, number> {
  return map;
}

describe('cost scaling', () => {
  it('computes baseCost * growth^level', () => {
    const cursor = getUpgradeById('cursor');
    expect(cost(cursor, 0)).toBe(15);
    expect(cost(cursor, 1)).toBeCloseTo(15 * 1.15, 10);
    expect(cost(cursor, 2)).toBeCloseTo(15 * 1.15 ** 2, 10);
  });

  it('grows monotonically', () => {
    const cursor = getUpgradeById('cursor');
    for (let lvl = 0; lvl < 20; lvl++) {
      expect(cost(cursor, lvl + 1)).toBeGreaterThan(cost(cursor, lvl));
    }
  });
});

describe('production multiplier', () => {
  it('is 1 without prestige and scales linearly', () => {
    expect(productionMultiplier(0)).toBe(1);
    expect(productionMultiplier(10)).toBeCloseTo(1.1, 10);
    expect(productionMultiplier(100)).toBeCloseTo(2, 10);
  });
});

describe('clickPower', () => {
  it('adds base plus click upgrade amounts, times multiplier', () => {
    const lvl = levels({ betterMouse: 3 });
    expect(clickPower(lvl, 0)).toBe(4); // 1 + 3*1
    const withPrestige = levels({ betterMouse: 3 });
    expect(clickPower(withPrestige, 10)).toBeCloseTo(4 * 1.1, 10);
  });
});

describe('perSecond', () => {
  it('sums generator output times multiplier', () => {
    const lvl = levels({ cursor: 10 }); // 0.2 * 10 = 2
    expect(perSecond(lvl, 0)).toBeCloseTo(2, 10);
  });

  it('combines multiple generators', () => {
    const lvl = levels({ cursor: 10, drone: 5 }); // 2 + 10 = 12
    expect(perSecond(lvl, 0)).toBeCloseTo(12, 10);
  });
});

describe('applyTick', () => {
  const baseState: GameState = {
    energy: 0,
    totalEnergyEarned: 0,
    level: 1,
    upgrades: levels({ cursor: 5 }), // 0.2 * 5 = 1/sec
    prestigePoints: 0,
    lastSaved: Date.now(),
    customization: createDefaultCustomization(),
  };

  it('adds perSecond * dt to energy and totals', () => {
    const result = applyTick(baseState, 4);
    expect(result.energy).toBeCloseTo(4, 10);
    expect(result.totalEnergyEarned).toBeCloseTo(4, 10);
  });

  it('respects a zero delta time', () => {
    const result = applyTick(baseState, 0);
    expect(result.energy).toBe(0);
  });
});

describe('prestigeGain', () => {
  it('returns 0 below threshold', () => {
    expect(prestigeGain(999_999, 0)).toBe(0);
  });

  it('grants points above threshold via sqrt progression', () => {
    // sqrt(1_000_000 / 1_000_000) = 1 point
    expect(prestigeGain(1_000_000, 0)).toBe(1);
    // sqrt(9_000_000 / 1_000_000) = 3 points
    expect(prestigeGain(9_000_000, 0)).toBe(3);
  });

  it('accounts for already-held points', () => {
    expect(prestigeGain(9_000_000, 1)).toBe(2);
  });
});
