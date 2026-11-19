import { LEVEL_CATALOG } from '../domain/level-catalog.model';
import { isLevelUnlocked } from '../domain/level-progression.model';
import type { EditorActionEvent, EditorController } from '../editor/editor-controller';
import type {
  SimulationActionEvent,
  SimulationController,
} from '../simulation/simulation-controller';
import type { MenuDiorama } from '../rendering/menu-diorama';
import { i18n, type SupportedLocale } from '../../i18n';
import mainMenuHtml from './main-menu.html?raw';
import levelSelectHtml from './level-select.html?raw';
import tutorialBannerHtml from './tutorial-banner.html?raw';
import settingsModalHtml from './settings-modal.html?raw';
import { CatalogViewController } from './catalog-view';
import { InspectorPanelController } from './inspector-panel';

export type ScreenState = 'MAIN_MENU' | 'LEVEL_SELECT' | 'CATALOG' | 'GAMEPLAY';

export interface TutorialStep {
  readonly id: 'select-conveyor' | 'place-conveyor' | 'rotate-conveyor' | 'start-run';
  readonly title: string;
  readonly instruction: string;
}

const T00_STEPS: readonly TutorialStep[] = [
  {
    id: 'select-conveyor',
    title: 'tutorial.t00.step1.title',
    instruction: 'tutorial.t00.step1.instruction',
  },
  {
    id: 'place-conveyor',
    title: 'tutorial.t00.step2.title',
    instruction: 'tutorial.t00.step2.instruction',
  },
  {
    id: 'rotate-conveyor',
    title: 'tutorial.t00.step3.title',
    instruction: 'tutorial.t00.step3.instruction',
  },
  {
    id: 'start-run',
    title: 'tutorial.t00.step4.title',
    instruction: 'tutorial.t00.step4.instruction',
  },
];

