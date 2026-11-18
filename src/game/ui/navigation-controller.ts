import { LEVEL_CATALOG } from '../domain/level-catalog.model';
import { isLevelUnlocked } from '../domain/level-progression.model';
import type { EditorController } from '../editor/editor-controller';
import type { SimulationController } from '../simulation/simulation-controller';
import type { MenuDiorama } from '../rendering/menu-diorama';
import { i18n, type SupportedLocale } from '../../i18n';
import mainMenuHtml from './main-menu.html?raw';
import levelSelectHtml from './level-select.html?raw';
import tutorialBannerHtml from './tutorial-banner.html?raw';
import settingsModalHtml from './settings-modal.html?raw';

export type ScreenState = 'MAIN_MENU' | 'LEVEL_SELECT' | 'GAMEPLAY';

export interface TutorialStep {
  readonly id: string;
  readonly title: string;
  readonly instruction: string;
}

const T00_STEPS: readonly TutorialStep[] = [
  { id: 'select-conveyor', title: 'tutorial.t00.step1.title', instruction: 'tutorial.t00.step1.instruction' },
  { id: 'place-conveyor', title: 'tutorial.t00.step2.title', instruction: 'tutorial.t00.step2.instruction' },
  { id: 'rotate-conveyor', title: 'tutorial.t00.step3.title', instruction: 'tutorial.t00.step3.instruction' },
  { id: 'start-run', title: 'tutorial.t00.step4.title', instruction: 'tutorial.t00.step4.instruction' },
];

export class NavigationController {
  private screen: ScreenState = 'MAIN_MENU';
  private tutorialActive = false;
  private tutorialStepIndex = 0;
  private settingsOpen = false;
  private lastSettingsInvoker: HTMLElement | null = null;
  private readonly app: HTMLElement;
  private readonly overlay: HTMLElement;
  private readonly settingsOverlay: HTMLElement;
  private readonly tutorialBanner: HTMLElement;
  private readonly editor: EditorController;
  private readonly simulation: SimulationController | null;
  private readonly menuDiorama: MenuDiorama | null;
  private readonly unsubscribeI18n: () => void;

  constructor(
    app: HTMLElement,
    editor: EditorController,
    simulation: SimulationController | null = null,
    menuDiorama: MenuDiorama | null = null,
  ) {
    this.app = app;
    this.editor = editor;
    this.simulation = simulation;
    this.menuDiorama = menuDiorama;

    this.overlay = document.createElement('div');
    this.overlay.id = 'game-screen-overlay';
    this.overlay.className = 'screen-overlay';
    this.overlay.setAttribute('role', 'region');
    this.overlay.setAttribute('aria-label', 'Game navigation');
    app.appendChild(this.overlay);

    this.settingsOverlay = document.createElement('div');
    this.settingsOverlay.id = 'settings-overlay';
    this.settingsOverlay.className = 'settings-overlay';
    this.settingsOverlay.hidden = true;
    app.appendChild(this.settingsOverlay);

    this.tutorialBanner = document.createElement('div');
    this.tutorialBanner.id = 'tutorial-banner';
    this.tutorialBanner.className = 'tutorial-banner';
    this.tutorialBanner.hidden = true;
    app.appendChild(this.tutorialBanner);

    const headerBrand = app.querySelector('.header-brand');
    if (headerBrand) {
      const menuBtn = document.createElement('button');
      menuBtn.type = 'button';
      menuBtn.id = 'open-main-menu';
      menuBtn.className = 'menu-nav-btn';
      menuBtn.textContent = i18n.t('common.menu');
      menuBtn.addEventListener('click', () => this.setScreen('MAIN_MENU'));
      headerBrand.prepend(menuBtn);
    }

    const headerMeta = app.querySelector('.header-meta');
    if (headerMeta) {
      const settingsBtn = document.createElement('button');
      settingsBtn.type = 'button';
      settingsBtn.id = 'open-settings';
      settingsBtn.className = 'menu-nav-btn';
      settingsBtn.textContent = i18n.t('common.settings');
      settingsBtn.addEventListener('click', () => this.openSettings(settingsBtn));
      headerMeta.prepend(settingsBtn);

      const langSelect = document.createElement('select');
      langSelect.id = 'hud-language-select';
      langSelect.setAttribute('aria-label', i18n.t('common.language'));
      langSelect.append(
        new Option('Português (Brasil)', 'pt-BR'),
        new Option('English', 'en'),
      );
      langSelect.value = i18n.getLocale();
      langSelect.addEventListener('change', () => {
        i18n.setLocale(langSelect.value as SupportedLocale);
      });
      headerMeta.prepend(langSelect);
    }

    this.unsubscribeI18n = i18n.subscribe((locale) => {
      const hudLang = app.querySelector<HTMLSelectElement>('#hud-language-select');
      if (hudLang) hudLang.value = locale;
      this.applyStaticTranslations(app);
      this.editor.refreshTranslations();
      this.simulation?.refreshTranslations();
      this.render();
      this.renderTutorial();
      if (this.settingsOpen) this.renderSettingsModal();
    });

    this.applyStaticTranslations(app);
    this.editor.refreshTranslations();
    this.simulation?.refreshTranslations();
    this.bindTutorialEvents(app);
    this.render();
  }

