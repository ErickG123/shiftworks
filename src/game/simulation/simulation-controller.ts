import {
  calculateStarRating,
  type LevelBestResult,
  type StarRating,
} from '../domain/level-scoring.model';
import { evaluateSimulationAchievements } from '../domain/achievements.model';
import {
  createSimulationState,
  editSession,
  pauseSession,
  resetSession,
  resumeSession,
  startSession,
} from '../domain/session.model';
import type { SimulationEvent, SimulationState } from '../domain/simulation.model';
import type { EditorController } from '../editor/editor-controller';
import type { SceneManager } from '../rendering/scene-manager';
import type { MachineVisualState } from '../rendering/component-view';
import { SoundEffects, soundCueForEvent } from '../audio/sound-effects';
import { ItemView } from '../rendering/item-view';
import { projectItems } from '../rendering/item-projection';
import { step } from './simulation-engine';
import {
  isGlobalShortcutAllowed,
  resolveShortcutAction,
} from '../interaction/keyboard-shortcuts';
import {
  formatComponentType,
  formatDiagnosticReason,
  formatItemType,
  formatMachineMode,
  formatOutputName,
  i18n,
} from '../../i18n';

const TICK_INTERVAL_MS = 250;

export type SimulationActionEvent =
  | Readonly<{ kind: 'SIMULATION_STARTED' }>
  | Readonly<{ kind: 'SIMULATION_PAUSED' }>
  | Readonly<{ kind: 'SIMULATION_RESUMED' }>
  | Readonly<{ kind: 'SIMULATION_EDITED' }>
  | Readonly<{ kind: 'SIMULATION_RESET' }>
  | Readonly<{ kind: 'SIMULATION_COMPLETED'; levelId: string; stars: StarRating }>;

export type SimulationNavigationCallbacks = Readonly<{
  onOpenLevelSelect?: () => void;
  onOpenMainMenu?: () => void;
}>;

export class SimulationController {
  private state: SimulationState | null = null;
  private intervalId: number | null = null;
  private speedMultiplier: 1 | 2 | 4 = 1;
  private lastCompletionRecord: Readonly<{
    isNewRecord: boolean;
    best: LevelBestResult;
  }> | null = null;
  private navigationCallbacks: SimulationNavigationCallbacks = {};
  private readonly actionListeners = new Set<(event: SimulationActionEvent) => void>();

  private readonly itemView: ItemView;
  private readonly modeBadge: HTMLElement | null;
  private readonly startButton: HTMLButtonElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly resumeButton: HTMLButtonElement;
  private readonly stepButton: HTMLButtonElement | null;
  private readonly speedSelect: HTMLSelectElement | null;
  private readonly editButton: HTMLButtonElement;
  private readonly resetButton: HTMLButtonElement;
  private readonly pausedBanner: HTMLElement | null;
  private readonly pausedResumeCta: HTMLButtonElement | null;
  private readonly pausedEditCta: HTMLButtonElement | null;
  private readonly tickOutput: HTMLOutputElement;
  private readonly messageOutput: HTMLOutputElement;
  private readonly announcementOutput: HTMLOutputElement;
  private readonly machineStatus: HTMLOutputElement;
  private readonly goalStatus: HTMLOutputElement;
  private readonly metricsOutput: HTMLOutputElement;
  private readonly resultPanel: HTMLElement;
  private readonly resultSummary: HTMLOutputElement;
  private readonly replayButton: HTMLButtonElement;
  private readonly nextLevelButton: HTMLButtonElement;
  private readonly resultEditButton: HTMLButtonElement | null;
  private readonly resultLevelSelectButton: HTMLButtonElement | null;
  private readonly resultMainMenuButton: HTMLButtonElement | null;
  private readonly resultLevelTitle: HTMLOutputElement;
  private readonly resultStars: HTMLOutputElement;
  private readonly resultStarsVisual: HTMLElement | null;
  private readonly resultRecordBadge: HTMLOutputElement | null;
  private readonly statCyclesValue: HTMLElement | null;
  private readonly statDeliveredValue: HTMLElement | null;
  private readonly statRejectedValue: HTMLElement | null;
  private readonly statShiftsValue: HTMLElement | null;
  private readonly statPiecesValue: HTMLElement | null;
  private readonly audio = new SoundEffects();
  private readonly audioToggle: HTMLButtonElement;
  private readonly audioVolume: HTMLInputElement;
  private readonly audioStatus: HTMLOutputElement;

