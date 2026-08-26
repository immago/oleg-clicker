import { PRESTIGE_CONFIG } from '../config/upgrades';
import type { GameState } from '../types';
import { applyTick, clickPower, prestigeGain } from '../systems/economy';
import { UpgradeManager } from './Upgrade';

export function createInitialState(): GameState {
  return {
    energy: 0,
    totalEnergyEarned: 0,
    level: 1,
    upgrades: {},
    prestigePoints: 0,
    lastSaved: Date.now(),
  };
}

export class Game {
  readonly state: GameState;
  readonly upgrades: UpgradeManager;

  constructor(state?: GameState) {
    this.state = state ?? createInitialState();
    this.upgrades = new UpgradeManager(this.state.upgrades);
  }

  /** Energy gained by a single click. */
  click(): number {
    const gain = clickPower(this.state.upgrades, this.state.prestigePoints);
    this.state.energy += gain;
    this.state.totalEnergyEarned += gain;
    return gain;
  }

  buyUpgrade(id: string): boolean {
    return this.upgrades.buy(this.state, id);
  }

  /** Run one simulation tick of `dt` seconds. */
  tick(dt: number): void {
    if (dt <= 0) return;
    const next = applyTick(this.state, dt);
    this.state.energy = next.energy;
    this.state.totalEnergyEarned = next.totalEnergyEarned;
  }

  /** Number of prestige points available by prestiging now. */
  availablePrestige(): number {
    return prestigeGain(this.state.totalEnergyEarned, this.state.prestigePoints);
  }

  hasPrestigeThreshold(): boolean {
    return this.state.totalEnergyEarned >= PRESTIGE_CONFIG.threshold;
  }

  /** Prestige: spend earned points for a permanent multiplier. */
  doPrestige(): boolean {
    const gain = this.availablePrestige();
    if (gain <= 0) return false;
    this.state.prestigePoints += gain;
    this.state.energy = 0;
    this.state.totalEnergyEarned = 0;
    for (const key of Object.keys(this.state.upgrades)) {
      this.state.upgrades[key] = 0;
    }
    return true;
  }

  reset(): void {
    const fresh = createInitialState();
    this.state.energy = fresh.energy;
    this.state.totalEnergyEarned = fresh.totalEnergyEarned;
    this.state.level = fresh.level;
    for (const key of Object.keys(this.state.upgrades)) {
      delete this.state.upgrades[key];
    }
    this.state.prestigePoints = fresh.prestigePoints;
    this.state.lastSaved = Date.now();
  }
}
