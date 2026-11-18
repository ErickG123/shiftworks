import { calculateStarRating } from '../domain/level-scoring.model';
import { editSession, pauseSession, resetSession, resumeSession, startSession, createSimulationState } from '../domain/session.model';
import type { SimulationEvent, SimulationState } from '../domain/simulation.model';
import type { EditorController } from '../editor/editor-controller';
import type { SceneManager } from '../rendering/scene-manager';
import type { MachineVisualState } from '../rendering/component-view';
import { SoundEffects, soundCueForEvent } from '../audio/sound-effects';
import { ItemView } from '../rendering/item-view';
import { projectItems } from '../rendering/item-projection';
import { step } from './simulation-engine';
import { isGlobalShortcutAllowed } from '../interaction/keyboard-shortcuts';
import { i18n } from '../../i18n';

const TICK_INTERVAL_MS = 250;

export class SimulationController {
  private state: SimulationState | null = null;
  private intervalId: number | null = null;
  private readonly itemView: ItemView;
  private readonly startButton: HTMLButtonElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly resumeButton: HTMLButtonElement;
  private readonly editButton: HTMLButtonElement;
  private readonly resetButton: HTMLButtonElement;
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
  private readonly resultLevelTitle: HTMLOutputElement;
  private readonly resultStars: HTMLOutputElement;
  private readonly audio = new SoundEffects();
  private readonly audioToggle: HTMLButtonElement;
  private readonly audioVolume: HTMLInputElement;
  private readonly audioStatus: HTMLOutputElement;

  private readonly handleStart = (): void => this.start();
  private readonly handlePause = (): void => this.pause();
  private readonly handleResume = (): void => this.resume();
  private readonly handleEdit = (): void => this.edit();
  private readonly handleReset = (): void => this.reset();
  private readonly handleReplay = (): void => this.replay();
  private readonly handleNextLevel = (): void => this.nextLevel();
  private readonly handleAudioToggle = (): void => { void this.toggleAudio(); };
  private readonly handleAudioVolume = (): void => this.audio.setVolume(Number(this.audioVolume.value));
  private readonly handleKey = (event: KeyboardEvent): void => {
    if (event.code !== 'Space' || !isGlobalShortcutAllowed(event)) return;
    const mode = this.state?.mode ?? 'EDITING';
    if (mode === 'EDITING') this.start();
    else if (mode === 'RUNNING') this.pause();
    else if (mode === 'PAUSED') this.resume();
    else return;
    event.preventDefault();
  };

  constructor(private readonly sceneManager: SceneManager, private readonly editor: EditorController) {
    this.itemView = new ItemView(sceneManager.scene, editor.getLevel());
    this.startButton = document.querySelector<HTMLButtonElement>('#start-simulation')!;
    this.pauseButton = document.querySelector<HTMLButtonElement>('#pause-simulation')!;
    this.resumeButton = document.querySelector<HTMLButtonElement>('#resume-simulation')!;
    this.editButton = document.querySelector<HTMLButtonElement>('#edit-simulation')!;
    this.resetButton = document.querySelector<HTMLButtonElement>('#reset-simulation')!;
    this.tickOutput = document.querySelector<HTMLOutputElement>('#simulation-tick')!;
    this.messageOutput = document.querySelector<HTMLOutputElement>('#simulation-message')!;
    this.announcementOutput = document.querySelector<HTMLOutputElement>('#simulation-announcement')!;
    this.machineStatus = document.querySelector<HTMLOutputElement>('#machine-status')!;
    this.goalStatus = document.querySelector<HTMLOutputElement>('#goal-status')!;
    this.metricsOutput = document.querySelector<HTMLOutputElement>('#simulation-metrics')!;
    this.resultPanel = document.querySelector<HTMLElement>('#result-panel')!;
    this.resultSummary = document.querySelector<HTMLOutputElement>('#result-summary')!;
    this.replayButton = document.querySelector<HTMLButtonElement>('#replay-simulation')!;
    this.nextLevelButton = document.querySelector<HTMLButtonElement>('#next-level')!;
    this.resultLevelTitle = document.querySelector<HTMLOutputElement>('#result-level-title')!;
    this.resultStars = document.querySelector<HTMLOutputElement>('#result-stars')!;
    this.audioToggle = document.querySelector<HTMLButtonElement>('#audio-toggle')!;
    this.audioVolume = document.querySelector<HTMLInputElement>('#audio-volume')!;
    this.audioStatus = document.querySelector<HTMLOutputElement>('#audio-status')!;
    this.startButton.addEventListener('click', this.handleStart);
    this.pauseButton.addEventListener('click', this.handlePause);
    this.resumeButton.addEventListener('click', this.handleResume);
    this.editButton.addEventListener('click', this.handleEdit);
    this.resetButton.addEventListener('click', this.handleReset);
    this.replayButton.addEventListener('click', this.handleReplay);
    this.nextLevelButton.addEventListener('click', this.handleNextLevel);
    this.audioToggle.addEventListener('click', this.handleAudioToggle);
    this.audioVolume.addEventListener('input', this.handleAudioVolume);
    document.addEventListener('keydown', this.handleKey);
    this.editor.setScenarioChangeHandler(this.resetForScenario);
    this.resetForScenario();
    this.updateControls();
  }

