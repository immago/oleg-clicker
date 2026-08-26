import { getUpgradeById } from '../config/upgrades';
import type { GameState, UpgradeDef } from '../types';
import { cost as computeCost } from '../systems/economy';

export class UpgradeManager {
  private readonly levels: Record<string, number>;

  constructor(levels: Record<string, number>) {
    this.levels = levels;
  }

  getLevel(id: string): number {
    return this.levels[id] ?? 0;
  }

  def(id: string): UpgradeDef {
    return getUpgradeById(id);
  }

  /** Cost to purchase the next level of an upgrade. */
  cost(id: string): number {
    return computeCost(this.def(id), this.getLevel(id));
  }

  canAfford(state: GameState, id: string): boolean {
    return state.energy >= this.cost(id);
  }

  /**
   * Attempt to buy one level. Mutates `state.energy` and the internal levels.
   * Returns true on success.
   */
  buy(state: GameState, id: string): boolean {
    const current = this.getLevel(id);
    const price = this.cost(id);
    if (state.energy < price) return false;
    state.energy -= price;
    this.levels[id] = current + 1;
    return true;
  }
}
