import { CATEGORIES, CUSTOMIZATIONS } from '../config/customization';
import type { CustomItem } from '../config/customization';
import { UPGRADES } from '../config/upgrades';
import type { GameState } from '../types';
import { clickPower, cost as computeCost, perSecond } from '../systems/economy';
import { format } from '../systems/format';
import { currencyLabel } from '../i18n/declension';
import { formatTemplate, ru } from '../i18n/ru';

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

interface CustomizationNode {
  id: string;
  card: HTMLElement;
  name: HTMLElement;
  desc: HTMLElement;
  price: HTMLElement;
  prestige?: HTMLElement;
  btn: HTMLButtonElement;
}

function requireEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing DOM element #${id}`);
  return el as T;
}

export class Renderer {
  private readonly nodes: Record<string, UpgradeNode> = {};
  private readonly customizationNodes: Record<string, CustomizationNode> = {};
  private readonly els: {
    energyValue: HTMLElement;
    perSecond: HTMLElement;
    clickPower: HTMLElement;
    prestigeInfo: HTMLElement;
    prestigeBtn: HTMLButtonElement;
    clickList: HTMLElement;
    genList: HTMLElement;
    tabBar: HTMLElement;
    segmentKnob: HTMLElement;
    cardsContainer: HTMLElement;
    categoryTabs: Record<string, HTMLElement>;
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
      tabBar: requireEl('categoryTabs'),
      segmentKnob: requireEl('segmentKnob'),
      cardsContainer: requireEl('customizationCards'),
      categoryTabs: {},
    };
  }

  /** Build the upgrade DOM once from config. */
  build(): void {
    for (const def of UPGRADES) {
      this.createNode(def);
    }
    this.buildCustomization();
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
    level.textContent = `${ru.ui.levelPrefix} 0`;
    header.append(name, level);

    const desc = document.createElement('div');
    desc.className = 'upgrade-desc';
    desc.textContent = def.description;

    const footer = document.createElement('div');
    footer.className = 'upgrade-footer';
    const cost = document.createElement('span');
    cost.className = 'upgrade-cost';
    cost.textContent = currencyLabel(def.baseCost);
    const btn = document.createElement('button');
    btn.className = 'buy-btn';
     btn.textContent = isGenerator ? ru.ui.buy : ru.ui.upgrade;
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

  /** Build customization category tabs and item cards once from config. */
  private buildCustomization(): void {
    for (const cat of CATEGORIES) {
      const tab = document.createElement('div');
      tab.className = 'cat-tab';
      tab.dataset.category = cat.id;
      tab.textContent = cat.title;
      tab.addEventListener('click', () => this.setActiveTab(cat.id));
      this.els.tabBar.appendChild(tab);
      this.els.categoryTabs[cat.id] = tab;

      const group = document.createElement('div');
      group.className = 'customization-group';
      group.dataset.category = cat.id;
      this.els.cardsContainer.appendChild(group);

      for (const def of CUSTOMIZATIONS) {
        if (def.category !== cat.id) continue;
        this.createCustomizationCard(def, group);
      }
    }

    this.els.tabBar.style.setProperty('--n', String(CATEGORIES.length));
    this.setActiveTab(CATEGORIES[0].id);
  }

  private createCustomizationCard(def: CustomItem, group: HTMLElement): void {
    const card = document.createElement('div');
    card.className = 'customization-card';
    card.dataset.category = def.category;
    card.dataset.id = def.id;

    const name = document.createElement('div');
    name.className = 'customization-name';
    name.textContent = def.name;

    const desc = document.createElement('div');
    desc.className = 'customization-desc';
    desc.textContent = def.description ?? '';

    const price = document.createElement('div');
    price.className = 'customization-price';
    price.textContent = currencyLabel(def.cost);

    const btn = document.createElement('button');
    btn.className = 'buy-btn customization-buy';
    btn.type = 'button';
    btn.textContent = formatTemplate(ru.ui.buyWithCurrency, { cost: currencyLabel(def.cost) });

    let prestige: HTMLElement | undefined;
    if (def.unlockPrestige > 0) {
      prestige = document.createElement('div');
      prestige.className = 'customization-prestige';
      card.append(name, desc, prestige, price, btn);
    } else {
      card.append(name, desc, price, btn);
    }

    group.appendChild(card);
    this.customizationNodes[def.id] = { id: def.id, card, name, desc, price, prestige, btn };
  }

  /** Switch the visible customization category. */
  setActiveTab(categoryId: string): void {
    const index = CATEGORIES.findIndex((c) => c.id === categoryId);
    for (const [id, tab] of Object.entries(this.els.categoryTabs)) {
      tab.classList.toggle('active', id === categoryId);
    }

    const count = CATEGORIES.length;
    const innerWidth = this.els.tabBar.clientWidth - 6;
    const segmentWidth = innerWidth / count;
    const offset = 3 + segmentWidth * Math.max(0, index);
    this.els.segmentKnob.style.setProperty('--dx', `${offset}px`);
    const groups = this.els.cardsContainer.querySelectorAll<HTMLElement>('.customization-group');
    for (const group of groups) {
      group.style.display = group.dataset.category === categoryId ? '' : 'none';
    }
  }

  /** Update ownership, affordability and active state of every customization card. */
  private renderCustomization(state: GameState): void {
    for (const node of Object.values(this.customizationNodes)) {
      const def = CUSTOMIZATIONS.find((c: CustomItem) => c.id === node.id)!;
      const owned = !!state.customization.unlocked[def.id];
      const active = state.customization.active[def.category] === def.id;

      if (node.prestige) {
        if (state.prestigePoints >= def.unlockPrestige) {
          node.prestige.textContent = formatTemplate(ru.ui.prestigeReady, { n: def.unlockPrestige });
          node.prestige.classList.remove('locked');
          node.prestige.classList.add('ready');
        } else {
          node.prestige.textContent = formatTemplate(ru.ui.prestigeLocked, { n: def.unlockPrestige });
          node.prestige.classList.add('locked');
          node.prestige.classList.remove('ready');
        }
      }

      if (owned) {
        node.price.style.display = 'none';
        if (active) {
          node.btn.textContent = ru.ui.equipped;
          node.btn.disabled = true;
          node.card.classList.add('owned', 'active');
          node.card.classList.remove('equippable');
        } else {
          node.btn.textContent = ru.ui.equip;
          node.btn.disabled = false;
          node.card.classList.add('owned', 'equippable');
          node.card.classList.remove('active');
        }
      } else {
        node.price.style.display = '';
        const affordable = state.energy >= def.cost && state.prestigePoints >= def.unlockPrestige;
        node.btn.textContent = formatTemplate(ru.ui.buyWithCurrency, { cost: currencyLabel(def.cost) });
        node.btn.disabled = !affordable;
        node.card.classList.add('unowned');
        node.card.classList.remove('owned', 'active', 'equippable');
      }
    }
  }

  /** Full frame update of counters, costs, affordability and progress bars. */
  render(state: GameState): void {
    this.els.energyValue.textContent = currencyLabel(state.energy);
    this.els.perSecond.textContent = `${format(perSecond(state.upgrades, state.prestigePoints))}${ru.ui.perSecondSuffix}`;
    this.els.clickPower.textContent = `+${format(clickPower(state.upgrades, state.prestigePoints))}${ru.ui.clickSuffix}`;

    for (const node of Object.values(this.nodes)) {
      this.renderNode(node, state);
    }

    this.renderPrestige(state);
    this.renderCustomization(state);
  }

  private renderNode(node: UpgradeNode, state: GameState): void {
    const def = UPGRADES.find((u) => u.id === node.id)!;
    const level = state.upgrades[node.id] ?? 0;
    const price = computeCost(def, level);
    const affordable = state.energy >= price;

    node.level.textContent = `Lv ${level}`;
    node.cost.textContent = currencyLabel(price);

    if (def.kind === 'generator') {
      const output = def.perLevelPerSecond * level;
      node.desc.textContent = level > 0
        ? `${format(output)}${ru.ui.perSecondSuffix}${ru.ui.totalSuffix}`
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
      this.els.prestigeInfo.textContent = formatTemplate(ru.ui.prestigeInfoReady, { mult: mult.toFixed(2) });
      this.els.prestigeBtn.disabled = false;
    } else {
      this.els.prestigeInfo.textContent = formatTemplate(ru.ui.prestigeInfoLocked, { mult: mult.toFixed(2) });
      this.els.prestigeBtn.disabled = true;
    }
  }
}
