export type CurrencyName = string;

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  growth: number;
  /** Energy gained per purchased level (for click upgrades, energy per click). */
  amount: number;
  /** 'click' | 'generator'. Generators contribute to passive income. */
  kind: 'click' | 'generator';
  /** Base production per second per level for generators. */
  perLevelPerSecond: number;
}

export interface SaveData {
  energy: number;
  totalEnergyEarned: number;
  level: number;
  upgrades: Record<string, number>;
  prestigePoints: number;
  lastSaved: number;
}

export interface GameState {
  energy: number;
  totalEnergyEarned: number;
  level: number;
  /** Owned levels per upgrade id. */
  upgrades: Record<string, number>;
  prestigePoints: number;
  lastSaved: number;
}
