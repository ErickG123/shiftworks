import { LEVEL_CATALOG, getLevel, type PlayableLevel } from '../domain/level-catalog.model';
import type { Component } from '../domain/component.model';
import { createSandboxEditorState, createSandboxLevel, isSourceSequenceMode, type SourceSequenceMode } from '../domain/sandbox-level.model';
import { GameStorageAdapter, type GameData, type GameModePreference } from '../persistence/storage-adapter';
import { completeLevel, isLevelUnlocked, nextUnlockedLevelId } from '../domain/level-progression.model';
import type { Direction, DiverterRule, EditableComponentType, ProcessorRule } from '../domain/component.model';
import { createEditorState, type EditorErrorCode, type EditorState } from '../domain/editor.model';
import type { GridCell } from '../domain/grid.model';
import { findPortConnections } from '../domain/ports.model';
import { reduceEditor, validatePlacement } from './editor-reducer';
import { getToolAvailability } from './tool-availability';
import { isGlobalShortcutAllowed } from '../interaction/keyboard-shortcuts';
import { ComponentView, type MachineVisualState } from '../rendering/component-view';
import type { SceneManager } from '../rendering/scene-manager';
import { i18n } from '../../i18n';

type Tool = 'SELECT' | 'REMOVE' | EditableComponentType;
function errorMessage(code: EditorErrorCode): string {
  return i18n.t(`editor.error.${code}`);
}

export class EditorController {
  private readonly storage = new GameStorageAdapter();
  private persisted: GameData = this.storage.load();
  private completedLevels: readonly string[] = this.persisted.completedLevelIds;
  private gameMode: GameModePreference = this.persisted.preferences.gameMode;
  private lastCampaignLevelId = this.persisted.preferences.levelId;
  private sandboxSourceMode: SourceSequenceMode = this.persisted.preferences.sourceSequenceMode;
  private level: PlayableLevel = this.gameMode === 'SANDBOX'
    ? createSandboxLevel(this.sandboxSourceMode)
    : (() => { const candidate = getLevel(this.lastCampaignLevelId); return candidate && isLevelUnlocked(candidate.id, this.completedLevels) ? candidate : LEVEL_CATALOG[0]!; })();
  private state: EditorState = this.gameMode === 'SANDBOX'
    ? createSandboxEditorState(this.level, this.level.referenceComponents)
    : createEditorState(this.level);
  private sandboxComponents: readonly Component[] | null = this.gameMode === 'SANDBOX' ? this.level.referenceComponents : null;
  private scenarioChangeHandler: () => void = () => undefined;
  private tool: Tool = 'SELECT';
  private direction: Direction = 'E';
  private selectedId: string | null = null;
  private hover: GridCell | null = null;
  private readonly view: ComponentView;
  private readonly status: HTMLOutputElement;
  private readonly placementStatus: HTMLOutputElement;
  private readonly inventory: HTMLElement;
  private readonly connections: HTMLElement;
  private readonly directionSelect: HTMLSelectElement;
  private readonly toolbar: HTMLElement;
  private readonly rulePanel: HTMLElement;
  private readonly blueRule: HTMLSelectElement;
  private readonly amberRule: HTMLSelectElement;
  private readonly saveRulesButton: HTMLButtonElement;
  private readonly diverterRulePanel: HTMLElement;
  private readonly cutRoute: HTMLSelectElement;
  private readonly pressedRoute: HTMLSelectElement;
  private readonly saveDiverterRulesButton: HTMLButtonElement;
  private readonly levelSelect: HTMLSelectElement;
  private readonly levelInstructions: HTMLElement;
  private readonly gameModeSelect: HTMLSelectElement;
  private readonly sandboxControls: HTMLElement;
  private readonly sandboxSourceSelect: HTMLSelectElement;
  private readonly clearSandboxButton: HTMLButtonElement;
  private readonly loadExampleButton: HTMLButtonElement;
  private readonly storageStatus: HTMLOutputElement;
  private readonly handleLevelChange = (): void => { this.selectLevel(this.levelSelect.value); };
  private readonly handleGameModeChange = (): void => { this.selectGameMode(this.gameModeSelect.value as GameModePreference); };
  private readonly handleSourceModeChange = (): void => {
    if (isSourceSequenceMode(this.sandboxSourceSelect.value)) this.setSandboxSourceMode(this.sandboxSourceSelect.value);
  };
  private readonly handleClearSandbox = (): void => { this.clearSandbox(); };
  private readonly handleLoadExample = (): void => { this.loadSandboxExample(); };
  private readonly handleKey = (event: KeyboardEvent): void => {
    if (!isGlobalShortcutAllowed(event)) return;
    if (event.key.toLowerCase() === 'r' && this.selectedId) { this.rotateSelected(); event.preventDefault(); }
    if (event.key === 'Escape' && this.tool !== 'SELECT') { this.setTool('SELECT'); this.announce(i18n.t('editor.toolCanceled')); event.preventDefault(); }
  };