  private readonly handleStart = (): void => this.start();
  private readonly handlePause = (): void => this.pause();
  private readonly handleResume = (): void => this.resume();
  private readonly handleStepOne = (): void => {
    this.advanceOneTick();
  };
  private readonly handleSpeedChange = (): void => {
    const value = Number(this.speedSelect?.value ?? 1);
    this.speedMultiplier = value === 2 ? 2 : value === 4 ? 4 : 1;
    if (this.state?.mode === 'RUNNING') {
      this.startTimer();
    }
  };
  private readonly handleEdit = (): void => this.edit();
  private readonly handleReset = (): void => this.reset();
  private readonly handleReplay = (): void => this.replay();
  private readonly handleNextLevel = (): void => this.nextLevel();
  private readonly handleResultLevelSelect = (): void => {
    this.ensureEditingMode();
    this.navigationCallbacks.onOpenLevelSelect?.();
  };
  private readonly handleResultMainMenu = (): void => {
    this.ensureEditingMode();
    this.navigationCallbacks.onOpenMainMenu?.();
  };
  private readonly handleAudioToggle = (): void => {
    void this.toggleAudio();
  };
  private readonly handleAudioVolume = (): void =>
    this.audio.setVolume(Number(this.audioVolume.value));

  private readonly handleKey = (event: KeyboardEvent): void => {
    if (this.state?.mode === 'RESULT' && event.key === 'Escape') {
      event.preventDefault();
      this.edit();
      this.startButton.focus();
      return;
    }

    if (!isGlobalShortcutAllowed(event)) return;
    const action = resolveShortcutAction(event);
    if (action !== 'TOGGLE_SIMULATION') return;

    const mode = this.state?.mode ?? 'EDITING';
    if (mode === 'EDITING') this.start();
    else if (mode === 'RUNNING') this.pause();
    else if (mode === 'PAUSED') this.resume();
    else return;
    event.preventDefault();
  };

  constructor(
    private readonly sceneManager: SceneManager,
    private readonly editor: EditorController,
  ) {
    this.itemView = new ItemView(sceneManager.scene, editor.getLevel());
    this.modeBadge = document.querySelector<HTMLElement>('#session-mode-badge');
    this.startButton = document.querySelector<HTMLButtonElement>('#start-simulation')!;
    this.pauseButton = document.querySelector<HTMLButtonElement>('#pause-simulation')!;
    this.resumeButton = document.querySelector<HTMLButtonElement>('#resume-simulation')!;
    this.stepButton = document.querySelector<HTMLButtonElement>('#step-simulation');
    this.speedSelect = document.querySelector<HTMLSelectElement>('#simulation-speed');
    this.editButton = document.querySelector<HTMLButtonElement>('#edit-simulation')!;
    this.resetButton = document.querySelector<HTMLButtonElement>('#reset-simulation')!;
    this.pausedBanner = document.querySelector<HTMLElement>('#paused-callout-banner');
    this.pausedResumeCta = document.querySelector<HTMLButtonElement>('#paused-resume-cta');
    this.pausedEditCta = document.querySelector<HTMLButtonElement>('#paused-edit-cta');
    this.tickOutput = document.querySelector<HTMLOutputElement>('#simulation-tick')!;
    this.messageOutput = document.querySelector<HTMLOutputElement>('#simulation-message')!;
    this.announcementOutput = document.querySelector<HTMLOutputElement>(
      '#simulation-announcement',
    )!;
    this.machineStatus = document.querySelector<HTMLOutputElement>('#machine-status')!;
    this.goalStatus = document.querySelector<HTMLOutputElement>('#goal-status')!;
    this.metricsOutput = document.querySelector<HTMLOutputElement>('#simulation-metrics')!;
    this.resultPanel = document.querySelector<HTMLElement>('#result-panel')!;
    this.resultSummary = document.querySelector<HTMLOutputElement>('#result-summary')!;
    this.replayButton = document.querySelector<HTMLButtonElement>('#replay-simulation')!;
    this.nextLevelButton = document.querySelector<HTMLButtonElement>('#next-level')!;
    this.resultEditButton =
      document.querySelector<HTMLButtonElement>('#result-edit-factory');
    this.resultLevelSelectButton =
      document.querySelector<HTMLButtonElement>('#result-level-select');
    this.resultMainMenuButton =
      document.querySelector<HTMLButtonElement>('#result-main-menu');
    this.resultLevelTitle =
      document.querySelector<HTMLOutputElement>('#result-level-title')!;
    this.resultStars = document.querySelector<HTMLOutputElement>('#result-stars')!;
    this.resultStarsVisual = document.querySelector<HTMLElement>('#result-stars-visual');
    this.resultRecordBadge =
      document.querySelector<HTMLOutputElement>('#result-record-badge');
    this.statCyclesValue = document.querySelector<HTMLElement>('#stat-cycles-value');
    this.statDeliveredValue = document.querySelector<HTMLElement>('#stat-delivered-value');
    this.statRejectedValue = document.querySelector<HTMLElement>('#stat-rejected-value');
    this.statShiftsValue = document.querySelector<HTMLElement>('#stat-shifts-value');
    this.statPiecesValue = document.querySelector<HTMLElement>('#stat-pieces-value');
    this.audioToggle = document.querySelector<HTMLButtonElement>('#audio-toggle')!;
    this.audioVolume = document.querySelector<HTMLInputElement>('#audio-volume')!;
    this.audioStatus = document.querySelector<HTMLOutputElement>('#audio-status')!;

    this.startButton.addEventListener('click', this.handleStart);
    this.pauseButton.addEventListener('click', this.handlePause);
    this.resumeButton.addEventListener('click', this.handleResume);
    this.stepButton?.addEventListener('click', this.handleStepOne);
    this.speedSelect?.addEventListener('change', this.handleSpeedChange);
    this.editButton.addEventListener('click', this.handleEdit);
    this.resetButton.addEventListener('click', this.handleReset);
    this.pausedResumeCta?.addEventListener('click', this.handleResume);
    this.pausedEditCta?.addEventListener('click', this.handleEdit);
    this.replayButton.addEventListener('click', this.handleReplay);
    this.nextLevelButton.addEventListener('click', this.handleNextLevel);
    this.resultEditButton?.addEventListener('click', this.handleEdit);
    this.resultLevelSelectButton?.addEventListener('click', this.handleResultLevelSelect);
    this.resultMainMenuButton?.addEventListener('click', this.handleResultMainMenu);
    this.audioToggle.addEventListener('click', this.handleAudioToggle);
    this.audioVolume.addEventListener('input', this.handleAudioVolume);
    document.addEventListener('keydown', this.handleKey);

    this.editor.setScenarioChangeHandler(this.resetForScenario);
    this.resetForScenario();
    this.updateControls();
  }