  dispose(): void {
    this.stopTimer();
    this.itemView.dispose();
    this.startButton.removeEventListener('click', this.handleStart);
    this.pauseButton.removeEventListener('click', this.handlePause);
    this.resumeButton.removeEventListener('click', this.handleResume);
    this.editButton.removeEventListener('click', this.handleEdit);
    this.resetButton.removeEventListener('click', this.handleReset);
    this.replayButton.removeEventListener('click', this.handleReplay);
    this.nextLevelButton.removeEventListener('click', this.handleNextLevel);
    document.removeEventListener('keydown', this.handleKey);
    this.audioToggle.removeEventListener('click', this.handleAudioToggle);
    this.audioVolume.removeEventListener('input', this.handleAudioVolume);
    this.audio.dispose();
  }

  private start(): void {
    try {
      const initial = createSimulationState(this.editor.getLevel(), this.editor.getComponents());
      const result = startSession(initial);
      if (!result.ok) { this.messageOutput.textContent = i18n.t('simulation.cannotStart'); this.announce(this.messageOutput.textContent); return; }
      this.state = result.state;
      this.editor.setMode('RUNNING');
      this.startTimer();
      this.render();
      this.messageOutput.textContent = i18n.t('simulation.started');
      this.announce(i18n.t('simulation.startedShort'));
      this.updateControls();
    } catch (error) {
      this.messageOutput.textContent = error instanceof Error ? error.message : i18n.t('simulation.invalidLayout');
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
  }

  private edit(): void {
    if (!this.state) return;
    const result = editSession(this.state);
    if (!result.ok) return;
    this.stopTimer();
    this.state = result.state;
    this.editor.setMode('EDITING');
    this.render();
    this.messageOutput.textContent = i18n.t('simulation.editReset');
    this.announce(i18n.t('simulation.editResetShort'));
    this.updateControls();
  }

  private reset(): void {
    if (!this.state) return;
    this.stopTimer();
    this.state = resetSession(this.state);
    this.editor.setMode('EDITING');
    this.render();
    this.messageOutput.textContent = i18n.t('simulation.attemptReset');
    this.announce(i18n.t('simulation.attemptResetShort'));
    this.updateControls();
  }

  private replay(): void {
    if (!this.state || this.state.mode !== 'RESULT') return;
    const result = startSession(this.state);
    if (!result.ok) return;
    this.state = result.state;
    this.editor.setMode('RUNNING');
    this.startTimer();
    this.render();
    this.messageOutput.textContent = i18n.t('simulation.replayStarted');
    this.announce(i18n.t('simulation.replayStartedShort'));
    this.updateControls();
  }

  private nextLevel(): void {
    if (!this.state || this.state.mode !== 'RESULT' || !this.editor.getNextLevelId()) return;
    this.stopTimer();
    this.editor.setMode('EDITING');
    if (!this.editor.selectNextLevel()) return;
    this.state = null;
    this.itemView.render([]);
    this.goalStatus.textContent = this.editor.getLevel().goals.map((goal) => i18n.t('simulation.goalItemAt', { item: goal.itemType, output: goal.outputId, delivered: 0, quantity: goal.quantity })).join(' · ');
    this.tickOutput.textContent = i18n.t('simulation.tick', { count: 0 });
    this.metricsOutput.textContent = i18n.t('simulation.metricsFormat', { ticks: 0, delivered: 0, rejected: 0, shifts: 0, pieces: 0 });
    this.resultPanel.hidden = true;
    this.messageOutput.textContent = i18n.t('simulation.levelSelected', { id: this.editor.getLevel().id });
    this.announce(i18n.t('simulation.levelSelectedShort', { id: this.editor.getLevel().id }));
    this.updateControls();
    this.sceneManager.renderNow();
  }

  private readonly advanceTick = (): void => {
    if (!this.state || this.state.mode !== 'RUNNING') return;
    const result = step(this.state);
    this.state = result.state;
    const soundCue = [...result.events].reverse().map(soundCueForEvent).find((cue) => cue !== null) ?? null;
    this.audio.play(soundCue);
    this.render();
    this.tickOutput.textContent = i18n.t('simulation.tick', { count: this.state.tick });
    this.messageOutput.textContent = this.describeEvents(result.events);
    const announcement = this.describeImportantEvent(result.events);
    if (announcement) this.announce(announcement);
    if (this.state.mode === 'RESULT') {
      this.stopTimer();
      this.editor.setMode('RESULT');
      this.editor.markLevelComplete();
      this.messageOutput.textContent = i18n.t('simulation.allGoalsCompleted');
      this.announce(i18n.t('simulation.factoryCompleteShort'));
      this.updateControls();
    }
  };

  private render(): void {
    if (!this.state) return;
    this.itemView.render(projectItems(this.state), this.state.mode === 'RUNNING');
    this.syncMachineVisuals();
    this.renderMachineStatus();
    const delivered = Object.values(this.state.metrics.itemsDeliveredByOutput).reduce((sum, count) => sum + count, 0);
    const metrics = i18n.t('simulation.metricsFormat', {
      ticks: this.state.tick,
      delivered,
      rejected: this.state.metrics.rejectedCount,
      shifts: this.state.metrics.modeShiftCount,
      pieces: this.state.metrics.piecesUsed,
    });
    this.metricsOutput.textContent = metrics;
    this.resultSummary.textContent = metrics;
    this.resultPanel.hidden = this.state.mode !== 'RESULT';
    this.resultLevelTitle.textContent = `${this.editor.getLevel().id} · ${i18n.t(`levels.${this.editor.getLevel().id}.title`)}`;
    this.resultStars.textContent = this.state.mode === 'RESULT'
      ? i18n.t('simulation.starsFormat', { stars: calculateStarRating(this.editor.getLevel(), this.state) })
      : '';
    this.nextLevelButton.hidden = !this.editor.getNextLevelId();
    this.sceneManager.renderNow();
  }

  private renderMachineStatus(): void {
    if (!this.state) return;
    if (this.editor.isSandbox()) {
      const outputs = this.state.layout.components.filter((component) => component.type === 'OUTPUT');
      this.goalStatus.textContent = outputs.length
        ? i18n.t('simulation.outputCounts', {
            counts: outputs.map((output) => `${output.label} (${output.id}) ${this.state!.metrics.itemsDeliveredByOutput[output.id] ?? 0}`).join(' · '),
          })
        : i18n.t('simulation.noOutputs');
    } else {
      this.goalStatus.textContent = this.state.goals.length
        ? this.state.goals.map(({ goal, delivered }) => i18n.t('simulation.goalItemAt', { item: goal.itemType, output: goal.outputId, delivered, quantity: goal.quantity })).join(' · ')
        : i18n.t('simulation.noGoals');
    }
    const descriptions = this.state.processors.map((runtime) => {
      const component = this.state!.layout.components.find((candidate) => candidate.id === runtime.componentId);
      const blocked = this.state!.diagnostics.some((diagnostic) => diagnostic.componentId === runtime.componentId && diagnostic.reason !== 'RULE_MISSING');
      let status = runtime.phase[0] + runtime.phase.slice(1).toLowerCase();
      if (runtime.phase === 'SHIFTING') status = i18n.t('simulation.shiftingTo', { mode: runtime.targetMode ?? '', ticks: runtime.ticksRemaining });
      else if (runtime.phase === 'PROCESSING') status = i18n.t('simulation.processingTicks', { ticks: runtime.ticksRemaining });
      else if (runtime.phase === 'READY' && blocked) status = i18n.t('simulation.blockedOutput');
      else if (runtime.phase === 'READY') status = i18n.t('simulation.ready');
      else if (runtime.phase === 'RULE_MISSING') status = i18n.t('simulation.ruleMissing');
      return `${component?.id ?? runtime.componentId}: ${status}`;
    });
    for (const runtime of this.state.diverters) {
      const blocked = this.state.diagnostics.some((diagnostic) => diagnostic.componentId === runtime.componentId && diagnostic.reason !== 'RULE_MISSING');
      const status = runtime.itemId
        ? runtime.route
          ? blocked
            ? i18n.t('simulation.blockedRoute', { route: runtime.route })
            : i18n.t('simulation.routeLabel', { route: runtime.route })
          : i18n.t('simulation.ruleMissing')
        : i18n.t('simulation.idle');
      descriptions.push(`${runtime.componentId}: ${status}`);
    }
    this.machineStatus.textContent = descriptions.length ? descriptions.join(' · ') : i18n.t('simulation.machinesIdle');
  }

  private describeEvents(events: readonly SimulationEvent[]): string {
    const location = (componentId: string): string => {
      const component = this.state?.layout.components.find((candidate) => candidate.id === componentId);
      return component ? `${componentId} (${component.position.x}, ${component.position.y})` : componentId;
    };
    const event = events.at(-1);
    if (!event) {
      const diagnostic = this.state?.diagnostics.at(-1);
      return diagnostic ? `Waiting at ${location(diagnostic.componentId)}: ${diagnostic.reason.toLowerCase().replaceAll('_', ' ')}.` : 'Factory is running.';
    }
    switch (event.kind) {
      case 'ITEM_EMITTED': return `Source emitted ${event.item.type.toLowerCase().replaceAll('_', ' ')} (${event.item.id}).`;
      case 'ITEM_MOVED': return `Item moved from ${location(event.componentId)} to ${location(event.destinationId)}.`;
      case 'ROUTE_CHOSEN': return `${location(event.componentId)} routed ${event.itemId} to ${event.route}.`;
      case 'ITEM_DELIVERED': return `${event.itemType} delivered to ${event.goalOutputId}.`;
      case 'ITEM_REJECTED': return `${event.itemType} rejected by ${location(event.componentId)}: ${event.reason.toLowerCase().replaceAll('_', ' ')}.`;
      case 'GOAL_COMPLETED': return `${event.itemType} goal completed at ${event.outputId}.`;
      case 'BLOCKED': return `Waiting at ${location(event.componentId)}: ${event.reason.toLowerCase().replaceAll('_', ' ')}.`;
      default: return `Factory event: ${event.kind.toLowerCase().replaceAll('_', ' ')}.`;
    }
  }

  private describeImportantEvent(events: readonly SimulationEvent[]): string | null {
    const importantKinds = ['ITEM_REJECTED', 'ITEM_DELIVERED', 'GOAL_COMPLETED', 'MODE_SHIFT_STARTED', 'PROCESS_STARTED', 'PROCESS_COMPLETED', 'RULE_MISSING'];
    const important = [...events].reverse().find((event) => importantKinds.includes(event.kind));
    return important ? this.describeEvents([important]) : null;
  }

  private announce(message: string): void {
    this.announcementOutput.textContent = message;
  }

  refreshTranslations(): void {
    const enabled = this.audioToggle.getAttribute('aria-pressed') === 'true';
    this.audioToggle.textContent = enabled ? i18n.t('common.soundOn') : i18n.t('common.soundOff');
    if (this.state) {
      this.render();
      this.tickOutput.textContent = i18n.t('simulation.tick', { count: this.state.tick });
    } else {
      const level = this.editor.getLevel();
      const outputs = level.fixedComponents.filter((component) => component.type === 'OUTPUT');
      this.goalStatus.textContent = this.editor.isSandbox()
        ? i18n.t('simulation.outputCounts', {
            counts: outputs.map((output) => `${output.label} (${output.id}) 0`).join(' · '),
          })
        : level.goals.map((goal) => i18n.t('simulation.goalItemAt', { item: goal.itemType, output: goal.outputId, delivered: 0, quantity: goal.quantity })).join(' · ');
      this.tickOutput.textContent = i18n.t('simulation.tick', { count: 0 });
      this.metricsOutput.textContent = i18n.t('simulation.metricsFormat', { ticks: 0, delivered: 0, rejected: 0, shifts: 0, pieces: 0 });
      this.machineStatus.textContent = i18n.t('simulation.processorIdle');
      this.messageOutput.textContent = i18n.t('simulation.readyMessage');
    }
  }

  private async toggleAudio(): Promise<void> {
    const enabled = !this.audio.isEnabled();
    const available = await this.audio.setEnabled(enabled);
    this.audioToggle.setAttribute('aria-pressed', String(available && enabled));
    this.audioToggle.textContent = available && enabled ? i18n.t('common.soundOn') : i18n.t('common.soundOff');
    this.audioVolume.disabled = !available || !enabled;
    if (!enabled) this.audio.dispose();
    const message = available && enabled
      ? i18n.t('simulation.audioEnabled')
      : enabled ? i18n.t('simulation.audioUnavailable') : i18n.t('simulation.audioMuted');
    this.audioStatus.textContent = message;
    this.announce(message);
  }

  private startTimer(): void {
    this.stopTimer();
    this.intervalId = window.setInterval(this.advanceTick, TICK_INTERVAL_MS);
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
    this.editButton.disabled = mode === 'EDITING';
    this.resetButton.disabled = mode === 'EDITING';
    this.replayButton.disabled = mode !== 'RESULT';
    this.nextLevelButton.disabled = mode !== 'RESULT' || !this.editor.getNextLevelId();
    this.nextLevelButton.hidden = !this.editor.getNextLevelId();
    this.resultPanel.hidden = mode !== 'RESULT';
    this.tickOutput.textContent = `Tick ${this.state?.tick ?? 0}`;
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
        phase: machine.itemId ? 'PROCESSING' as const : 'IDLE' as const,
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
    this.itemView.render([]);
    const level = this.editor.getLevel();
    const outputs = level.fixedComponents.filter((component) => component.type === 'OUTPUT');
    this.goalStatus.textContent = this.editor.isSandbox()
      ? i18n.t('simulation.outputCounts', {
          counts: outputs.map((output) => `${output.label} (${output.id}) 0`).join(' · '),
        })
      : level.goals.map((goal) => i18n.t('simulation.goalItemAt', { item: goal.itemType, output: goal.outputId, delivered: 0, quantity: goal.quantity })).join(' · ');
    this.tickOutput.textContent = i18n.t('simulation.tick', { count: 0 });
    this.metricsOutput.textContent = i18n.t('simulation.metricsFormat', { ticks: 0, delivered: 0, rejected: 0, shifts: 0, pieces: 0 });
    this.machineStatus.textContent = i18n.t('simulation.processorIdle');
    this.resultSummary.textContent = '';
    this.resultPanel.hidden = true;
    this.messageOutput.textContent = i18n.t('simulation.levelSelected', { id: level.id });
    this.updateControls();
    this.sceneManager.renderNow();
  };
}
