import { OFFLINE_CAP_SECONDS, SAVE_KEY } from '../config/upgrades';
import type { GameState, SaveData } from '../types';
import { applyTick } from '../systems/economy';
import { createDefaultCustomization, DEFAULT_CATEGORIES, getCustomById, itemsByCategory } from '../config/customization';
import type { CustomizationState } from '../types';

/** Structural validation of raw saved data. Returns true only for well-formed saves. */
export function validateSaveData(data: unknown): data is SaveData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
  const isValidCustomization = (v: unknown): boolean =>
    v === undefined || (typeof v === 'object' && v !== null);
  return (
    isNum(d.energy) &&
    isNum(d.totalEnergyEarned) &&
    isNum(d.level) &&
    isNum(d.prestigePoints) &&
    isNum(d.lastSaved) &&
    typeof d.upgrades === 'object' &&
    d.upgrades !== null &&
    isValidCustomization(d.customization)
  );
}

function sanitizeUnlocked(raw: unknown): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  if (typeof raw !== 'object' || raw === null) return result;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === true) result[key] = true;
  }
  return result;
}

/** Restore a customization state from raw data, falling back to defaults when missing. */
function sanitizeCustomization(raw: unknown): CustomizationState {
  const base = createDefaultCustomization();
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as Record<string, unknown>;
  const unlocked = sanitizeUnlocked(r.unlocked);
  const active = { ...base.active };
  const rawActive = r.active;
  for (const category of DEFAULT_CATEGORIES) {
    const value =
      rawActive && typeof rawActive === 'object'
        ? (rawActive as Record<string, unknown>)[category]
        : undefined;
    if (typeof value === 'string') {
      active[category] = value;
    } else if (!getCustomById(active[category])) {
      const items = itemsByCategory(category);
      if (items.length > 0) active[category] = items[0].id;
    }
  }
  return { unlocked, active };
}

function sanitizeUpgrades(raw: unknown): Record<string, number> {
  const result: Record<string, number> = {};
  if (typeof raw !== 'object' || raw === null) return result;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      result[key] = value;
    }
  }
  return result;
}

/** Energy gained while away for `dtSeconds`, capped at the offline limit. */
export function computeOfflineGain(state: GameState, dtSeconds: number): number {
  const capped = Math.min(Math.max(0, dtSeconds), OFFLINE_CAP_SECONDS);
  if (capped <= 0) return 0;
  const result = applyTick(state, capped);
  return result.energy - state.energy;
}

export function saveNow(state: GameState): void {
  state.lastSaved = Date.now();
  const payload: SaveData = {
    energy: state.energy,
    totalEnergyEarned: state.totalEnergyEarned,
    level: state.level,
    upgrades: { ...state.upgrades },
    prestigePoints: state.prestigePoints,
    lastSaved: state.lastSaved,
    customization: {
      unlocked: { ...state.customization.unlocked },
      active: { ...state.customization.active },
    },
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 5000;

/** Debounced auto-save; flushes immediately on `force`. */
export function scheduleSave(state: GameState, force = false): void {
  if (force) {
    if (saveTimer !== null) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    saveNow(state);
    return;
  }
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveNow(state);
  }, SAVE_DEBOUNCE_MS);
}

export interface LoadedGame {
  state: GameState;
  offlineGain: number;
}

/**
 * Load a saved game. Returns `null` when there is no valid save (caller resets).
 * Applies offline passive income for the time since the last save.
 */
export function loadGame(): LoadedGame | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!validateSaveData(data)) return null;

  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - data.lastSaved) / 1000);

  const state: GameState = {
    energy: data.energy,
    totalEnergyEarned: data.totalEnergyEarned,
    level: data.level,
    upgrades: sanitizeUpgrades(data.upgrades),
    prestigePoints: data.prestigePoints,
    lastSaved: now,
    customization: sanitizeCustomization(data.customization),
  };

  const offline = computeOfflineGain(state, elapsedSeconds);
  if (offline > 0) {
    state.energy += offline;
  }

  return { state, offlineGain: offline };
}

export function hasValidSave(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw !== null && validateSaveData(JSON.parse(raw));
  } catch {
    return false;
  }
}