  onAction(listener: (event: SimulationActionEvent) => void): () => void {
    this.actionListeners.add(listener);
    return () => {
      this.actionListeners.delete(listener);
    };
  }

  setNavigationCallbacks(callbacks: SimulationNavigationCallbacks): void {
    this.navigationCallbacks = callbacks;
  }

  getMode(): SimulationState['mode'] {
    return this.state?.mode ?? 'EDITING';
  }

  ensureEditingMode(): void {
    this.stopTimer();
    if (this.state && this.state.mode !== 'EDITING') {
      this.state = resetSession(this.state);
    } else {
      this.state = null;
    }
    this.lastCompletionRecord = null;
    this.itemView.render([]);
    this.editor.setMode('EDITING');
    this.updateControls();
    this.sceneManager.renderNow();
  }

  dispose(): void {
    this.stopTimer();
    this.itemView.dispose();
    this.startButton.removeEventListener('click', this.handleStart);
    this.pauseButton.removeEventListener('click', this.handlePause);
    this.resumeButton.removeEventListener('click', this.handleResume);
    this.stepButton?.removeEventListener('click', this.handleStepOne);
    this.speedSelect?.removeEventListener('change', this.handleSpeedChange);
    this.editButton.removeEventListener('click', this.handleEdit);
    this.resetButton.removeEventListener('click', this.handleReset);
    this.pausedResumeCta?.removeEventListener('click', this.handleResume);
    this.pausedEditCta?.removeEventListener('click', this.handleEdit);
    this.replayButton.removeEventListener('click', this.handleReplay);
    this.nextLevelButton.removeEventListener('click', this.handleNextLevel);
    this.resultEditButton?.removeEventListener('click', this.handleEdit);
    this.resultLevelSelectButton?.removeEventListener(
      'click',
      this.handleResultLevelSelect,
    );
    this.resultMainMenuButton?.removeEventListener('click', this.handleResultMainMenu);
    document.removeEventListener('keydown', this.handleKey);
    this.audioToggle.removeEventListener('click', this.handleAudioToggle);
    this.audioVolume.removeEventListener('input', this.handleAudioVolume);
    this.audio.dispose();
    this.actionListeners.clear();
  }

