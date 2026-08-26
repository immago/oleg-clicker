import { PRESTIGE_CONFIG, UPGRADES } from '../config/upgrades';
import type { GameState, UpgradeDef } from '../types';

/** Permanent multiplier from prestige points applied to clicks and generators. */
export function productionMultiplier(prestigePoints: number): number {
  return 1 + prestigePoints * PRESTIGE_CONFIG.bonusPerPoint;
}

/** Cost to purchase the next level given the current owned `level`. */
export function cost(upgrade: UpgradeDef, level: number): number {
  return upgrade.baseCost * Math.pow(upgrade.growth, level);
}

/** Total energy gained per click at the given upgrade levels. */
export function clickPower(
  levels: Record<string, number>,
  prestigePoints: number,
): number {
  let power = 1; // base click power
  for (const def of UPGRADES) {
    if (def.kind === 'click') {
      power += def.amount * (levels[def.id] ?? 0);
    }
  }
  return power * productionMultiplier(prestigePoints);
}

/** Passive energy per second from all owned generators. */
export function perSecond(
  levels: Record<string, number>,
  prestigePoints: number,
): number {
  let total = 0;
  for (const def of UPGRADES) {
    if (def.kind === 'generator') {
      total += def.perLevelPerSecond * (levels[def.id] ?? 0);
    }
  }
  return total * productionMultiplier(prestigePoints);
}

/**
 * Pure tick: returns updated energy and lifetime totals after `dt` seconds.
 */
export function applyTick(
  state: Pick<GameState, 'energy' | 'totalEnergyEarned' | 'upgrades' | 'prestigePoints'>,
  dt: number,
): { energy: number; totalEnergyEarned: number } {
  const gain = perSecond(state.upgrades, state.prestigePoints) * dt;
  return {
    energy: state.energy + gain,
    totalEnergyEarned: state.totalEnergyEarned + gain,
  };
}

/**
 * New prestige points earned by prestiging now, given lifetime energy and the
 * points already held. Returns 0 if below the entry threshold.
 */
export function prestigeGain(
  totalEnergyEarned: number,
  currentPoints: number,
): number {
  if (totalEnergyEarned < PRESTIGE_CONFIG.threshold) return 0;
  const projected = Math.floor(
    Math.sqrt(totalEnergyEarned / PRESTIGE_CONFIG.threshold),
  );
  return Math.max(0, projected - currentPoints);
}