  constructor(private readonly sceneManager: SceneManager) {
    this.view = new ComponentView(sceneManager.scene, this.level);
    this.status = document.querySelector<HTMLOutputElement>('#editor-feedback')!;
    this.placementStatus = document.querySelector<HTMLOutputElement>('#placement-feedback')!;
    this.inventory = document.querySelector<HTMLElement>('#inventory')!;
    this.connections = document.querySelector<HTMLElement>('#connections')!;
    this.directionSelect = document.querySelector<HTMLSelectElement>('#placement-direction')!;
    this.toolbar = document.querySelector<HTMLElement>('#editor-toolbar')!;
    this.rulePanel = document.querySelector<HTMLElement>('#processor-rule-panel')!;
    this.blueRule = document.querySelector<HTMLSelectElement>('#blue-rule-mode')!;
    this.amberRule = document.querySelector<HTMLSelectElement>('#amber-rule-mode')!;
    this.saveRulesButton = document.querySelector<HTMLButtonElement>('#save-processor-rules')!;
    this.diverterRulePanel = document.querySelector<HTMLElement>('#diverter-rule-panel')!;
    this.cutRoute = document.querySelector<HTMLSelectElement>('#cut-route')!;
    this.pressedRoute = document.querySelector<HTMLSelectElement>('#pressed-route')!;
    this.saveDiverterRulesButton = document.querySelector<HTMLButtonElement>('#save-diverter-rules')!;
    this.levelSelect = document.querySelector<HTMLSelectElement>('#level-select')!;
    this.levelInstructions = document.querySelector<HTMLElement>('#level-instructions')!;
    this.gameModeSelect = document.querySelector<HTMLSelectElement>('#game-mode-select')!;
    this.sandboxControls = document.querySelector<HTMLElement>('#sandbox-controls')!;
    this.sandboxSourceSelect = document.querySelector<HTMLSelectElement>('#sandbox-source-mode')!;
    this.clearSandboxButton = document.querySelector<HTMLButtonElement>('#clear-sandbox')!;
    this.loadExampleButton = document.querySelector<HTMLButtonElement>('#load-sandbox-example')!;
    this.storageStatus = document.querySelector<HTMLOutputElement>('#storage-status')!;
    this.toolbar.addEventListener('click', this.handleToolbarClick);
    this.saveRulesButton.addEventListener('click', this.saveProcessorRules);
    this.saveDiverterRulesButton.addEventListener('click', this.saveDiverterRules);
    this.levelSelect.addEventListener('change', this.handleLevelChange);
    this.gameModeSelect.addEventListener('change', this.handleGameModeChange);
    this.sandboxSourceSelect.addEventListener('change', this.handleSourceModeChange);
    this.clearSandboxButton.addEventListener('click', this.handleClearSandbox);
    this.loadExampleButton.addEventListener('click', this.handleLoadExample);
    this.directionSelect.addEventListener('change', () => { this.direction = this.directionSelect.value as Direction; this.refresh(); });
    document.addEventListener('keydown', this.handleKey);
    this.refreshLevelOptions();
    this.refreshModeControls();
    const originalHover = (sceneManager as unknown as { onCellHover?: (cell: GridCell | null) => void }).onCellHover;
    void originalHover;
    this.refresh();
  }