  private start(): void {
    try {
      const initial = createSimulationState(
        this.editor.getLevel(),
        this.editor.getComponents(),
      );
      const result = startSession(initial);
      if (!result.ok) {
        this.messageOutput.textContent = i18n.t('simulation.cannotStart');
        this.announce(this.messageOutput.textContent);
        return;
      }
      this.lastCompletionRecord = null;
      this.state = result.state;
      this.editor.setMode('RUNNING');
      this.startTimer();
      this.render();
      this.messageOutput.textContent = i18n.t('simulation.started');
      this.announce(i18n.t('simulation.startedShort'));
      this.updateControls();
      this.emitAction({ kind: 'SIMULATION_STARTED' });
    } catch (error) {
      this.messageOutput.textContent =
        error instanceof Error ? error.message : i18n.t('simulation.invalidLayout');
      this.announce(this.messageOutput.textContent);
    }
  }

  private pause(): void {
    if (!this.state) return;
    const result = pauseSession(this.state);
    if (!result.ok) return;
    this.stopTimer();
    this.itemView.pause();
    this.state = result.state;
    this.editor.setMode('PAUSED');
    this.messageOutput.textContent = i18n.t('simulation.paused');
    this.announce(i18n.t('simulation.pausedShort'));
    this.updateControls();
    this.emitAction({ kind: 'SIMULATION_PAUSED' });
  }

  private resume(): void {
    if (!this.state) return;
    const result = resumeSession(this.state);
    if (!result.ok) return;
    this.state = result.state;
    this.editor.setMode('RUNNING');
    this.itemView.resume();
    this.startTimer();
    this.messageOutput.textContent = i18n.t('simulation.resumed');
    this.announce(i18n.t('simulation.resumed'));
    this.updateControls();
    this.emitAction({ kind: 'SIMULATION_RESUMED' });
  }

  private edit(): void {
    if (!this.state) {
      this.editor.setMode('EDITING');
      this.updateControls();
      return;
    }
    const result = editSession(this.state);
    if (!result.ok) return;
    this.stopTimer();
    this.lastCompletionRecord = null;
    this.state = result.state;
    this.editor.setMode('EDITING');
    this.render();
    this.messageOutput.textContent = i18n.t('simulation.editReset');
    this.announce(i18n.t('simulation.editResetShort'));
    this.updateControls();
    this.emitAction({ kind: 'SIMULATION_EDITED' });
  }

  private reset(): void {
    if (!this.state) return;
    this.stopTimer();
    this.lastCompletionRecord = null;
    this.state = resetSession(this.state);
    this.editor.setMode('EDITING');
    this.render();
    this.messageOutput.textContent = i18n.t('simulation.attemptReset');
    this.announce(i18n.t('simulation.attemptResetShort'));
    this.updateControls();
    this.emitAction({ kind: 'SIMULATION_RESET' });
  }

  private replay(): void {
    if (!this.state || this.state.mode !== 'RESULT') return;
    const result = startSession(this.state);
    if (!result.ok) return;
    this.lastCompletionRecord = null;
    this.state = result.state;
    this.editor.setMode('RUNNING');
    this.startTimer();
    this.render();
    this.messageOutput.textContent = i18n.t('simulation.replayStarted');
    this.announce(i18n.t('simulation.replayStartedShort'));
    this.updateControls();
    this.emitAction({ kind: 'SIMULATION_STARTED' });
  }

  private nextLevel(): void {
    if (!this.state || this.state.mode !== 'RESULT' || !this.editor.getNextLevelId()) {
      return;
    }
    this.stopTimer();
    this.lastCompletionRecord = null;
    this.editor.setMode('EDITING');
    if (!this.editor.selectNextLevel()) return;
    this.state = null;
    this.itemView.render([]);
    this.goalStatus.textContent = this.formatInitialGoals();
    this.tickOutput.textContent = i18n.t('simulation.tick', { count: 0 });
    this.metricsOutput.textContent = i18n.t('simulation.metricsFormat', {
      ticks: 0,
      delivered: 0,
      rejected: 0,
      shifts: 0,
      pieces: 0,
    });
    this.resultPanel.hidden = true;
    this.messageOutput.textContent = i18n.t('simulation.levelSelected', {
      id: this.editor.getLevel().id,
    });
    this.announce(
      i18n.t('simulation.levelSelectedShort', { id: this.editor.getLevel().id }),
    );
    this.updateControls();
    this.sceneManager.renderNow();
  }

  advanceOneTick(): boolean {
    if (!this.state || this.state.mode !== 'PAUSED') return false;
    const runningResult = resumeSession(this.state);
    if (!runningResult.ok) return false;
    const stepResult = step(runningResult.state);
    const nextState =
      stepResult.state.mode === 'RUNNING'
        ? Object.freeze({ ...stepResult.state, mode: 'PAUSED' as const })
        : stepResult.state;
    this.state = nextState;
    this.tickOutput.textContent = i18n.t('simulation.tick', { count: this.state.tick });
    this.messageOutput.textContent = this.describeEvents(stepResult.events);
    if (this.state.mode === 'RESULT') {
      this.handleVictoryReached();
      return true;
    }
    this.render();
    this.updateControls();
    return true;
  }

