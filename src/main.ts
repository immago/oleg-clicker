import './ui/styles.css';
import { Game } from './game/Game';
import { loadGame, scheduleSave } from './state/storage';
import { Renderer } from './ui/render';
import {
  applyCustomization,
  floatingTextFor,
  playClickSound,
  playBuySound,
  spawnClickBurst,
  spawnFloatingText,
} from './ui/effects';
import { formatTemplate, ru } from './i18n/ru';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

function boot(): void {
  const renderer = new Renderer();
  renderer.build();

  let game: Game;
  const loaded = loadGame();
  if (loaded) {
    game = new Game(loaded.state);
    if (loaded.offlineGain > 0) {
      showToast(formatTemplate(ru.toast.offlineGain, { amount: formatNumber(loaded.offlineGain) }));
    }
  } else {
    game = new Game();
  }

  applyCustomization(game.state.customization);

  const orb = document.getElementById('orb') as HTMLButtonElement;
  orb.addEventListener('click', (event) => {
    const gained = game.click();
    playClickSound();
    spawnClickBurst(event.clientX, event.clientY);
    spawnFloatingText(event.clientX, event.clientY, floatingTextFor(gained));
  });

  document.querySelector('.upgrade-panel')!.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest('.buy-btn') as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;
    const card = btn.closest('.upgrade-card') as HTMLElement | null;
    const id = card?.dataset.id;
    if (!id) return;
    if (game.buyUpgrade(id)) {
      playBuySound();
      renderer.render(game.state);
    }
  });

  document.getElementById('prestigeBtn')!.addEventListener('click', () => {
    if (game.doPrestige()) {
      showToast(formatTemplate(ru.toast.prestige, { mult: (1 + game.state.prestigePoints * 0.01).toFixed(2) }));
      renderer.render(game.state);
    }
  });

  document.getElementById('resetBtn')!.addEventListener('click', () => {
    if (!confirm(ru.toast.confirmReset)) return;
    game.reset();
    renderer.render(game.state);
    applyCustomization(game.state.customization);
    scheduleSave(game.state, true);
    showToast(ru.toast.resetDone);
  });

  document.getElementById('categoryTabs')!.addEventListener('click', (event) => {
    const tab = (event.target as HTMLElement).closest('.cat-tab') as HTMLButtonElement | null;
    if (!tab || !tab.dataset.category) return;
    renderer.setActiveTab(tab.dataset.category);
  });

  document.getElementById('customizationCards')!.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest('.customization-buy') as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;
    const card = btn.closest('.customization-card') as HTMLElement | null;
    const id = card?.dataset.id;
    if (!id) return;
    const wasOwned = card.classList.contains('owned');
    if (game.buyCustom(id)) {
      if (wasOwned) {
        playClickSound();
        showToast(ru.toast.equipped);
      } else {
        playBuySound();
        showToast(ru.toast.bought);
      }
      renderer.render(game.state);
      applyCustomization(game.state.customization);
    }
  });

  let last = performance.now();
  let acc = 0;
  function frame(now: number): void {
    const delta = (now - last) / 1000;
    last = now;
    acc = Math.min(acc + delta, MAX_FRAME);
    while (acc >= STEP) {
      game.tick(STEP);
      acc -= STEP;
    }
    renderer.render(game.state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  scheduleSave(game.state);
  window.addEventListener('pagehide', () => scheduleSave(game.state, true));
  window.addEventListener('beforeunload', () => scheduleSave(game.state, true));
}

function formatNumber(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function showToast(message: string): void {
  const el = document.createElement('div');
  el.textContent = message;
  el.className = 'toast';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

boot();
