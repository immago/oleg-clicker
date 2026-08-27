import { getCustomById } from '../config/customization';
import type { SoundPreset } from '../config/customization';
import type { CustomizationState } from '../types';
import { format } from '../systems/format';

type SoundItem = { click: SoundPreset; buy: SoundPreset };

let audioCtx: AudioContext | null = null;
let currentSoundItem: SoundItem | null = null;

function getAudio(): AudioContext | undefined {
  if (typeof window === 'undefined') return undefined;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return undefined;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  return audioCtx;
}

/** Play a short synthesized tone. */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
): void {
  const ctx = getAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Update the active sound theme from a skin id (falls back to classic defaults). */
export function setSoundTheme(themeId: string): void {
  const item = getCustomById(themeId);
  currentSoundItem = item && item.category === 'sounds' ? (item as SoundItem) : null;
}

export function playClickSound(): void {
  if (currentSoundItem) {
    tone(currentSoundItem.click.freq, currentSoundItem.click.duration, currentSoundItem.click.type, currentSoundItem.click.volume);
  } else {
    tone(520, 0.09, 'triangle', 0.12);
  }
}

export function playBuySound(): void {
  const sound = currentSoundItem;
  if (sound) {
    tone(sound.buy.freq, sound.buy.duration, sound.buy.type, sound.buy.volume);
    setTimeout(
      () => tone(sound.buy.freq * 1.5, sound.buy.duration, sound.buy.type, sound.buy.volume),
      60,
    );
  } else {
    tone(660, 0.08, 'square', 0.1);
    setTimeout(() => tone(990, 0.12, 'square', 0.1), 60);
  }
}

/** Apply a CSS mouse cursor from a customization asset (falls back to 'auto'). */
export function applyCursorCustomization(asset: string, hotspotX: number, hotspotY: number): void {
  if (!asset) {
    document.body.style.cursor = 'auto';
    const style = document.getElementById('custom-cursor-style') as HTMLStyleElement | null;
    if (style) style.remove();
    return;
  }
  let url: string;
  try {
    url = new URL(asset, import.meta.url).href;
  } catch {
    document.body.style.cursor = 'auto';
    const style = document.getElementById('custom-cursor-style') as HTMLStyleElement | null;
    if (style) style.remove();
    return;
  }
  const value = `url(${url}) ${hotspotX} ${hotspotY}, auto`;
  document.body.style.cursor = value;

  // Override interactive elements so the custom cursor shows on hover too,
  // instead of the default pointer that buttons/links fall back to.
  let style = document.getElementById('custom-cursor-style') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'custom-cursor-style';
    document.head.appendChild(style);
  }
  style.textContent = `
    button, .buy-btn, [role="button"], a, input, label, summary {
      cursor: ${value} !important;
    }
  `;
}

/** Set the active button theme via a data attribute on <body>. */
export function applyButtonTheme(theme: string): void {
  document.body.dataset.buttonTheme = theme;
}

/** Apply trail (click particle) styling as CSS custom properties on <body>. */
export function applyTrailCustomization(color: string, shape: 'circle' | 'square' | 'star', size: number): void {
  const el = document.body;
  el.style.setProperty('--particle-color', color);
  el.style.setProperty('--particle-shape', shape);
  el.style.setProperty('--particle-size', `${size}px`);
}

/** Resolve and apply every active customization slot from a save state. */
export function applyCustomization(custom: CustomizationState): void {
  const cursor = getCustomById(custom.active.cursor);
  if (cursor && cursor.category === 'cursor') {
    applyCursorCustomization(cursor.asset, cursor.hotspotX, cursor.hotspotY);
  } else {
    applyCursorCustomization('', 0, 0);
  }

  const btn = getCustomById(custom.active.buttons);
  applyButtonTheme(btn && btn.category === 'buttons' ? (btn as { theme: string }).theme : 'default');

  const trail = getCustomById(custom.active.trail);
  if (trail && trail.category === 'trail') {
    applyTrailCustomization(trail.color, trail.shape, trail.size);
  } else {
    applyTrailCustomization('#4fd1ff', 'circle', 8);
  }

  setSoundTheme(custom.active.sounds);
}

function spawnParticle(x: number, y: number): void {
  const el = document.createElement('div');
  el.className = 'particle';
  const angle = Math.random() * Math.PI * 2;
  const dist = 40 + Math.random() * 70;
  el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
  el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/** Burst of particles at client coordinates. */
export function spawnClickBurst(x: number, y: number, count = 10): void {
  for (let i = 0; i < count; i++) {
    spawnParticle(x, y);
  }
}

/** Floating "+N" label that fades and rises. */
export function spawnFloatingText(
  x: number,
  y: number,
  text: string,
): void {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

export function floatingTextFor(amount: number): string {
  return `+${format(amount)}`;
}