  private handleVictoryReached(): void {
    if (!this.state || this.state.mode !== 'RESULT') return;
    this.stopTimer();
    this.editor.setMode('RESULT');
    const stars = calculateStarRating(this.editor.getLevel(), this.state);
    const recordInfo = this.editor.recordLevelCompletion(
      stars,
      this.state.tick,
      this.state.metrics.piecesUsed,
    );
    const earned = evaluateSimulationAchievements(
      this.state,
      this.editor.getLevel().id,
      stars,
      this.editor.getUnlockedAchievements(),
    );
    this.editor.recordAchievements(earned);
    const deliveredByType: Record<string, number> = {};
    for (const goalProgress of this.state.goals) {
      if (goalProgress.delivered > 0) {
        deliveredByType[goalProgress.goal.itemType] =
          (deliveredByType[goalProgress.goal.itemType] ?? 0) + goalProgress.delivered;
      }
    }
    this.editor.recordCollectedItems(deliveredByType);
    this.lastCompletionRecord = {
      isNewRecord: recordInfo.isNewRecord,
      best: recordInfo.best,
    };
    this.render();
    this.messageOutput.textContent = i18n.t('simulation.allGoalsCompleted');
    this.announce(i18n.t('simulation.factoryCompleteShort'));
    this.updateControls();
    this.focusVictoryPrimaryAction();
    this.emitAction({
      kind: 'SIMULATION_COMPLETED',
      levelId: this.editor.getLevel().id,
      stars,
    });
  }

  private readonly advanceTick = (): void => {
    if (!this.state || this.state.mode !== 'RUNNING') return;
    const result = step(this.state);
    this.state = result.state;
    const soundCue =
      [...result.events]
        .reverse()
        .map(soundCueForEvent)
        .find((cue) => cue !== null) ?? null;
    this.audio.play(soundCue);
    this.tickOutput.textContent = i18n.t('simulation.tick', { count: this.state.tick });
    this.messageOutput.textContent = this.describeEvents(result.events);
    const announcement = this.describeImportantEvent(result.events);
    if (announcement) this.announce(announcement);

    if (this.state.mode === 'RESULT') {
      this.handleVictoryReached();
      return;
    }

    this.render();
  };

  private focusVictoryPrimaryAction(): void {
    if (!this.nextLevelButton.hidden && !this.nextLevelButton.disabled) {
      this.nextLevelButton.focus();
    } else if (!this.replayButton.disabled) {
      this.replayButton.focus();
    }
  }

  private render(): void {
    if (!this.state) return;
    this.itemView.render(projectItems(this.state), this.state.mode === 'RUNNING');
    this.syncMachineVisuals();
    this.renderMachineStatus();
    const delivered = Object.values(this.state.metrics.itemsDeliveredByOutput).reduce(
      (sum, count) => sum + count,
      0,
    );
    const metrics = i18n.t('simulation.metricsFormat', {
      ticks: this.state.tick,
      delivered,
      rejected: this.state.metrics.rejectedCount,
      shifts: this.state.metrics.modeShiftCount,
      pieces: this.state.metrics.piecesUsed,
    });
    this.metricsOutput.textContent = metrics;
    this.resultSummary.textContent = metrics;

    if (this.statCyclesValue) this.statCyclesValue.textContent = String(this.state.tick);
    if (this.statDeliveredValue) this.statDeliveredValue.textContent = String(delivered);
    if (this.statRejectedValue) {
      this.statRejectedValue.textContent = String(this.state.metrics.rejectedCount);
    }
    if (this.statShiftsValue) {
      this.statShiftsValue.textContent = String(this.state.metrics.modeShiftCount);
    }
    if (this.statPiecesValue) {
      this.statPiecesValue.textContent = String(this.state.metrics.piecesUsed);
    }

    const isResult = this.state.mode === 'RESULT';
    this.resultPanel.hidden = !isResult;
    const level = this.editor.getLevel();
    this.resultLevelTitle.textContent = `${level.id} · ${i18n.t(`levels.${level.id}.title`)}`;

    const stars = isResult ? calculateStarRating(level, this.state) : 0;
    this.resultStars.textContent = isResult
      ? i18n.t('simulation.starsFormat', { stars })
      : '';

    if (this.resultStarsVisual) {
      this.resultStarsVisual
        .querySelectorAll<SVGElement>('[data-star-index]')
        .forEach((starEl) => {
          const idx = Number(starEl.dataset['starIndex'] ?? 0);
          starEl.dataset['earned'] = String(isResult && idx <= stars);
        });
    }

    if (this.resultRecordBadge) {
      if (isResult) {
        const bestInfo = this.lastCompletionRecord?.best ?? this.editor.getBestResult(level.id);
        if (this.lastCompletionRecord?.isNewRecord) {
          this.resultRecordBadge.textContent = bestInfo
            ? `${i18n.t('result.newRecord')} (${i18n.t('result.bestRecord', {
                stars: bestInfo.stars,
                ticks: bestInfo.ticks,
                pieces: bestInfo.piecesUsed,
              })})`
            : i18n.t('result.newRecord');
        } else if (bestInfo) {
          this.resultRecordBadge.textContent = i18n.t('result.bestRecord', {
            stars: bestInfo.stars,
            ticks: bestInfo.ticks,
            pieces: bestInfo.piecesUsed,
          });
        } else {
          this.resultRecordBadge.textContent = '';
        }
      } else {
        this.resultRecordBadge.textContent = '';
      }
    }

    this.nextLevelButton.hidden = !this.editor.getNextLevelId();
    this.sceneManager.renderNow();
  }

