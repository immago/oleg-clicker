import { format } from '../systems/format';

let audioCtx: AudioContext | null = null;

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

export function playClickSound(): void {
  tone(520, 0.09, 'triangle', 0.12);
}

export function playBuySound(): void {
  tone(660, 0.08, 'square', 0.1);
  setTimeout(() => tone(990, 0.12, 'square', 0.1), 60);
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