export class NavigationController {
  private screen: ScreenState = 'MAIN_MENU';
  private tutorialActive = false;
  private tutorialStepIndex = 0;
  private settingsOpen = false;
  private readonly inspectorPanel: InspectorPanelController;
  private readonly catalogView: CatalogViewController;
  private lastSettingsInvoker: HTMLElement | null = null;
  private readonly app: HTMLElement;
  private readonly overlay: HTMLElement;
  private readonly settingsOverlay: HTMLElement;
  private readonly tutorialBanner: HTMLElement;
  private readonly editor: EditorController;
  private readonly simulation: SimulationController | null;
  private readonly menuDiorama: MenuDiorama | null;
  private readonly unsubscribeI18n: () => void;
  private readonly unsubscribeEditorAction: () => void;
  private readonly unsubscribeSimulationAction: () => void;

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.settingsOpen && event.key === 'Escape') {
      this.closeSettings();
      event.preventDefault();
    }
  };

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

    this.simulation?.setNavigationCallbacks({
      onOpenLevelSelect: () => this.setScreen('LEVEL_SELECT'),
      onOpenMainMenu: () => this.setScreen('MAIN_MENU'),
    });

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
      const helpBtn = document.createElement('button');
      helpBtn.type = 'button';
      helpBtn.id = 'reopen-tutorial';
      helpBtn.className = 'menu-nav-btn';
      helpBtn.textContent = i18n.t('common.help');
      helpBtn.addEventListener('click', () => this.toggleTutorialCoachmark());
      headerMeta.prepend(helpBtn);

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
        new Option('PortuguÃªs (Brasil)', 'pt-BR'),
        new Option('English', 'en'),
      );
      langSelect.value = i18n.getLocale();
      langSelect.addEventListener('change', () => {
        i18n.setLocale(langSelect.value as SupportedLocale);
      });
      headerMeta.prepend(langSelect);
    }

    this.unsubscribeEditorAction = this.editor.onAction((event) =>
      this.handleEditorAction(event),
    );
    this.unsubscribeSimulationAction =
      this.simulation?.onAction((event) => this.handleSimulationAction(event)) ??
      (() => undefined);

    document.addEventListener('keydown', this.handleKeyDown);

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
    this.inspectorPanel = new InspectorPanelController(app);
    this.catalogView = new CatalogViewController({
      getCompletedLevels: () => this.editor.getCompletedLevels(),
      getCollectedItems: () => this.editor.getCollectedItems(),
      onBack: () => this.setScreen('MAIN_MENU'),
      onOpen3DPreview: (type, invoker) => this.editor.openEquipmentPreview(type, invoker),
      mountHtml: (container, rawHtml) => this.mountHtml(container, rawHtml),
      applyDataI18n: (root) => this.applyDataI18n(root),
    });
    this.editor.refreshTranslations();
    this.simulation?.refreshTranslations();
    this.render();
  }

  dispose(): void {
    this.unsubscribeI18n();
    this.unsubscribeEditorAction();
    this.unsubscribeSimulationAction();
    this.inspectorPanel.dispose();
    document.removeEventListener('keydown', this.handleKeyDown);
    this.menuDiorama?.dispose();
  }

  getScreen(): ScreenState {
    return this.screen;
  }

  isTutorialActive(): boolean {
    return this.tutorialActive;
  }

  getTutorialStepIndex(): number {
    return this.tutorialStepIndex;
  }

  setScreen(screen: ScreenState): void {
    if (screen !== 'GAMEPLAY') {
      this.simulation?.ensureEditingMode();
    }
    this.screen = screen;
    this.render();
    this.renderTutorial();
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
    this.simulation?.ensureEditingMode();
    this.tutorialActive = false;
    this.tutorialStepIndex = 0;
    this.editor.setGameMode('CAMPAIGN');
    this.editor.selectLevel('L01', { forceEditMode: true });
    this.tutorialActive = true;
    this.setScreen('GAMEPLAY');
    this.renderTutorial();
  }

  toggleTutorialCoachmark(): void {
    if (this.tutorialActive) {
      this.tutorialActive = false;
      this.renderTutorial();
      return;
    }
    this.tutorialActive = true;
    this.tutorialStepIndex = 0;
    this.renderTutorial();
  }

  private handleEditorAction(event: EditorActionEvent): void {
    if (!this.tutorialActive || this.screen !== 'GAMEPLAY') return;
    const step = T00_STEPS[this.tutorialStepIndex];
    if (!step) return;

    if (
      step.id === 'select-conveyor' &&
      event.kind === 'TOOL_SELECTED' &&
      event.tool === 'CONVEYOR'
    ) {
      this.advanceTutorial();
      return;
    }

    if (
      step.id === 'place-conveyor' &&
      event.kind === 'COMPONENT_PLACED' &&
      event.component.type === 'CONVEYOR'
    ) {
      this.advanceTutorial();
      return;
    }

    if (
      step.id === 'rotate-conveyor' &&
      (event.kind === 'GHOST_ROTATED' || event.kind === 'COMPONENT_ROTATED')
    ) {
      this.advanceTutorial();
    }
  }

  private handleSimulationAction(event: SimulationActionEvent): void {
    if (!this.tutorialActive || this.screen !== 'GAMEPLAY') return;
    const step = T00_STEPS[this.tutorialStepIndex];
    if (step?.id === 'start-run' && event.kind === 'SIMULATION_STARTED') {
      this.advanceTutorial();
    }
  }

  private renderSettingsModal(): void {
    this.mountHtml(this.settingsOverlay, settingsModalHtml);
    this.applyDataI18n(this.settingsOverlay);
    const langSelect = this.settingsOverlay.querySelector<HTMLSelectElement>(
      '#settings-language-select',
    );
    if (langSelect) {
      langSelect.value = i18n.getLocale();
      langSelect.addEventListener('change', () => {
        i18n.setLocale(langSelect.value as SupportedLocale);
      });
    }
    const closeBtn =
      this.settingsOverlay.querySelector<HTMLButtonElement>('#close-settings');
    closeBtn?.addEventListener('click', () => this.closeSettings());
    closeBtn?.focus();
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
    if (!this.tutorialActive || this.screen !== 'GAMEPLAY') {
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
    this.tutorialBanner
      .querySelectorAll<HTMLElement>('[data-step-dot]')
      .forEach((dot) => {
        const idx = Number(dot.dataset['stepDot'] ?? 0);
        dot.dataset['state'] =
          idx < this.tutorialStepIndex
            ? 'done'
            : idx === this.tutorialStepIndex
              ? 'active'
              : 'pending';
      });
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
      this.simulation?.refreshTranslations();
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

      const continueBtn =
        this.overlay.querySelector<HTMLButtonElement>('#menu-continue');
      const levelsBtn = this.overlay.querySelector<HTMLButtonElement>('#menu-levels');
      if (completed.length > 0) {
        continueBtn?.classList.add('btn-primary');
        levelsBtn?.classList.remove('btn-primary');
      } else {
        levelsBtn?.classList.add('btn-primary');
        continueBtn?.classList.remove('btn-primary');
      }

      const progressEl = this.overlay.querySelector<HTMLElement>(
        '#menu-progress-summary',
      );
      if (progressEl) {
        progressEl.textContent = i18n.t('mainMenu.progressSummary', {
          done: completed.length,
          total: LEVEL_CATALOG.length,
        });
      }

      const langSelect =
        this.overlay.querySelector<HTMLSelectElement>('#menu-language-select');
      if (langSelect) {
        langSelect.value = currentLocale;
        langSelect.setAttribute('aria-label', i18n.t('common.language'));
        langSelect.addEventListener('change', (e) => {
          i18n.setLocale((e.target as HTMLSelectElement).value as SupportedLocale);
        });
      }

      continueBtn?.addEventListener('click', () => {
        this.menuDiorama?.stop();
        this.simulation?.ensureEditingMode();
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
        this.simulation?.ensureEditingMode();
        this.editor.setGameMode('SANDBOX');
        this.setScreen('GAMEPLAY');
      });
      this.overlay.querySelector('#menu-catalog')?.addEventListener('click', () => {
        this.setScreen('CATALOG');
      });
      const settingsBtn =
        this.overlay.querySelector<HTMLButtonElement>('#menu-settings');
      settingsBtn?.addEventListener('click', () => this.openSettings(settingsBtn));
      return;
    }

    if (this.screen === 'CATALOG') {
      this.menuDiorama?.stop();
      this.catalogView.render(this.overlay);
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
          const translatedTitle = i18n.t(`levels.${level.id}.title`);
          title.textContent = `${level.id} Â· ${translatedTitle === `levels.${level.id}.title` ? level.title : translatedTitle}`;
          const badge = document.createElement('span');
          badge.className = 'level-badge';
          badge.textContent = statusLabel;
          header.append(title, badge);

          const desc = document.createElement('p');
          const translatedTutorial = i18n.t(`levels.${level.id}.tutorial`);
          desc.textContent =
            translatedTutorial === `levels.${level.id}.tutorial`
              ? level.tutorial
              : translatedTutorial;

          card.append(header, desc);

          const best = this.editor.getBestResult(level.id);
          if (best) {
            const bestEl = document.createElement('p');
            bestEl.className = 'level-best-record';
            bestEl.textContent = i18n.t('levelSelect.bestRecord', {
              stars: best.stars,
              ticks: best.ticks,
              pieces: best.piecesUsed,
            });
            card.append(bestEl);
          }

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
          playBtn.textContent = unlocked
            ? i18n.t('levelSelect.play')
            : i18n.t('levelSelect.lockedBtn');

          card.append(playBtn);
          return card;
        });
        grid.replaceChildren(...cards);
      }
      this.overlay
        .querySelector('#level-select-back')
        ?.addEventListener('click', () => this.setScreen('MAIN_MENU'));
      this.overlay
        .querySelectorAll<HTMLButtonElement>('.level-play-btn')
        .forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.dataset['levelId'];
            if (!id || btn.disabled) return;
            this.simulation?.ensureEditingMode();
            this.editor.setGameMode('CAMPAIGN');
            this.editor.selectLevel(id, { forceEditMode: true });
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
    const setTitle = (selector: string, key: string): void => {
      const el = app.querySelector<HTMLElement>(selector);
      if (el) {
        const text = i18n.t(key);
        el.title = text;
        el.setAttribute('aria-label', text);
      }
    };

    setText('#open-main-menu', 'common.menu');
    setText('#open-settings', 'common.settings');
    setText('#reopen-tutorial', 'common.help');
    setText('label[for="game-mode-select"] span', 'common.mode');
    setText('#game-mode-select option[value="CAMPAIGN"]', 'common.campaign');
    setText('#game-mode-select option[value="SANDBOX"]', 'common.sandbox');
    setText('label[for="level-select"] span', 'common.level');
    setText('.board-badge', 'common.boardBadge');
    setText('#camera-controls-hint', 'camera.controlsHint');
    setTitle('#camera-rotate-left', 'camera.rotateLeft');
    setTitle('#camera-rotate-right', 'camera.rotateRight');
    setTitle('#zoom-reset', 'camera.center');
    setTitle('#zoom-in', 'camera.zoomIn');
    setTitle('#zoom-out', 'camera.zoomOut');

    setText('#paused-callout-text', 'simulation.pausedBannerText');
    setText('#paused-resume-cta', 'simulation.resume');
    setText('#paused-edit-cta', 'simulation.edit');

    setText('label[for="sandbox-source-mode"]', 'sandbox.source');
    setText('#sandbox-source-mode option[value="BLUE"]', 'sandbox.blueOnly');
    setText('#sandbox-source-mode option[value="AMBER"]', 'sandbox.amberOnly');
    setText('#sandbox-source-mode option[value="ALTERNATING"]', 'sandbox.alternating');
    setText('#clear-sandbox', 'sandbox.clear');
    setText('#load-sandbox-example', 'sandbox.example');

    setText('[data-tool="SELECT"] .tool-label', 'tools.select');
    setText('[data-tool="CONVEYOR"] .tool-label', 'tools.conveyor');
    setText('[data-tool="PROCESSOR"] .tool-label', 'tools.processor');
    setText('[data-tool="DIVERTER"] .tool-label', 'tools.diverter');
    setText('[data-tool="REMOVE"] .tool-label', 'tools.remove');
    setText('[data-action="rotate"] .tool-label', 'tools.rotate');
    setText('[data-action="cancel"] .tool-label', 'tools.cancel');
    setText('label[for="placement-direction"] span', 'tools.dir');
    setText('#placement-direction option[value="N"]', 'tools.north');
    setText('#placement-direction option[value="E"]', 'tools.east');
    setText('#placement-direction option[value="S"]', 'tools.south');
    setText('#placement-direction option[value="W"]', 'tools.west');

    setText('#lesson-heading', 'inspector.objective');
    setText('#selected-component-heading', 'inspector.selectedHeading');
    setText('#inventory-heading', 'inspector.inventory');
    setText('#ports-heading', 'inspector.statusPorts');
    setText('#processor-rules-heading', 'inspector.processorRecipes');
    setText('label[for="blue-rule-mode"]', 'inspector.blueBlank');
    setText('label[for="amber-rule-mode"]', 'inspector.amberBlank');
    setText('#blue-rule-mode option[value="NONE"]', 'inspector.noRule');
    setText('#blue-rule-mode option[value="CUT"]', 'inspector.modeCut');
    setText('#blue-rule-mode option[value="PRESS"]', 'inspector.modePress');
    setText('#amber-rule-mode option[value="NONE"]', 'inspector.noRule');
    setText('#amber-rule-mode option[value="CUT"]', 'inspector.modeCut');
    setText('#amber-rule-mode option[value="PRESS"]', 'inspector.modePress');
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

    setText('#result-eyebrow', 'result.eyebrow');
    setText('#result-heading', 'result.heading');
    setText('#result-subtitle', 'result.subtitle');
    setText('#stat-cycles-label', 'result.statCycles');
    setText('#stat-delivered-label', 'result.statDelivered');
    setText('#stat-rejected-label', 'result.statRejected');
    setText('#stat-shifts-label', 'result.statShifts');
    setText('#stat-pieces-label', 'result.statPieces');
    setText('#replay-simulation', 'result.replay');
    setText('#next-level', 'result.nextLevel');
    setText('#result-edit-factory', 'result.editFactory');
    setText('#result-level-select', 'result.levelSelect');
    setText('#result-main-menu', 'result.mainMenu');

    setText('#start-simulation', 'simulation.start');
    setText('#pause-simulation', 'simulation.pause');
    setText('#resume-simulation', 'simulation.resume');
    setText('#edit-simulation', 'simulation.edit');
    setText('#reset-simulation', 'simulation.reset');
    this.applyDataI18n(app);
  }
}