  private formatInitialGoals(): string {
    const level = this.editor.getLevel();
    const outputs = level.fixedComponents.filter(
      (component) => component.type === 'OUTPUT',
    );
    if (this.editor.isSandbox()) {
      return i18n.t('simulation.outputCounts', {
        counts: outputs
          .map((output) => `${output.label} (${output.id}) 0`)
          .join(' · '),
      });
    }
    return level.goals.length
      ? level.goals
          .map((goal) =>
            i18n.t('simulation.goalItemAt', {
              item: formatItemType(goal.itemType),
              output: formatOutputName(goal.outputId),
              delivered: 0,
              quantity: goal.quantity,
            }),
          )
          .join(' · ')
      : i18n.t('simulation.noGoals');
  }

  private renderMachineStatus(): void {
    if (!this.state) return;
    if (this.editor.isSandbox()) {
      const outputs = this.state.layout.components.filter(
        (component) => component.type === 'OUTPUT',
      );
      this.goalStatus.textContent = outputs.length
        ? i18n.t('simulation.outputCounts', {
            counts: outputs
              .map(
                (output) =>
                  `${output.label} (${output.id}) ${this.state!.metrics.itemsDeliveredByOutput[output.id] ?? 0}`,
              )
              .join(' · '),
          })
        : i18n.t('simulation.noOutputs');
    } else {
      this.goalStatus.textContent = this.state.goals.length
        ? this.state.goals
            .map(({ goal, delivered }) =>
              i18n.t('simulation.goalItemAt', {
                item: formatItemType(goal.itemType),
                output: formatOutputName(goal.outputId),
                delivered,
                quantity: goal.quantity,
              }),
            )
            .join(' · ')
        : i18n.t('simulation.noGoals');
    }

    const descriptions = this.state.processors.map((runtime) => {
      const component = this.state!.layout.components.find(
        (candidate) => candidate.id === runtime.componentId,
      );
      const label = component
        ? `${formatComponentType(component.type)} (${component.position.x}, ${component.position.y})`
        : runtime.componentId;
      const blocked = this.state!.diagnostics.some(
        (diagnostic) =>
          diagnostic.componentId === runtime.componentId &&
          diagnostic.reason !== 'RULE_MISSING',
      );
      let status = i18n.t('simulation.idle');
      if (runtime.phase === 'SHIFTING') {
        status = i18n.t('simulation.shiftingTo', {
          mode: runtime.targetMode ? formatMachineMode(runtime.targetMode) : '',
          ticks: runtime.ticksRemaining,
        });
      } else if (runtime.phase === 'PROCESSING') {
        status = i18n.t('simulation.processingTicks', {
          ticks: runtime.ticksRemaining,
        });
      } else if (runtime.phase === 'READY' && blocked) {
        status = i18n.t('simulation.blockedOutput');
      } else if (runtime.phase === 'READY') {
        status = i18n.t('simulation.ready');
      } else if (runtime.phase === 'RULE_MISSING') {
        status = i18n.t('simulation.ruleMissing');
      }
      return `${label}: ${status}`;
    });

    for (const runtime of this.state.diverters) {
      const component = this.state.layout.components.find(
        (candidate) => candidate.id === runtime.componentId,
      );
      const label = component
        ? `${formatComponentType(component.type)} (${component.position.x}, ${component.position.y})`
        : runtime.componentId;
      const blocked = this.state.diagnostics.some(
        (diagnostic) =>
          diagnostic.componentId === runtime.componentId &&
          diagnostic.reason !== 'RULE_MISSING',
      );
      const status = runtime.itemId
        ? runtime.route
          ? blocked
            ? i18n.t('simulation.blockedRoute', { route: runtime.route })
            : i18n.t('simulation.routeLabel', { route: runtime.route })
          : i18n.t('simulation.ruleMissing')
        : i18n.t('simulation.idle');
      descriptions.push(`${label}: ${status}`);
    }

    this.machineStatus.textContent = descriptions.length
      ? descriptions.join(' · ')
      : i18n.t('simulation.machinesIdle');
  }

