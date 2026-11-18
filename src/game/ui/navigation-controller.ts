import { LEVEL_CATALOG } from '../domain/level-catalog.model';
import { isLevelUnlocked } from '../domain/level-progression.model';
import type { EditorController } from '../editor/editor-controller';
import { i18n, type SupportedLocale } from '../../i18n';
import mainMenuHtml from './main-menu.html?raw';
import levelSelectHtml from './level-select.html?raw';
import tutorialBannerHtml from './tutorial-banner.html?raw';

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
  private readonly overlay: HTMLElement;
  private readonly tutorialBanner: HTMLElement;
  private readonly editor: EditorController;
  private readonly unsubscribeI18n: () => void;

  constructor(app: HTMLElement, editor: EditorController) {
    this.editor = editor;

    this.overlay = document.createElement('div');
    this.overlay.id = 'game-screen-overlay';
    this.overlay.className = 'screen-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    app.appendChild(this.overlay);

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
      this.render();
      this.renderTutorial();
    });

    this.applyStaticTranslations(app);
    this.bindTutorialEvents(app);
    this.render();
  }

  dispose(): void {
    this.unsubscribeI18n();
  }

  setScreen(screen: ScreenState): void {
    this.screen = screen;
    this.render();
  }

  startTutorial(): void {
    this.tutorialActive = true;
    this.tutorialStepIndex = 0;
    this.editor.setGameMode('CAMPAIGN');
    this.editor.selectLevel('L01');
    this.setScreen('GAMEPLAY');
    this.renderTutorial();
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
    if (this.screen === 'GAMEPLAY') {
      this.overlay.hidden = true;
      return;
    }

    this.overlay.hidden = false;
    if (this.screen === 'MAIN_MENU') {
      const currentLocale = i18n.getLocale();
      this.mountHtml(this.overlay, mainMenuHtml);
      this.applyDataI18n(this.overlay);
      const langSelect = this.overlay.querySelector<HTMLSelectElement>('#menu-language-select');
      if (langSelect) {
        langSelect.value = currentLocale;
        langSelect.setAttribute('aria-label', i18n.t('common.language'));
        langSelect.addEventListener('change', (e) => {
          i18n.setLocale((e.target as HTMLSelectElement).value as SupportedLocale);
        });
      }
      this.overlay.querySelector('#menu-continue')?.addEventListener('click', () => {
        this.editor.setGameMode('CAMPAIGN');
        this.setScreen('GAMEPLAY');
      });
      this.overlay.querySelector('#menu-levels')?.addEventListener('click', () => this.setScreen('LEVEL_SELECT'));
      this.overlay.querySelector('#menu-tutorial')?.addEventListener('click', () => this.startTutorial());
      this.overlay.querySelector('#menu-sandbox')?.addEventListener('click', () => {
        this.editor.setGameMode('SANDBOX');
        this.setScreen('GAMEPLAY');
      });
      return;
    }

    if (this.screen === 'LEVEL_SELECT') {
      const completed = this.editor.getCompletedLevels();
      this.mountHtml(this.overlay, levelSelectHtml);
      this.applyDataI18n(this.overlay);
      const grid = this.overlay.querySelector('.level-grid');
      if (grid) {
        const cards = LEVEL_CATALOG.map((level) => {
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
          desc.textContent = level.tutorial;

          const playBtn = document.createElement('button');
          playBtn.type = 'button';
          playBtn.className = 'level-play-btn';
          playBtn.dataset['levelId'] = level.id;
          playBtn.disabled = !unlocked;
          playBtn.textContent = unlocked ? i18n.t('levelSelect.play') : i18n.t('levelSelect.lockedBtn');

          card.append(header, desc, playBtn);
          return card;
        });
        grid.replaceChildren(...cards);
      }
      this.overlay.querySelector('#level-select-back')?.addEventListener('click', () => this.setScreen('MAIN_MENU'));
      this.overlay.querySelectorAll<HTMLButtonElement>('.level-play-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset['levelId'];
          if (!id) return;
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
    setText('.board-badge', 'common.boardBadge');
    setText('[data-tool="SELECT"] span', 'tools.select');
    setText('[data-tool="CONVEYOR"] span', 'tools.conveyor');
    setText('[data-tool="PROCESSOR"] span', 'tools.processor');
    setText('[data-tool="DIVERTER"] span', 'tools.diverter');
    setText('[data-tool="REMOVE"] span', 'tools.remove');
    setText('[data-action="rotate"] span', 'tools.rotate');
    setText('[data-action="cancel"] span', 'tools.cancel');
    setText('#lesson-heading', 'inspector.objective');
    setText('#inventory-heading', 'inspector.inventory');
    setText('#ports-heading', 'inspector.statusPorts');
    setText('#processor-rules-heading', 'inspector.processorRecipes');
    setText('#diverter-rules-heading', 'inspector.diverterRoutes');
    setText('#save-processor-rules', 'inspector.saveRecipes');
    setText('#save-diverter-rules', 'inspector.saveRoutes');
    setText('#start-simulation', 'simulation.start');
    setText('#pause-simulation', 'simulation.pause');
    setText('#resume-simulation', 'simulation.resume');
    setText('#edit-simulation', 'simulation.edit');
    setText('#reset-simulation', 'simulation.reset');
  }
}