  onHover(cell: GridCell | null): void { this.hover = cell; this.refresh(); }
  getComponents() { return this.state.components; }
  getLevel(): PlayableLevel { return this.level; }
  getCompletedLevels(): readonly string[] { return this.completedLevels; }
  setGameMode(mode: 'CAMPAIGN' | 'SANDBOX'): void {
    this.gameModeSelect.value = mode;
    this.handleGameModeChange();
  }
  isSandbox(): boolean { return this.gameMode === 'SANDBOX'; }
  setScenarioChangeHandler(handler: () => void): void { this.scenarioChangeHandler = handler; }
  setMachineVisuals(states: readonly MachineVisualState[], running: boolean): void { this.view.setRuntimeStates(states, running); }
  animate(time: number): void { this.view.animate(time); }
  getNextLevelId(): string | null { return this.gameMode === 'CAMPAIGN' ? nextUnlockedLevelId(this.level.id, this.completedLevels) : null; }

  markLevelComplete(): void {
    this.completedLevels = completeLevel(this.completedLevels, this.level.id);
    this.persistPreferences();
    this.refreshLevelOptions();
  }

  selectNextLevel(): boolean {
    const nextId = this.getNextLevelId();
    return nextId ? this.selectLevel(nextId) : false;
  }

  setMode(mode: EditorState['mode']): boolean {
    const result = reduceEditor(this.state, { kind: 'SET_MODE', mode });
    if (!result.ok) return false;
    this.state = result.state;
    if (mode !== 'EDITING') this.tool = 'SELECT';
    this.toolbar.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset['tool'] === this.tool)));
    this.toolbar.querySelectorAll<HTMLButtonElement>('[data-tool], [data-action]').forEach((button) => { button.disabled = mode !== 'EDITING' || (button.dataset['action'] === 'rotate' && !this.selectedId); });
    this.directionSelect.disabled = mode !== 'EDITING';
    this.levelSelect.disabled = mode !== 'EDITING';
    this.gameModeSelect.disabled = mode !== 'EDITING';
    this.sandboxSourceSelect.disabled = mode !== 'EDITING';
    this.clearSandboxButton.disabled = mode !== 'EDITING';
    this.loadExampleButton.disabled = mode !== 'EDITING';
    this.blueRule.disabled = mode !== 'EDITING'; this.amberRule.disabled = mode !== 'EDITING'; this.saveRulesButton.disabled = mode !== 'EDITING';
    this.cutRoute.disabled = mode !== 'EDITING'; this.pressedRoute.disabled = mode !== 'EDITING'; this.saveDiverterRulesButton.disabled = mode !== 'EDITING';
    if (mode !== 'EDITING') this.status.textContent = mode === 'RUNNING' ? i18n.t('editor.runningLocked') : i18n.t('editor.pausedLocked');
    this.refresh();
    return true;
  }

  onClick(cell: GridCell): void {
    if (this.tool === 'SELECT') {
      const found = this.state.components.find((component) => component.position.x === cell.x && component.position.y === cell.y);
      this.selectedId = found?.id ?? null;
      this.status.textContent = found
        ? i18n.t('editor.componentSelected', { type: found.type, fixed: found.isFixed ? i18n.t('editor.fixedSuffix') : '' })
        : i18n.t('editor.cellSelected', { x: cell.x, y: cell.y });
      this.refresh(); return;
    }
    if (this.tool === 'REMOVE') {
      const found = this.state.components.find((component) => component.position.x === cell.x && component.position.y === cell.y);
      if (!found) { this.status.textContent = i18n.t('editor.noComponentInCell'); return; }
      this.apply({ kind: 'REMOVE', componentId: found.id }); this.selectedId = null; return;
    }
    this.apply({ kind: 'PLACE', componentType: this.tool, position: cell, direction: this.direction });
  }

  refreshTranslations(): void {
    this.sceneManager.resize();
    this.refreshLevelOptions();
    this.status.textContent = i18n.t('editor.defaultHint');
    this.storageStatus.textContent = i18n.t('editor.storageDefault');
    this.sceneManager.refreshSelectedCellLabel();
    this.refresh();
  }

  dispose(): void { this.view.dispose(); this.toolbar.removeEventListener('click', this.handleToolbarClick); this.saveRulesButton.removeEventListener('click', this.saveProcessorRules); this.saveDiverterRulesButton.removeEventListener('click', this.saveDiverterRules); this.levelSelect.removeEventListener('change', this.handleLevelChange); this.gameModeSelect.removeEventListener('change', this.handleGameModeChange); this.sandboxSourceSelect.removeEventListener('change', this.handleSourceModeChange); this.clearSandboxButton.removeEventListener('click', this.handleClearSandbox); this.loadExampleButton.removeEventListener('click', this.handleLoadExample); document.removeEventListener('keydown', this.handleKey); }

  selectLevel(levelId: string): boolean {
    const level = getLevel(levelId);
    if (this.gameMode !== 'CAMPAIGN' || this.state.mode !== 'EDITING' || !level || !isLevelUnlocked(level.id, this.completedLevels)) {
      this.levelSelect.value = this.level.id;
      return false;
    }
    this.level = level;
    this.gameMode = 'CAMPAIGN';
    this.lastCampaignLevelId = level.id;
    this.state = createEditorState(level);
    this.selectedId = null;
    this.hover = null;
    this.levelInstructions.textContent = i18n.t(`levels.${level.id}.tutorial`);
    this.status.textContent = `${level.id} · ${i18n.t(`levels.${level.id}.lesson`)}`;
    this.refreshLevelOptions();
    this.refreshModeControls();
    this.persistPreferences();
    this.refresh();
    this.scenarioChangeHandler();
    return true;
  }

  private selectGameMode(mode: GameModePreference): boolean {
    if (this.state.mode !== 'EDITING' || (mode !== 'CAMPAIGN' && mode !== 'SANDBOX')) return false;
    if (this.gameMode === 'SANDBOX') this.sandboxComponents = this.state.components;
    if (this.gameMode === 'CAMPAIGN') this.lastCampaignLevelId = this.level.id;
    this.gameMode = mode;
    if (mode === 'SANDBOX') {
      this.level = createSandboxLevel(this.sandboxSourceMode);
      const components = this.sandboxComponents ?? this.level.referenceComponents;
      this.state = createSandboxEditorState(this.level, components);
      this.sandboxComponents = components;
    } else {
      const previous = getLevel(this.lastCampaignLevelId);
      this.level = previous && isLevelUnlocked(previous.id, this.completedLevels) ? previous : LEVEL_CATALOG[0]!;
      this.lastCampaignLevelId = this.level.id;
      this.state = createEditorState(this.level);
      this.selectedId = null;
    }
    this.refreshLevelOptions();
    this.refreshModeControls();
    this.persistPreferences();
    this.refresh();
    this.scenarioChangeHandler();
    return true;
  }

  private clearSandbox(): void {
    if (!this.isSandbox() || this.state.mode !== 'EDITING') return;
    if (!window.confirm(i18n.t('editor.sandboxClearConfirm'))) return;
    this.state = createSandboxEditorState(this.level);
    this.sandboxComponents = this.state.components;
    this.selectedId = null;
    this.status.textContent = i18n.t('editor.sandboxCleared');
    this.refresh();
    this.scenarioChangeHandler();
  }

  private loadSandboxExample(): void {
    if (!this.isSandbox() || this.state.mode !== 'EDITING') return;
    this.state = createSandboxEditorState(this.level, this.level.referenceComponents);
    this.sandboxComponents = this.state.components;
    this.selectedId = null;
    this.status.textContent = i18n.t('editor.sandboxExampleLoaded');
    this.refresh();
    this.scenarioChangeHandler();
  }

  private setSandboxSourceMode(mode: SourceSequenceMode): void {
    if (!this.isSandbox() || this.state.mode !== 'EDITING') return;
    this.sandboxSourceMode = mode;
    this.level = createSandboxLevel(mode);
    this.state = Object.freeze({ ...this.state, components: Object.freeze(this.state.components.map((component) => {
      const replacement = this.level.fixedComponents.find((candidate) => candidate.id === component.id);
      return replacement?.type === 'SOURCE' ? replacement : component;
    })) });
    this.sandboxComponents = this.state.components;
    this.persistPreferences();
    this.refresh();
    this.scenarioChangeHandler();
  }

  private persistPreferences(): void {
    const saved = this.storage.save(Object.freeze({
      version: 1,
      completedLevelIds: this.completedLevels,
      preferences: Object.freeze({ gameMode: this.gameMode, levelId: this.lastCampaignLevelId, sourceSequenceMode: this.sandboxSourceMode }),
    }));
    this.persisted = this.storage.load();
    this.storageStatus.textContent = saved ? i18n.t('editor.storageSaved') : i18n.t('editor.storageSessionOnly');
  }

  private refreshModeControls(): void {
    this.gameModeSelect.value = this.gameMode;
    this.sandboxControls.hidden = !this.isSandbox();
    this.levelSelect.hidden = this.isSandbox();
    this.sandboxSourceSelect.value = this.sandboxSourceMode;
  }

  private refreshLevelOptions(): void {
    const options = LEVEL_CATALOG.map((level) => {
      const locked = !isLevelUnlocked(level.id, this.completedLevels);
      const option = new Option(
        `${level.id} · ${i18n.t(`levels.${level.id}.title`)}${locked ? i18n.t('common.lockedSuffix') : ''}`,
        level.id,
      );
      option.disabled = locked;
      return option;
    });
    this.levelSelect.replaceChildren(...options);
    this.levelSelect.value = this.level.id;
    this.levelInstructions.textContent = i18n.t(`levels.${this.level.id}.tutorial`);
  }

  private readonly handleToolbarClick = (event: Event): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-tool], [data-action]');
    if (!button) return;
    const value = button.dataset['tool'];
    if (value) {
      if (button.disabled) return;
      this.setTool(value as Tool);
      this.announce(i18n.t('editor.toolSelected', { tool: button.textContent?.trim() ?? value }));
    }
    if (button.dataset['action'] === 'rotate') this.rotateSelected();
    if (button.dataset['action'] === 'cancel') { this.setTool('SELECT'); this.announce(i18n.t('editor.toolCanceled')); }
  };

  private setTool(tool: Tool): void {
    this.tool = tool;
    this.selectedId = null;
    this.toolbar.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset['tool'] === tool)));
    this.refresh();
  }

  private rotateSelected(): void {
    if (!this.selectedId) { this.status.textContent = i18n.t('editor.selectBeforeRotate'); return; }
    this.apply({ kind: 'ROTATE', componentId: this.selectedId });
  }

  private readonly saveProcessorRules = (): void => {
    if (!this.selectedId) return;
    const rules: ProcessorRule[] = [];
    if (this.blueRule.value !== 'NONE') rules.push({ when: 'BLUE_BLANK', then: this.blueRule.value as ProcessorRule['then'] });
    if (this.amberRule.value !== 'NONE') rules.push({ when: 'AMBER_BLANK', then: this.amberRule.value as ProcessorRule['then'] });
    this.apply({ kind: 'SET_PROCESSOR_RULES', componentId: this.selectedId, rules });
  };

  private readonly saveDiverterRules = (): void => {
    if (!this.selectedId) return;
    const rules: DiverterRule[] = [];
    if (this.cutRoute.value !== 'NONE') rules.push({ when: 'CUT_PLATE', then: this.cutRoute.value as DiverterRule['then'] });
    if (this.pressedRoute.value !== 'NONE') rules.push({ when: 'PRESSED_BLOCK', then: this.pressedRoute.value as DiverterRule['then'] });
    this.apply({ kind: 'SET_DIVERTER_RULES', componentId: this.selectedId, rules });
  };

  private apply(command: Parameters<typeof reduceEditor>[1]): void {
    const result = reduceEditor(this.state, command);
    if (!result.ok) { this.status.textContent = errorMessage(result.error.code); return; }
    this.state = result.state;
    if (this.isSandbox()) this.sandboxComponents = this.state.components;
    this.status.textContent = command.kind === 'PLACE'
      ? i18n.t('editor.placedAt', { type: command.componentType, x: command.position.x, y: command.position.y })
      : command.kind === 'REMOVE'
        ? i18n.t('editor.removed')
        : command.kind === 'SET_PROCESSOR_RULES'
          ? i18n.t('editor.processorRulesSaved')
          : command.kind === 'SET_DIVERTER_RULES'
            ? i18n.t('editor.diverterRoutesSaved')
            : i18n.t('editor.rotated');
    this.refresh();
  }

  private refresh(): void {
    const levelBudget = this.isSandbox()
      ? { CONVEYOR: 99, PROCESSOR: 99, DIVERTER: 99 }
      : this.level.inventory;

    this.toolbar.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
      const toolKey = button.dataset['tool'] as Tool | undefined;
      if (!toolKey) return;
      const availability = getToolAvailability({
        tool: toolKey,
        editorMode: this.state.mode,
        unlimitedInventory: this.state.unlimitedInventory,
        inventory: this.state.inventory,
        levelBudget,
      });
      button.disabled = !availability.enabled;
      const baseLabel = button.textContent?.trim() ?? toolKey;
      const localizedReason = availability.reasonKey ? i18n.t(availability.reasonKey) : availability.reason;
      button.title = localizedReason ? `${baseLabel} — ${localizedReason}` : baseLabel;
      if (!availability.enabled && this.tool === toolKey) {
        this.tool = 'SELECT';
        this.toolbar.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((btn) =>
          btn.setAttribute('aria-pressed', String(btn.dataset['tool'] === 'SELECT')),
        );
      }
    });

    const placementError = this.tool !== 'SELECT' && this.tool !== 'REMOVE' && this.hover
      ? validatePlacement(this.state, this.tool, this.hover)
      : null;
    const ghost = this.tool !== 'SELECT' && this.tool !== 'REMOVE' && this.hover
      ? { type: this.tool, position: this.hover, direction: this.direction, valid: placementError === null }
      : null;
    this.view.render(this.state.components, ghost);
    this.sceneManager.renderNow();
    const inventoryItems = (Object.entries(this.state.inventory) as [EditableComponentType, number][]).map(
      ([type, count]) => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = type;
        const value = document.createElement('strong');
        value.textContent = this.state.unlimitedInventory ? i18n.t('editor.unlimited') : String(count);
        li.append(label, value);
        return li;
      },
    );
    this.inventory.replaceChildren(...inventoryItems);
    const links = findPortConnections(this.state.components);
    this.connections.textContent = links.length
      ? links.length === 1
        ? i18n.t('editor.connectionsSingle')
        : i18n.t('editor.connectionsPlural', { count: links.length })
      : i18n.t('editor.connectionsDefault');
    const selectedProcessor = this.state.components.find((component) => component.id === this.selectedId && component.type === 'PROCESSOR');
    const selectedDiverter = this.state.components.find((component) => component.id === this.selectedId && component.type === 'DIVERTER');
    this.rulePanel.hidden = !selectedProcessor;
    this.diverterRulePanel.hidden = !selectedDiverter;
    if (selectedProcessor?.type === 'PROCESSOR') {
      this.blueRule.value = selectedProcessor.rules.find((rule) => rule.when === 'BLUE_BLANK')?.then ?? 'NONE';
      this.amberRule.value = selectedProcessor.rules.find((rule) => rule.when === 'AMBER_BLANK')?.then ?? 'NONE';
    }
    if (selectedDiverter?.type === 'DIVERTER') {
      this.cutRoute.value = selectedDiverter.rules.find((rule) => rule.when === 'CUT_PLATE')?.then ?? 'NONE';
      this.pressedRoute.value = selectedDiverter.rules.find((rule) => rule.when === 'PRESSED_BLOCK')?.then ?? 'NONE';
    }
    const canRotate = this.state.components.some((component) => component.id === this.selectedId && !component.isFixed);
    const rotate = this.toolbar.querySelector<HTMLButtonElement>('[data-action="rotate"]'); if (rotate) rotate.disabled = this.state.mode !== 'EDITING' || !canRotate;
    delete this.placementStatus.dataset['valid'];
    if (!ghost) this.placementStatus.textContent = '';
    else {
      this.placementStatus.dataset['valid'] = String(ghost.valid);
      this.placementStatus.textContent = ghost.valid
        ? i18n.t('editor.previewValid', { x: ghost.position.x, y: ghost.position.y })
        : i18n.t('editor.previewBlocked', { reason: errorMessage(placementError!) });
    }
  }

  private announce(message: string): void { this.status.textContent = message; }
}