  private describeEvents(events: readonly SimulationEvent[]): string {
    const location = (componentId: string): string => {
      const component = this.state?.layout.components.find(
        (candidate) => candidate.id === componentId,
      );
      return component
        ? `${formatComponentType(component.type)} (${component.position.x}, ${component.position.y})`
        : componentId;
    };
    const event = events.at(-1);
    if (!event) {
      const diagnostic = this.state?.diagnostics.at(-1);
      return diagnostic
        ? i18n.t('simulation.waitingAt', {
            location: location(diagnostic.componentId),
            reason: formatDiagnosticReason(diagnostic.reason),
          })
        : i18n.t('simulation.running');
    }
    switch (event.kind) {
      case 'ITEM_EMITTED':
        return i18n.t('simulation.event.emitted', {
          item: formatItemType(event.item.type),
        });
      case 'ITEM_MOVED':
        return i18n.t('simulation.event.moved', {
          from: location(event.componentId),
          to: location(event.destinationId),
        });
      case 'ROUTE_CHOSEN':
        return i18n.t('simulation.event.routeChosen', {
          component: location(event.componentId),
          route: event.route,
        });
      case 'ITEM_DELIVERED':
        return i18n.t('simulation.event.delivered', {
          item: formatItemType(event.itemType),
          output: formatOutputName(event.goalOutputId),
        });
      case 'ITEM_REJECTED':
        return i18n.t('simulation.event.rejected', {
          item: formatItemType(event.itemType),
          component: location(event.componentId),
          reason: formatDiagnosticReason(event.reason),
        });
      case 'GOAL_COMPLETED':
        return i18n.t('simulation.event.goalCompleted', {
          item: formatItemType(event.itemType),
          output: formatOutputName(event.outputId),
        });
      case 'BLOCKED':
        return i18n.t('simulation.event.blocked', {
          component: location(event.componentId),
          reason: formatDiagnosticReason(event.reason),
        });
      case 'MODE_SHIFT_STARTED':
        return i18n.t('simulation.event.modeShiftStarted', {
          component: location(event.componentId),
          mode: formatMachineMode(event.mode),
        });
      case 'PROCESS_STARTED':
        return i18n.t('simulation.event.processStarted', {
          component: location(event.componentId),
        });
      case 'PROCESS_COMPLETED':
        return i18n.t('simulation.event.processCompleted', {
          component: location(event.componentId),
        });
      case 'RULE_MISSING':
        return i18n.t('simulation.event.ruleMissing', {
          component: location(event.componentId),
        });
      default:
        return i18n.t('simulation.event.generic', {
          kind: event.kind.toLowerCase().replaceAll('_', ' '),
        });
    }
  }

  private describeImportantEvent(events: readonly SimulationEvent[]): string | null {
    const importantKinds = [
      'ITEM_REJECTED',
      'ITEM_DELIVERED',
      'GOAL_COMPLETED',
      'MODE_SHIFT_STARTED',
      'PROCESS_STARTED',
      'PROCESS_COMPLETED',
      'RULE_MISSING',
    ];
    const important = [...events]
      .reverse()
      .find((event) => importantKinds.includes(event.kind));
    return important ? this.describeEvents([important]) : null;
  }

  private announce(message: string): void {
    this.announcementOutput.textContent = message;
  }

  refreshTranslations(): void {
    const enabled = this.audioToggle.getAttribute('aria-pressed') === 'true';
    this.audioToggle.textContent = enabled
      ? i18n.t('common.soundOn')
      : i18n.t('common.soundOff');
    if (this.state) {
      this.render();
      this.tickOutput.textContent = i18n.t('simulation.tick', {
        count: this.state.tick,
      });
    } else {
      this.goalStatus.textContent = this.formatInitialGoals();
      this.tickOutput.textContent = i18n.t('simulation.tick', { count: 0 });
      this.metricsOutput.textContent = i18n.t('simulation.metricsFormat', {
        ticks: 0,
        delivered: 0,
        rejected: 0,
        shifts: 0,
        pieces: 0,
      });
      this.machineStatus.textContent = i18n.t('simulation.processorIdle');
      this.messageOutput.textContent = i18n.t('simulation.readyMessage');
    }
    this.updateControls();
  }

