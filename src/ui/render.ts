import { CURRENCY_NAME, UPGRADES } from '../config/upgrades';
import type { GameState } from '../types';
import { clickPower, cost as computeCost, perSecond } from '../systems/economy';
import { format } from '../systems/format';

interface UpgradeNode {
  id: string;
  wrap: HTMLElement;
  name: HTMLElement;
  desc: HTMLElement;
  level: HTMLElement;
  cost: HTMLElement;
  btn: HTMLButtonElement;
  bar: HTMLElement;
}

function requireEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing DOM element #${id}`);
  return el as T;
}

export class Renderer {
  private readonly nodes: Record<string, UpgradeNode> = {};
  private readonly els: {
    energyValue: HTMLElement;
    perSecond: HTMLElement;
    clickPower: HTMLElement;
    prestigeInfo: HTMLElement;
    prestigeBtn: HTMLButtonElement;
    clickList: HTMLElement;
    genList: HTMLElement;
  };

  constructor() {
    this.els = {
      energyValue: requireEl('energyValue'),
      perSecond: requireEl('perSecond'),
      clickPower: requireEl('clickPower'),
      prestigeInfo: requireEl('prestigeInfo'),
      prestigeBtn: requireEl<HTMLButtonElement>('prestigeBtn'),
      clickList: requireEl('clickUpgrades'),
      genList: requireEl('generators'),
    };
  }

  /** Build the upgrade DOM once from config. */
  build(): void {
    for (const def of UPGRADES) {
      this.createNode(def);
    }
  }

  private createNode(def: (typeof UPGRADES)[number]): void {
    const isGenerator = def.kind === 'generator';
    const wrap = document.createElement('div');
    wrap.className = 'upgrade-card';

    const header = document.createElement('div');
    header.className = 'upgrade-header';
    const name = document.createElement('span');
    name.className = 'upgrade-name';
    name.textContent = def.name;
    const level = document.createElement('span');
    level.className = 'upgrade-level';
    level.textContent = 'Ур. 0';
    header.append(name, level);

    const desc = document.createElement('div');
    desc.className = 'upgrade-desc';
    desc.textContent = def.description;

    const footer = document.createElement('div');
    footer.className = 'upgrade-footer';
    const cost = document.createElement('span');
    cost.className = 'upgrade-cost';
    cost.textContent = `${format(def.baseCost)} ${CURRENCY_NAME}`;
    const btn = document.createElement('button');
    btn.className = 'buy-btn';
     btn.textContent = isGenerator ? 'Купить' : 'Улучшить';
    footer.append(cost, btn);

    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    bar.appendChild(fill);

    wrap.append(header, desc, footer, bar);

    if (isGenerator) {
      this.els.genList.appendChild(wrap);
    } else {
      this.els.clickList.appendChild(wrap);
    }

    wrap.dataset.id = def.id;
    const node: UpgradeNode = { id: def.id, wrap, name, desc, level, cost, btn, bar: fill };
    this.nodes[def.id] = node;
  }

  /** Full frame update of counters, costs, affordability and progress bars. */
  render(state: GameState): void {
    this.els.energyValue.textContent = `${format(state.energy)} ${CURRENCY_NAME}`;
    this.els.perSecond.textContent = `${format(perSecond(state.upgrades, state.prestigePoints))} / сек`;
    this.els.clickPower.textContent = `+${format(clickPower(state.upgrades, state.prestigePoints))} за клик`;

    for (const node of Object.values(this.nodes)) {
      this.renderNode(node, state);
    }

    this.renderPrestige(state);
  }

  private renderNode(node: UpgradeNode, state: GameState): void {
    const def = UPGRADES.find((u) => u.id === node.id)!;
    const level = state.upgrades[node.id] ?? 0;
    const price = computeCost(def, level);
    const affordable = state.energy >= price;

    node.level.textContent = `Lv ${level}`;
    node.cost.textContent = `${format(price)} ${CURRENCY_NAME}`;

    if (def.kind === 'generator') {
      const output = def.perLevelPerSecond * level;
      node.desc.textContent = level > 0
        ? `${format(output)} / сек всего`
        : def.description;
    }

    const ratio = Math.min(1, price === 0 ? 1 : state.energy / price);
    node.bar.style.width = `${ratio * 100}%`;

    if (affordable) {
      node.wrap.classList.add('affordable');
      node.btn.disabled = false;
    } else {
      node.wrap.classList.remove('affordable');
      node.btn.disabled = true;
    }
  }

  private renderPrestige(state: GameState): void {
    const mult = 1 + state.prestigePoints * 0.01;
    if (state.totalEnergyEarned >= 1_000_000) {
      this.els.prestigeInfo.textContent = `×${mult.toFixed(2)} постоянный множитель`;
      this.els.prestigeBtn.disabled = false;
    } else {
      this.els.prestigeInfo.textContent = `Наберите 1M энергии за игру для Престижа (×${mult.toFixed(2)})`;
      this.els.prestigeBtn.disabled = true;
    }
  }
}
