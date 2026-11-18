import { LEVEL_CATALOG } from '../domain/level-catalog.model';
import { isLevelUnlocked } from '../domain/level-progression.model';
import type { EditorController } from '../editor/editor-controller';

export type ScreenState = 'MAIN_MENU' | 'LEVEL_SELECT' | 'GAMEPLAY';

export interface TutorialStep {
  readonly id: string;
  readonly title: string;
  readonly instruction: string;
}

const T00_STEPS: readonly TutorialStep[] = [
  { id: 'select-conveyor', title: 'T00 · Step 1/4', instruction: 'Select the Conveyor tool from the left rail.' },
  { id: 'place-conveyor', title: 'T00 · Step 2/4', instruction: 'Click an empty cell on the 8 × 8 board to place a conveyor.' },
  { id: 'rotate-conveyor', title: 'T00 · Step 3/4', instruction: 'Select the placed conveyor and press R (or Rotate) to turn it.' },
  { id: 'start-run', title: 'T00 · Step 4/4', instruction: 'Press Start in the bottom bar to run the factory.' },
];

export class NavigationController {
  private screen: ScreenState = 'MAIN_MENU';
  private tutorialActive = false;
  private tutorialStepIndex = 0;
  private readonly overlay: HTMLElement;
  private readonly tutorialBanner: HTMLElement;
  private readonly editor: EditorController;

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
      menuBtn.textContent = 'Menu';
      menuBtn.addEventListener('click', () => this.setScreen('MAIN_MENU'));
      headerBrand.prepend(menuBtn);
    }

    this.bindTutorialEvents(app);
    this.render();
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
    this.tutorialBanner.innerHTML = `
      <div class="tutorial-card">
        <strong>${step.title}</strong>
        <span>${step.instruction}</span>
        <button type="button" id="skip-tutorial">Skip</button>
      </div>
    `;
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
      this.overlay.innerHTML = `
        <div class="menu-card">
          <p class="eyebrow">GITHUB GAME OFF 2026</p>
          <h2 class="menu-title">SHIFTWORKS</h2>
          <p class="menu-subtitle">Automation Puzzle Factory</p>
          <div class="menu-actions">
            <button type="button" id="menu-continue" class="btn-primary">Continue Campaign</button>
            <button type="button" id="menu-levels">Play Campaign (Level Select)</button>
            <button type="button" id="menu-tutorial">Tutorial (T00 · Basic Controls)</button>
            <button type="button" id="menu-sandbox">Sandbox Mode</button>
          </div>
        </div>
      `;
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
      const cards = LEVEL_CATALOG.map((level) => {
        const unlocked = isLevelUnlocked(level.id, completed);
        const isDone = completed.includes(level.id);
        const statusLabel = isDone ? 'COMPLETED' : unlocked ? 'UNLOCKED' : 'LOCKED';
        return `
          <div class="level-card" data-status="${statusLabel}">
            <div class="level-card-header">
              <strong>${level.id} · ${level.title}</strong>
              <span class="level-badge">${statusLabel}</span>
            </div>
            <p>${level.tutorial}</p>
            <button type="button" class="level-play-btn" data-level-id="${level.id}" ${unlocked ? '' : 'disabled'}>
              ${unlocked ? 'Play' : 'Locked'}
            </button>
          </div>
        `;
      }).join('');

      this.overlay.innerHTML = `
        <div class="menu-card menu-card-wide">
          <div class="level-select-header">
            <h2>Campaign · Level Select</h2>
            <button type="button" id="level-select-back">Back</button>
          </div>
          <div class="level-grid">${cards}</div>
        </div>
      `;
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
}