  private async toggleAudio(): Promise<void> {
    const enabled = !this.audio.isEnabled();
    const available = await this.audio.setEnabled(enabled);
    this.audioToggle.setAttribute('aria-pressed', String(available && enabled));
    this.audioToggle.textContent =
      available && enabled ? i18n.t('common.soundOn') : i18n.t('common.soundOff');
    this.audioVolume.disabled = !available || !enabled;
    if (!enabled) this.audio.dispose();
    const message =
      available && enabled
        ? i18n.t('simulation.audioEnabled')
        : enabled
          ? i18n.t('simulation.audioUnavailable')
          : i18n.t('simulation.audioMuted');
    this.audioStatus.textContent = message;
    this.announce(message);
  }

  private startTimer(): void {
    this.stopTimer();
    const intervalMs = Math.max(40, Math.round(TICK_INTERVAL_MS / this.speedMultiplier));
    this.intervalId = window.setInterval(this.advanceTick, intervalMs);
  }

  private stopTimer(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private updateControls(): void {
    const mode = this.state?.mode ?? 'EDITING';
    this.startButton.disabled = mode !== 'EDITING';
    this.pauseButton.disabled = mode !== 'RUNNING';
    this.resumeButton.disabled = mode !== 'PAUSED';
    if (this.stepButton) {
      this.stepButton.disabled = mode !== 'PAUSED';
      this.stepButton.textContent = i18n.t('simulation.stepOne');
    }
    this.editButton.disabled = mode === 'EDITING';
    this.resetButton.disabled = mode === 'EDITING';
    this.replayButton.disabled = mode !== 'RESULT';
    this.nextLevelButton.disabled = mode !== 'RESULT' || !this.editor.getNextLevelId();
    this.nextLevelButton.hidden = !this.editor.getNextLevelId();
    this.resultPanel.hidden = mode !== 'RESULT';

    if (this.pausedBanner) {
      this.pausedBanner.hidden = mode !== 'PAUSED';
    }

    this.startButton.classList.toggle('btn-primary', mode === 'EDITING');
    this.pauseButton.classList.toggle('btn-primary', mode === 'RUNNING');
    this.editButton.classList.toggle('btn-primary', mode === 'PAUSED');

    if (this.modeBadge) {
      this.modeBadge.dataset['mode'] = mode;
      this.modeBadge.textContent = i18n.t(`editor.modeBadge.${mode}`);
    }

    this.tickOutput.textContent = i18n.t('simulation.tick', {
      count: this.state?.tick ?? 0,
    });
    this.syncMachineVisuals();
  }

  private syncMachineVisuals(): void {
    const states: MachineVisualState[] = [
      ...(this.state?.processors.map((machine) => ({
        componentId: machine.componentId,
        phase: machine.phase,
        mode: machine.mode,
        targetMode: machine.targetMode,
        route: null,
      })) ?? []),
      ...(this.state?.diverters.map((machine) => ({
        componentId: machine.componentId,
        phase: machine.itemId ? ('PROCESSING' as const) : ('IDLE' as const),
        mode: 'CUT' as const,
        targetMode: null,
        route: machine.route,
      })) ?? []),
    ];
    this.editor.setMachineVisuals(states, this.state?.mode === 'RUNNING');
  }

  private readonly resetForScenario = (): void => {
    this.stopTimer();
    this.state = null;
    this.lastCompletionRecord = null;
    this.itemView.render([]);
    const level = this.editor.getLevel();
    this.goalStatus.textContent = this.formatInitialGoals();
    this.tickOutput.textContent = i18n.t('simulation.tick', { count: 0 });
    this.metricsOutput.textContent = i18n.t('simulation.metricsFormat', {
      ticks: 0,
      delivered: 0,
      rejected: 0,
      shifts: 0,
      pieces: 0,
    });
    this.machineStatus.textContent = i18n.t('simulation.processorIdle');
    this.resultSummary.textContent = '';
    this.resultPanel.hidden = true;
    this.messageOutput.textContent = i18n.t('simulation.levelSelected', {
      id: level.id,
    });
    this.updateControls();
    this.sceneManager.renderNow();
  };

  private emitAction(event: SimulationActionEvent): void {
    this.actionListeners.forEach((listener) => listener(event));
  }
}