  dispose(): void {
    this.unsubscribeI18n();
    this.menuDiorama?.dispose();
  }

  getScreen(): ScreenState {
    return this.screen;
  }

  setScreen(screen: ScreenState): void {
    this.screen = screen;
    this.render();
  }

  openSettings(invoker?: HTMLElement | null): void {
    this.lastSettingsInvoker = invoker ?? null;
    this.settingsOpen = true;
    this.settingsOverlay.hidden = false;
    this.renderSettingsModal();
  }

  closeSettings(): void {
    this.settingsOpen = false;
    this.settingsOverlay.hidden = true;
    this.lastSettingsInvoker?.focus();
  }

  startTutorial(): void {
    this.tutorialActive = true;
    this.tutorialStepIndex = 0;
    this.editor.setGameMode('CAMPAIGN');
    this.editor.selectLevel('L01');
    this.setScreen('GAMEPLAY');
    this.renderTutorial();
  }

  private renderSettingsModal(): void {
    this.mountHtml(this.settingsOverlay, settingsModalHtml);
    this.applyDataI18n(this.settingsOverlay);
    const langSelect = this.settingsOverlay.querySelector<HTMLSelectElement>('#settings-language-select');
    if (langSelect) {
      langSelect.value = i18n.getLocale();
      langSelect.addEventListener('change', () => {
        i18n.setLocale(langSelect.value as SupportedLocale);
      });
    }
    const closeBtn = this.settingsOverlay.querySelector<HTMLButtonElement>('#close-settings');
    closeBtn?.addEventListener('click', () => this.closeSettings());
    closeBtn?.focus();
  }

  private bindTutorialEvents(app: HTMLElement): void {
    app.addEventListener('click', (event) => {
      if (!this.tutorialActive) return;
      const target = event.target as HTMLElement;
      const step = T00_STEPS[this.tutorialStepIndex];
      if (!step) return;

      if (step.id === 'select-conveyor' && target.closest('[data-tool="CONVEYOR"]')) {
        this.advanceTutorial();
      } else if (step.id === 'place-conveyor' && target.id === 'factory-canvas') {
        this.advanceTutorial();
      } else if (step.id === 'rotate-conveyor' && target.closest('[data-action="rotate"]')) {
        this.advanceTutorial();
      } else if (step.id === 'start-run' && target.id === 'start-simulation') {
        this.advanceTutorial();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (this.settingsOpen && event.key === 'Escape') {
        this.closeSettings();
        event.preventDefault();
        return;
      }
      if (!this.tutorialActive) return;
      const step = T00_STEPS[this.tutorialStepIndex];
      if (step?.id === 'rotate-conveyor' && (event.key === 'r' || event.key === 'R')) {
        this.advanceTutorial();
      }
    });
  }

  private advanceTutorial(): void {
    this.tutorialStepIndex += 1;
    if (this.tutorialStepIndex >= T00_STEPS.length) {
      this.tutorialActive = false;
      this.tutorialBanner.hidden = true;
      return;
    }
    this.renderTutorial();
  }

  private renderTutorial(): void {
    if (!this.tutorialActive) {
      this.tutorialBanner.hidden = true;
      return;
    }
    const step = T00_STEPS[this.tutorialStepIndex]!;
    this.tutorialBanner.hidden = false;
    this.mountHtml(this.tutorialBanner, tutorialBannerHtml);
    const titleEl = this.tutorialBanner.querySelector('#tutorial-step-title');
    const instrEl = this.tutorialBanner.querySelector('#tutorial-step-instruction');
    if (titleEl) titleEl.textContent = i18n.t(step.title);
    if (instrEl) instrEl.textContent = i18n.t(step.instruction);
    this.applyDataI18n(this.tutorialBanner);
    this.tutorialBanner.querySelector('#skip-tutorial')?.addEventListener('click', () => {
      this.tutorialActive = false;
      this.tutorialBanner.hidden = true;
    });
  }

  private render(): void {
    this.app.dataset['screen'] = this.screen;

    if (this.screen === 'GAMEPLAY') {
      this.menuDiorama?.stop();
      this.overlay.hidden = true;
      this.editor.refreshTranslations();
      return;
    }

    this.overlay.hidden = false;
    this.overlay.dataset['screen'] = this.screen;

    if (this.screen === 'MAIN_MENU') {
      this.menuDiorama?.start();
      const currentLocale = i18n.getLocale();
      const completed = this.editor.getCompletedLevels();
      this.mountHtml(this.overlay, mainMenuHtml);
      this.applyDataI18n(this.overlay);

      const continueBtn = this.overlay.querySelector<HTMLButtonElement>('#menu-continue');
      const levelsBtn = this.overlay.querySelector<HTMLButtonElement>('#menu-levels');
      if (completed.length > 0) {
        continueBtn?.classList.add('btn-primary');
        levelsBtn?.classList.remove('btn-primary');
      } else {
        levelsBtn?.classList.add('btn-primary');
        continueBtn?.classList.remove('btn-primary');
      }

      const progressEl = this.overlay.querySelector<HTMLElement>('#menu-progress-summary');
      if (progressEl) {
        progressEl.textContent = i18n.t('mainMenu.progressSummary', {
          done: completed.length,
          total: LEVEL_CATALOG.length,
        });
      }

      const langSelect = this.overlay.querySelector<HTMLSelectElement>('#menu-language-select');
      if (langSelect) {
        langSelect.value = currentLocale;
        langSelect.setAttribute('aria-label', i18n.t('common.language'));
        langSelect.addEventListener('change', (e) => {
          i18n.setLocale((e.target as HTMLSelectElement).value as SupportedLocale);
        });
      }

      continueBtn?.addEventListener('click', () => {
        this.menuDiorama?.stop();
        if (this.editor.isSandbox()) this.editor.setGameMode('CAMPAIGN');
        this.setScreen('GAMEPLAY');
      });
      levelsBtn?.addEventListener('click', () => this.setScreen('LEVEL_SELECT'));
      this.overlay.querySelector('#menu-tutorial')?.addEventListener('click', () => {
        this.menuDiorama?.stop();
        this.startTutorial();
      });
      this.overlay.querySelector('#menu-sandbox')?.addEventListener('click', () => {
        this.menuDiorama?.stop();
        this.editor.setGameMode('SANDBOX');
        this.setScreen('GAMEPLAY');
      });
      const settingsBtn = this.overlay.querySelector<HTMLButtonElement>('#menu-settings');
      settingsBtn?.addEventListener('click', () => this.openSettings(settingsBtn));
      return;
    }

    if (this.screen === 'LEVEL_SELECT') {
      this.menuDiorama?.stop();
      const completed = this.editor.getCompletedLevels();
      this.mountHtml(this.overlay, levelSelectHtml);
      this.applyDataI18n(this.overlay);
      const grid = this.overlay.querySelector('.level-grid');
      if (grid) {
        const cards = LEVEL_CATALOG.map((level, idx) => {
          const unlocked = isLevelUnlocked(level.id, completed);
          const isDone = completed.includes(level.id);
          const status = isDone ? 'COMPLETED' : unlocked ? 'UNLOCKED' : 'LOCKED';
          const statusLabel = isDone
            ? i18n.t('levelSelect.completed')
            : unlocked
              ? i18n.t('levelSelect.unlocked')
              : i18n.t('levelSelect.locked');

          const card = document.createElement('div');
          card.className = 'level-card';
          card.dataset['status'] = status;

          const header = document.createElement('div');
          header.className = 'level-card-header';
          const title = document.createElement('strong');
          title.textContent = `${level.id} · ${i18n.t(`levels.${level.id}.title`)}`;
          const badge = document.createElement('span');
          badge.className = 'level-badge';
          badge.textContent = statusLabel;
          header.append(title, badge);

          const desc = document.createElement('p');
          desc.textContent = i18n.t(`levels.${level.id}.tutorial`);

          card.append(header, desc);

          if (!unlocked && idx > 0) {
            const prereq = document.createElement('p');
            prereq.className = 'level-prereq';
            prereq.textContent = i18n.t('levelSelect.prerequisite', {
              prev: LEVEL_CATALOG[idx - 1]!.id,
            });
            card.append(prereq);
          }

          const playBtn = document.createElement('button');
          playBtn.type = 'button';
          playBtn.className = unlocked ? 'level-play-btn btn-primary' : 'level-play-btn';
          playBtn.dataset['levelId'] = level.id;
          playBtn.disabled = !unlocked;
          playBtn.textContent = unlocked ? i18n.t('levelSelect.play') : i18n.t('levelSelect.lockedBtn');

          card.append(playBtn);
          return card;
        });
        grid.replaceChildren(...cards);
      }
      this.overlay.querySelector('#level-select-back')?.addEventListener('click', () => this.setScreen('MAIN_MENU'));
      this.overlay.querySelectorAll<HTMLButtonElement>('.level-play-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset['levelId'];
          if (!id || btn.disabled) return;
          this.editor.setGameMode('CAMPAIGN');
          this.editor.selectLevel(id);
          this.setScreen('GAMEPLAY');
        });
      });
    }
  }

  private mountHtml(container: HTMLElement, html: string): void {
    const template = document.createElement('template');
    template.innerHTML = html;
    container.replaceChildren(template.content.cloneNode(true));
  }

  private applyDataI18n(root: HTMLElement): void {
    root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
      const key = el.dataset['i18n'];
      if (key) el.textContent = i18n.t(key);
    });
  }

  private applyStaticTranslations(app: HTMLElement): void {
    const setText = (selector: string, key: string): void => {
      const el = app.querySelector(selector);
      if (el) el.textContent = i18n.t(key);
    };

    setText('#open-main-menu', 'common.menu');
    setText('#open-settings', 'common.settings');
    setText('label[for="game-mode-select"] span', 'common.mode');
    setText('#game-mode-select option[value="CAMPAIGN"]', 'common.campaign');
    setText('#game-mode-select option[value="SANDBOX"]', 'common.sandbox');
    setText('label[for="level-select"] span', 'common.level');
    setText('.board-badge', 'common.boardBadge');
    setText('label[for="sandbox-source-mode"]', 'sandbox.source');
    setText('#sandbox-source-mode option[value="BLUE"]', 'sandbox.blueOnly');
    setText('#sandbox-source-mode option[value="AMBER"]', 'sandbox.amberOnly');
    setText('#sandbox-source-mode option[value="ALTERNATING"]', 'sandbox.alternating');
    setText('#clear-sandbox', 'sandbox.clear');
    setText('#load-sandbox-example', 'sandbox.example');
    setText('[data-tool="SELECT"] span', 'tools.select');
    setText('[data-tool="CONVEYOR"] span', 'tools.conveyor');
    setText('[data-tool="PROCESSOR"] span', 'tools.processor');
    setText('[data-tool="DIVERTER"] span', 'tools.diverter');
    setText('[data-tool="REMOVE"] span', 'tools.remove');
    setText('[data-action="rotate"] span', 'tools.rotate');
    setText('[data-action="cancel"] span', 'tools.cancel');
    setText('label[for="placement-direction"] span', 'tools.dir');
    setText('#placement-direction option[value="N"]', 'tools.north');
    setText('#placement-direction option[value="E"]', 'tools.east');
    setText('#placement-direction option[value="S"]', 'tools.south');
    setText('#placement-direction option[value="W"]', 'tools.west');
    setText('#lesson-heading', 'inspector.objective');
    setText('#inventory-heading', 'inspector.inventory');
    setText('#ports-heading', 'inspector.statusPorts');
    setText('#processor-rules-heading', 'inspector.processorRecipes');
    setText('label[for="blue-rule-mode"]', 'inspector.blueBlank');
    setText('label[for="amber-rule-mode"]', 'inspector.amberBlank');
    setText('#blue-rule-mode option[value="NONE"]', 'inspector.noRule');
    setText('#amber-rule-mode option[value="NONE"]', 'inspector.noRule');
    setText('#save-processor-rules', 'inspector.saveRecipes');
    setText('#diverter-rules-heading', 'inspector.diverterRoutes');
    setText('label[for="cut-route"]', 'inspector.cutPlate');
    setText('label[for="pressed-route"]', 'inspector.pressedBlock');
    setText('#cut-route option[value="NONE"]', 'inspector.noRule');
    setText('#cut-route option[value="A"]', 'inspector.routeA');
    setText('#cut-route option[value="B"]', 'inspector.routeB');
    setText('#pressed-route option[value="NONE"]', 'inspector.noRule');
    setText('#pressed-route option[value="A"]', 'inspector.routeA');
    setText('#pressed-route option[value="B"]', 'inspector.routeB');
    setText('#save-diverter-rules', 'inspector.saveRoutes');
    setText('#result-heading', 'result.heading');
    setText('#replay-simulation', 'result.replay');
    setText('#next-level', 'result.nextLevel');
    setText('#start-simulation', 'simulation.start');
    setText('#pause-simulation', 'simulation.pause');
    setText('#resume-simulation', 'simulation.resume');
    setText('#edit-simulation', 'simulation.edit');
    setText('#reset-simulation', 'simulation.reset');
  }
}
