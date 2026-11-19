import {
  LEVEL_CATALOG,
  getLevel,
  type PlayableLevel,
} from '../domain/level-catalog.model';
import type {
  Component,
  Direction,
  DiverterRule,
  EditableComponent,
  EditableComponentType,
  ProcessorRule,
} from '../domain/component.model';
import {
  createSandboxEditorState,
  createSandboxLevel,
  isSourceSequenceMode,
  type SourceSequenceMode,
} from '../domain/sandbox-level.model';
import {
  GameStorageAdapter,
  type GameData,
  type GameModePreference,
} from '../persistence/storage-adapter';
import {
  completeLevel,
  isLevelUnlocked,
  nextUnlockedLevelId,
} from '../domain/level-progression.model';
import {
  isBetterLevelResult,
  type LevelBestResult,
  type StarRating,
} from '../domain/level-scoring.model';
import {
  createEmptyHistory,
  pushHistoryTransaction,
  redoHistory,
  undoHistory,
  type AchievementId,
  type EditorHistoryState,
} from '../domain/expansion-contracts.model';
import { mergeAchievements } from '../domain/achievements.model';
import {
  createEditorState,
  type EditorErrorCode,
  type EditorState,
} from '../domain/editor.model';
import type { GridCell } from '../domain/grid.model';
import { findPortConnections } from '../domain/ports.model';
import { reduceEditor, validatePlacement } from './editor-reducer';
import { getToolAvailability } from './tool-availability';
import {
  isGlobalShortcutAllowed,
  resolveShortcutAction,
} from '../interaction/keyboard-shortcuts';
import { ComponentView, type MachineVisualState } from '../rendering/component-view';
import type { SceneManager } from '../rendering/scene-manager';
import {
  formatComponentType,
  formatDirection,
  i18n,
} from '../../i18n';

export type Tool = 'SELECT' | 'REMOVE' | EditableComponentType;

export type EditorActionEvent =
  | Readonly<{ kind: 'TOOL_SELECTED'; tool: Tool }>
  | Readonly<{ kind: 'GHOST_ROTATED'; tool: EditableComponentType; direction: Direction }>
  | Readonly<{ kind: 'COMPONENT_PLACED'; component: EditableComponent }>
  | Readonly<{ kind: 'COMPONENT_ROTATED'; component: EditableComponent }>
  | Readonly<{ kind: 'COMPONENT_REMOVED'; componentId: string }>
  | Readonly<{ kind: 'COMPONENT_SELECTED'; component: Component | null }>;

const DIRECTIONS: readonly Direction[] = ['N', 'E', 'S', 'W'];

function nextClockwiseDirection(direction: Direction): Direction {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 1) % DIRECTIONS.length]!;
}

function isBuildTool(tool: Tool): tool is EditableComponentType {
  return tool === 'CONVEYOR' || tool === 'PROCESSOR' || tool === 'DIVERTER';
}

function errorMessage(code: EditorErrorCode): string {
  return i18n.t(`editor.error.${code}`);
}

export class EditorController {
  private readonly storage = new GameStorageAdapter();
  private persisted: GameData = this.storage.load();
  private completedLevels: readonly string[] = this.persisted.completedLevelIds;
  private bestResultsByLevel: Readonly<Record<string, LevelBestResult>> =
    this.persisted.bestResultsByLevel ?? Object.freeze({});
  private unlockedAchievements: readonly AchievementId[] =
    this.persisted.unlockedAchievements ?? Object.freeze([]);
  private collectedItemsByType: Readonly<Record<string, number>> =
    this.persisted.collectedItemsByType ?? Object.freeze({});
  private history: EditorHistoryState = createEmptyHistory(40);
  private transactionCounter = 0;
  private equipmentPreviewHandler: ((type: Component['type'], invoker?: HTMLElement | null) => void) | null = null;
  private gameMode: GameModePreference = this.persisted.preferences.gameMode;
  private lastCampaignLevelId = this.persisted.preferences.levelId;
  private sandboxSourceMode: SourceSequenceMode =
    this.persisted.preferences.sourceSequenceMode;
  private level: PlayableLevel =
    this.gameMode === 'SANDBOX'
      ? createSandboxLevel(this.sandboxSourceMode)
      : (() => {
          const candidate = getLevel(this.lastCampaignLevelId);
          return candidate && isLevelUnlocked(candidate.id, this.completedLevels)
            ? candidate
            : LEVEL_CATALOG[0]!;
        })();
  private state: EditorState =
    this.gameMode === 'SANDBOX'
      ? createSandboxEditorState(this.level, this.level.referenceComponents)
      : createEditorState(this.level);
  private sandboxComponents: readonly Component[] | null =
    this.gameMode === 'SANDBOX' ? this.level.referenceComponents : null;
  private scenarioChangeHandler: () => void = () => undefined;
  private readonly actionListeners = new Set<(event: EditorActionEvent) => void>();
  private tool: Tool = 'SELECT';
  private direction: Direction = 'E';
  private selectedId: string | null = null;
  private hover: GridCell | null = null;
  private readonly view: ComponentView;
  private readonly status: HTMLOutputElement;
  private readonly placementStatus: HTMLOutputElement;
  private readonly targetModeBanner: HTMLElement | null;
  private readonly selectedComponentDetails: HTMLElement | null;
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

  private readonly handleLevelChange = (): void => {
    this.selectLevel(this.levelSelect.value);
  };
  private readonly handleGameModeChange = (): void => {
    this.selectGameMode(this.gameModeSelect.value as GameModePreference);
  };
  private readonly handleSourceModeChange = (): void => {
    if (isSourceSequenceMode(this.sandboxSourceSelect.value)) {
      this.setSandboxSourceMode(this.sandboxSourceSelect.value);
    }
  };
  private readonly handleClearSandbox = (): void => {
    this.clearSandbox();
  };
  private readonly handleLoadExample = (): void => {
    this.loadSandboxExample();
  };
  private readonly handleDirectionChange = (): void => {
    const nextDir = this.directionSelect.value as Direction;
    if (DIRECTIONS.includes(nextDir)) {
      this.direction = nextDir;
      if (isBuildTool(this.tool)) {
        this.emitAction({
          kind: 'GHOST_ROTATED',
          tool: this.tool,
          direction: this.direction,
        });
      }
      this.refresh();
    }
  };
  private readonly handleKey = (event: KeyboardEvent): void => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.repeat && this.state.mode === 'EDITING') {
      const lower = event.key.toLowerCase();
      if (lower === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.undo();
        return;
      }
      if (lower === 'y' || (lower === 'z' && event.shiftKey)) {
        event.preventDefault();
        this.redo();
        return;
      }
    }
    if (!isGlobalShortcutAllowed(event)) return;
    const action = resolveShortcutAction(event);
    if (action === 'ROTATE_PIECE') {
      event.preventDefault();
      this.rotateActiveOrSelected();
      return;
    }
    if (action === 'CANCEL_TOOL') {
      if (this.tool !== 'SELECT' || this.selectedId !== null) {
        this.selectedId = null;
        this.setTool('SELECT');
        this.announce(i18n.t('editor.toolCanceled'));
        event.preventDefault();
      }
    }
  };

  constructor(private readonly sceneManager: SceneManager) {
    this.view = new ComponentView(sceneManager.scene, this.level);
    this.status = document.querySelector<HTMLOutputElement>('#editor-feedback')!;
    this.placementStatus = document.querySelector<HTMLOutputElement>('#placement-feedback')!;
    this.targetModeBanner = document.querySelector<HTMLElement>('#editor-target-mode');
    this.selectedComponentDetails = document.querySelector<HTMLElement>(
      '#selected-component-details',
    );
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
    this.saveDiverterRulesButton =
      document.querySelector<HTMLButtonElement>('#save-diverter-rules')!;
    this.levelSelect = document.querySelector<HTMLSelectElement>('#level-select')!;
    this.levelInstructions = document.querySelector<HTMLElement>('#level-instructions')!;
    this.gameModeSelect = document.querySelector<HTMLSelectElement>('#game-mode-select')!;
    this.sandboxControls = document.querySelector<HTMLElement>('#sandbox-controls')!;
    this.sandboxSourceSelect =
      document.querySelector<HTMLSelectElement>('#sandbox-source-mode')!;
    this.clearSandboxButton = document.querySelector<HTMLButtonElement>('#clear-sandbox')!;
    this.loadExampleButton =
      document.querySelector<HTMLButtonElement>('#load-sandbox-example')!;
    this.storageStatus = document.querySelector<HTMLOutputElement>('#storage-status')!;

    this.toolbar.addEventListener('click', this.handleToolbarClick);
    this.saveRulesButton.addEventListener('click', this.saveProcessorRules);
    this.saveDiverterRulesButton.addEventListener('click', this.saveDiverterRules);
    this.levelSelect.addEventListener('change', this.handleLevelChange);
    this.gameModeSelect.addEventListener('change', this.handleGameModeChange);
    this.sandboxSourceSelect.addEventListener('change', this.handleSourceModeChange);
    this.clearSandboxButton.addEventListener('click', this.handleClearSandbox);
    this.loadExampleButton.addEventListener('click', this.handleLoadExample);
    this.directionSelect.addEventListener('change', this.handleDirectionChange);
    document.addEventListener('keydown', this.handleKey);

    this.refreshLevelOptions();
    this.refreshModeControls();
    this.refresh();
  }

  onAction(listener: (event: EditorActionEvent) => void): () => void {
    this.actionListeners.add(listener);
    return () => {
      this.actionListeners.delete(listener);
    };
  }

  onHover(cell: GridCell | null): void {
    this.hover = cell;
    this.refresh();
  }

  getComponents(): readonly Component[] {
    return this.state.components;
  }

  getState(): EditorState {
    return this.state;
  }

  getTool(): Tool {
    return this.tool;
  }

  getPlacementDirection(): Direction {
    return this.direction;
  }

  getSelectedComponentId(): string | null {
    return this.selectedId;
  }

  getLevel(): PlayableLevel {
    return this.level;
  }

  getCompletedLevels(): readonly string[] {
    return this.completedLevels;
  }

  getBestResult(levelId: string): LevelBestResult | undefined {
    return this.bestResultsByLevel[levelId];
  }

  getUnlockedAchievements(): readonly AchievementId[] {
    return this.unlockedAchievements;
  }

  getCollectedItems(): Readonly<Record<string, number>> {
    return this.collectedItemsByType;
  }

  recordCollectedItems(deliveredByType: Readonly<Record<string, number>>): void {
    const next: Record<string, number> = { ...this.collectedItemsByType };
    let changed = false;
    for (const [itemType, qty] of Object.entries(deliveredByType)) {
      if (qty > 0) {
        next[itemType] = (next[itemType] ?? 0) + qty;
        changed = true;
      }
    }
    if (changed) {
      this.collectedItemsByType = Object.freeze(next);
      this.persistPreferences();
    }
  }

  openEquipmentPreview(type: Component['type'], invoker?: HTMLElement | null): void {
    this.equipmentPreviewHandler?.(type, invoker);
  }

  recordAchievements(newlyEarned: readonly AchievementId[]): readonly AchievementId[] {
    if (newlyEarned.length === 0) return [];
    const beforeCount = this.unlockedAchievements.length;
    this.unlockedAchievements = mergeAchievements(this.unlockedAchievements, newlyEarned);
    if (this.unlockedAchievements.length > beforeCount) {
      this.persistPreferences();
    }
    return newlyEarned;
  }

  setEquipmentPreviewHandler(
    handler: (type: Component['type'], invoker?: HTMLElement | null) => void,
  ): void {
    this.equipmentPreviewHandler = handler;
  }

  undo(): boolean {
    if (this.state.mode !== 'EDITING') return false;
    const result = undoHistory(this.history);
    if (!result.restored) return false;
    this.history = result.history;
    this.state = result.restored;
    if (this.isSandbox()) this.sandboxComponents = this.state.components;
    this.selectedId = null;
    this.status.textContent = i18n.t('editor.undone');
    this.refresh();
    return true;
  }

  redo(): boolean {
    if (this.state.mode !== 'EDITING') return false;
    const result = redoHistory(this.history);
    if (!result.restored) return false;
    this.history = result.history;
    this.state = result.restored;
    if (this.isSandbox()) this.sandboxComponents = this.state.components;
    this.selectedId = null;
    this.status.textContent = i18n.t('editor.redone');
    this.refresh();
    return true;
  }

  setGameMode(mode: 'CAMPAIGN' | 'SANDBOX'): void {
    if (this.state.mode !== 'EDITING') {
      this.setMode('EDITING');
    }
    this.gameModeSelect.value = mode;
    this.selectGameMode(mode);
  }

  isSandbox(): boolean {
    return this.gameMode === 'SANDBOX';
  }

  setScenarioChangeHandler(handler: () => void): void {
    this.scenarioChangeHandler = handler;
  }

  setMachineVisuals(states: readonly MachineVisualState[], running: boolean): void {
    this.view.setRuntimeStates(states, running);
  }

  animate(time: number): void {
    this.view.animate(time);
  }

  getNextLevelId(): string | null {
    return this.gameMode === 'CAMPAIGN'
      ? nextUnlockedLevelId(this.level.id, this.completedLevels)
      : null;
  }

  markLevelComplete(): void {
    this.completedLevels = completeLevel(this.completedLevels, this.level.id);
    this.persistPreferences();
    this.refreshLevelOptions();
  }

  recordLevelCompletion(
    stars: StarRating,
    ticks: number,
    piecesUsed: number,
  ): Readonly<{
    isNewRecord: boolean;
    best: LevelBestResult;
    previousBest: LevelBestResult | undefined;
  }> {
    this.completedLevels = completeLevel(this.completedLevels, this.level.id);
    const previousBest = this.bestResultsByLevel[this.level.id];
    const candidate: LevelBestResult = Object.freeze({ stars, ticks, piecesUsed });
    const isNewRecord = isBetterLevelResult(candidate, previousBest);
    const best = isNewRecord ? candidate : (previousBest ?? candidate);
    if (isNewRecord) {
      this.bestResultsByLevel = Object.freeze({
        ...this.bestResultsByLevel,
        [this.level.id]: best,
      });
    }
    this.persistPreferences();
    this.refreshLevelOptions();
    return Object.freeze({ isNewRecord, best, previousBest });
  }

  selectNextLevel(): boolean {
    const nextId = this.getNextLevelId();
    return nextId ? this.selectLevel(nextId, { forceEditMode: true }) : false;
  }

  setMode(mode: EditorState['mode']): boolean {
    const result = reduceEditor(this.state, { kind: 'SET_MODE', mode });
    if (!result.ok) return false;
    this.state = result.state;
    if (mode !== 'EDITING') {
      this.tool = 'SELECT';
    }
    this.toolbar
      .querySelectorAll<HTMLButtonElement>('[data-tool]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset['tool'] === this.tool)),
      );

    const isEditing = mode === 'EDITING';
    this.directionSelect.disabled = !isEditing;
    this.levelSelect.disabled = !isEditing;
    this.gameModeSelect.disabled = !isEditing;
    this.sandboxSourceSelect.disabled = !isEditing;
    this.clearSandboxButton.disabled = !isEditing;
    this.loadExampleButton.disabled = !isEditing;
    this.blueRule.disabled = !isEditing;
    this.amberRule.disabled = !isEditing;
    this.saveRulesButton.disabled = !isEditing;
    this.cutRoute.disabled = !isEditing;
    this.pressedRoute.disabled = !isEditing;
    this.saveDiverterRulesButton.disabled = !isEditing;

    const cancelBtn = this.toolbar.querySelector<HTMLButtonElement>('[data-action="cancel"]');
    if (cancelBtn) cancelBtn.disabled = !isEditing;

    if (!isEditing) {
      this.status.textContent =
        mode === 'RUNNING'
          ? i18n.t('editor.runningLocked')
          : i18n.t('editor.pausedLocked');
    }
    this.refresh();
    return true;
  }

  onClick(cell: GridCell): void {
    if (this.state.mode !== 'EDITING') {
      // In PAUSED or RUNNING, clicking inspects the cell/component in read-only mode
      const found =
        this.state.components.find(
          (component) =>
            component.position.x === cell.x && component.position.y === cell.y,
        ) ?? null;
      this.selectedId = found?.id ?? null;
      this.status.textContent = found
        ? i18n.t('editor.componentInspected', {
            type: formatComponentType(found.type),
            fixed: found.isFixed ? i18n.t('editor.fixedSuffix') : '',
            x: found.position.x,
            y: found.position.y,
            direction: formatDirection(found.direction),
          })
        : i18n.t('editor.cellSelected', { x: cell.x, y: cell.y });
      this.emitAction({ kind: 'COMPONENT_SELECTED', component: found });
      this.refresh();
      return;
    }

    if (this.tool === 'SELECT') {
      const found =
        this.state.components.find(
          (component) =>
            component.position.x === cell.x && component.position.y === cell.y,
        ) ?? null;
      this.selectedId = found?.id ?? null;
      if (found) {
        this.direction = found.direction;
        this.directionSelect.value = found.direction;
      }
      this.status.textContent = found
        ? i18n.t('editor.componentSelected', {
            type: formatComponentType(found.type),
            fixed: found.isFixed ? i18n.t('editor.fixedSuffix') : '',
            direction: formatDirection(found.direction),
          })
        : i18n.t('editor.cellSelected', { x: cell.x, y: cell.y });
      this.emitAction({ kind: 'COMPONENT_SELECTED', component: found });
      this.refresh();
      return;
    }

    if (this.tool === 'REMOVE') {
      const found = this.state.components.find(
        (component) =>
          component.position.x === cell.x && component.position.y === cell.y,
      );
      if (!found) {
        this.status.textContent = i18n.t('editor.noComponentInCell');
        return;
      }
      this.apply({ kind: 'REMOVE', componentId: found.id });
      this.selectedId = null;
      return;
    }

    this.apply({
      kind: 'PLACE',
      componentType: this.tool,
      position: cell,
      direction: this.direction,
    });
  }

  /**
   * Handles R shortcut and Rotate toolbar button in EDITING mode:
   * 1. If an existing editable component is selected (`this.selectedId`), rotates it clockwise.
   * 2. If a build tool is active:
   *    - If hovering an existing editable component on the board (e.g. just placed at `this.hover`),
   *      rotates that placed component AND updates ghost direction `this.direction`.
   *    - Otherwise rotates the ghost placement direction `this.direction` (`N -> E -> S -> W -> N`).
   * 3. If no piece or build tool is active, shows helpful guidance without rotating any arbitrary object.
   */
  rotateActiveOrSelected(): boolean {
    if (this.state.mode !== 'EDITING') {
      this.status.textContent = errorMessage('NOT_EDITING');
      return false;
    }

    if (this.selectedId !== null) {
      return this.rotateComponentById(this.selectedId);
    }

    if (isBuildTool(this.tool)) {
      const hoveredEditable = this.hover
        ? this.state.components.find(
            (component) =>
              !component.isFixed &&
              component.position.x === this.hover!.x &&
              component.position.y === this.hover!.y,
          )
        : undefined;

      if (hoveredEditable) {
        const rotated = this.rotateComponentById(hoveredEditable.id);
        return rotated;
      }

      this.direction = nextClockwiseDirection(this.direction);
      this.directionSelect.value = this.direction;
      this.status.textContent = i18n.t('editor.ghostRotated', {
        tool: formatComponentType(this.tool),
        direction: formatDirection(this.direction),
      });
      this.emitAction({
        kind: 'GHOST_ROTATED',
        tool: this.tool,
        direction: this.direction,
      });
      this.refresh();
      return true;
    }

    this.status.textContent = i18n.t('editor.selectBeforeRotate');
    return false;
  }

  refreshTranslations(): void {
    this.sceneManager.resize();
    this.refreshLevelOptions();
    this.status.textContent = i18n.t('editor.defaultHint');
    this.storageStatus.textContent = i18n.t('editor.storageDefault');
    this.sceneManager.refreshSelectedCellLabel();
    this.refresh();
  }

  dispose(): void {
    this.view.dispose();
    this.toolbar.removeEventListener('click', this.handleToolbarClick);
    this.saveRulesButton.removeEventListener('click', this.saveProcessorRules);
    this.saveDiverterRulesButton.removeEventListener('click', this.saveDiverterRules);
    this.levelSelect.removeEventListener('change', this.handleLevelChange);
    this.gameModeSelect.removeEventListener('change', this.handleGameModeChange);
    this.sandboxSourceSelect.removeEventListener('change', this.handleSourceModeChange);
    this.clearSandboxButton.removeEventListener('click', this.handleClearSandbox);
    this.loadExampleButton.removeEventListener('click', this.handleLoadExample);
    this.directionSelect.removeEventListener('change', this.handleDirectionChange);
    document.removeEventListener('keydown', this.handleKey);
    this.actionListeners.clear();
  }

  selectLevel(
    levelId: string,
    options: Readonly<{ forceEditMode?: boolean }> = {},
  ): boolean {
    if (options.forceEditMode && this.state.mode !== 'EDITING') {
      this.setMode('EDITING');
    }
    const level = getLevel(levelId);
    if (
      this.gameMode !== 'CAMPAIGN' ||
      this.state.mode !== 'EDITING' ||
      !level ||
      !isLevelUnlocked(level.id, this.completedLevels)
    ) {
      this.levelSelect.value = this.level.id;
      return false;
    }
    this.level = level;
    this.gameMode = 'CAMPAIGN';
    this.lastCampaignLevelId = level.id;
    this.state = createEditorState(level);
    this.selectedId = null;
    this.hover = null;
    this.tool = 'SELECT';
    this.direction = 'E';
    this.directionSelect.value = 'E';
    this.toolbar
      .querySelectorAll<HTMLButtonElement>('[data-tool]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset['tool'] === 'SELECT')),
      );
    this.levelInstructions.textContent = i18n.t(`levels.${level.id}.tutorial`);
    this.status.textContent = `${level.id} · ${i18n.t(`levels.${level.id}.lesson`)}`;
    this.refreshLevelOptions();
    this.refreshModeControls();
    this.persistPreferences();
    this.sceneManager.fitBoard();
    this.refresh();
    this.scenarioChangeHandler();
    return true;
  }

  private selectGameMode(mode: GameModePreference): boolean {
    if (
      this.state.mode !== 'EDITING' ||
      (mode !== 'CAMPAIGN' && mode !== 'SANDBOX')
    ) {
      return false;
    }
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
      this.level =
        previous && isLevelUnlocked(previous.id, this.completedLevels)
          ? previous
          : LEVEL_CATALOG[0]!;
      this.lastCampaignLevelId = this.level.id;
      this.state = createEditorState(this.level);
      this.selectedId = null;
    }
    this.tool = 'SELECT';
    this.toolbar
      .querySelectorAll<HTMLButtonElement>('[data-tool]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset['tool'] === 'SELECT')),
      );
    this.refreshLevelOptions();
    this.refreshModeControls();
    this.persistPreferences();
    this.sceneManager.fitBoard();
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
    this.state = Object.freeze({
      ...this.state,
      components: Object.freeze(
        this.state.components.map((component) => {
          const replacement = this.level.fixedComponents.find(
            (candidate) => candidate.id === component.id,
          );
          return replacement?.type === 'SOURCE' ? replacement : component;
        }),
      ),
    });
    this.sandboxComponents = this.state.components;
    this.persistPreferences();
    this.refresh();
    this.scenarioChangeHandler();
  }

  private persistPreferences(): void {
    const hasBestResults = Object.keys(this.bestResultsByLevel).length > 0;
    const hasAchievements = this.unlockedAchievements.length > 0;
    const hasCollectedItems = Object.keys(this.collectedItemsByType).length > 0;
    const saved = this.storage.save(
      Object.freeze({
        version: 1,
        completedLevelIds: this.completedLevels,
        preferences: Object.freeze({
          gameMode: this.gameMode,
          levelId: this.lastCampaignLevelId,
          sourceSequenceMode: this.sandboxSourceMode,
        }),
        ...(hasBestResults ? { bestResultsByLevel: this.bestResultsByLevel } : {}),
        ...(hasAchievements
          ? { unlockedAchievements: this.unlockedAchievements }
          : {}),
        ...(hasCollectedItems ? { collectedItemsByType: this.collectedItemsByType } : {}),
      }),
    );
    this.persisted = this.storage.load();
    this.storageStatus.textContent = saved
      ? i18n.t('editor.storageSaved')
      : i18n.t('editor.storageSessionOnly');
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
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-tool], [data-action]',
    );
    if (!button) return;
    const value = button.dataset['tool'];
    if (value) {
      if (button.disabled) return;
      const nextTool = value as Tool;
      this.setTool(nextTool);
      const label = isBuildTool(nextTool)
        ? formatComponentType(nextTool)
        : button.querySelector('.tool-label')?.textContent?.trim() ??
          button.textContent?.trim() ??
          value;
      this.announce(
        i18n.t('editor.toolSelected', {
          tool: label,
          direction: formatDirection(this.direction),
        }),
      );
      return;
    }
    if (button.dataset['action'] === 'rotate') {
      this.rotateActiveOrSelected();
      return;
    }
    if (button.dataset['action'] === 'undo') {
      this.undo();
      return;
    }
    if (button.dataset['action'] === 'redo') {
      this.redo();
      return;
    }
    if (button.dataset['action'] === 'equipment-info') {
      const selectedComp = this.state.components.find((c) => c.id === this.selectedId);
      const previewType: Component['type'] = selectedComp
        ? selectedComp.type
        : isBuildTool(this.tool)
          ? this.tool
          : 'CONVEYOR';
      this.equipmentPreviewHandler?.(previewType, button);
      return;
    }
    if (button.dataset['action'] === 'cancel') {
      this.selectedId = null;
      this.setTool('SELECT');
      this.announce(i18n.t('editor.toolCanceled'));
    }
  };

  private setTool(tool: Tool): void {
    this.tool = tool;
    this.selectedId = null;
    this.toolbar
      .querySelectorAll<HTMLButtonElement>('[data-tool]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset['tool'] === tool)),
      );
    this.emitAction({ kind: 'TOOL_SELECTED', tool });
    this.refresh();
  }

  private rotateComponentById(componentId: string): boolean {
    const before = this.state.components.find((item) => item.id === componentId);
    if (!before) {
      this.status.textContent = i18n.t('editor.selectBeforeRotate');
      return false;
    }
    const result = reduceEditor(this.state, { kind: 'ROTATE', componentId });
    if (!result.ok) {
      this.status.textContent = errorMessage(result.error.code);
      return false;
    }
    this.state = result.state;
    if (this.isSandbox()) this.sandboxComponents = this.state.components;
    const rotated = this.state.components.find(
      (item): item is EditableComponent =>
        item.id === componentId && !item.isFixed,
    );
    if (rotated) {
      this.direction = rotated.direction;
      this.directionSelect.value = rotated.direction;
      this.status.textContent = i18n.t('editor.rotated', {
        type: formatComponentType(rotated.type),
        direction: formatDirection(rotated.direction),
      });
      this.emitAction({ kind: 'COMPONENT_ROTATED', component: rotated });
    }
    this.refresh();
    return true;
  }

  private readonly saveProcessorRules = (): void => {
    if (!this.selectedId) return;
    const rules: ProcessorRule[] = [];
    if (this.blueRule.value !== 'NONE') {
      rules.push({
        when: 'BLUE_BLANK',
        then: this.blueRule.value as ProcessorRule['then'],
      });
    }
    if (this.amberRule.value !== 'NONE') {
      rules.push({
        when: 'AMBER_BLANK',
        then: this.amberRule.value as ProcessorRule['then'],
      });
    }
    this.apply({ kind: 'SET_PROCESSOR_RULES', componentId: this.selectedId, rules });
  };

  private readonly saveDiverterRules = (): void => {
    if (!this.selectedId) return;
    const rules: DiverterRule[] = [];
    if (this.cutRoute.value !== 'NONE') {
      rules.push({
        when: 'CUT_PLATE',
        then: this.cutRoute.value as DiverterRule['then'],
      });
    }
    if (this.pressedRoute.value !== 'NONE') {
      rules.push({
        when: 'PRESSED_BLOCK',
        then: this.pressedRoute.value as DiverterRule['then'],
      });
    }
    this.apply({ kind: 'SET_DIVERTER_RULES', componentId: this.selectedId, rules });
  };

  private apply(command: Parameters<typeof reduceEditor>[1]): void {
    const beforeState = this.state;
    const previousOrdinal = this.state.nextComponentOrdinal;
    const result = reduceEditor(this.state, command);
    if (!result.ok) {
      this.status.textContent = errorMessage(result.error.code);
      return;
    }
    this.state = result.state;
    if (command.kind !== 'SET_MODE') {
      this.transactionCounter += 1;
      this.history = pushHistoryTransaction(this.history, {
        id: `tx-${this.transactionCounter}`,
        kind:
          command.kind === 'PLACE'
            ? 'PLACE_SINGLE'
            : command.kind === 'REMOVE'
              ? 'REMOVE'
              : command.kind === 'ROTATE'
                ? 'ROTATE'
                : 'SET_RULES',
        before: beforeState,
        after: this.state,
        cellsAffected: command.kind === 'PLACE' ? [command.position] : [],
      });
    }
    if (this.isSandbox()) this.sandboxComponents = this.state.components;

    if (command.kind === 'PLACE') {
      const placedId = `piece-${previousOrdinal}`;
      const placed = this.state.components.find(
        (item): item is EditableComponent =>
          item.id === placedId && !item.isFixed,
      );
      this.status.textContent = i18n.t('editor.placedAt', {
        type: formatComponentType(command.componentType),
        x: command.position.x,
        y: command.position.y,
        direction: formatDirection(command.direction),
      });
      if (placed) {
        this.emitAction({ kind: 'COMPONENT_PLACED', component: placed });
      }
    } else if (command.kind === 'REMOVE') {
      this.status.textContent = i18n.t('editor.removed');
      this.emitAction({ kind: 'COMPONENT_REMOVED', componentId: command.componentId });
    } else if (command.kind === 'SET_PROCESSOR_RULES') {
      this.status.textContent = i18n.t('editor.processorRulesSaved');
    } else if (command.kind === 'SET_DIVERTER_RULES') {
      this.status.textContent = i18n.t('editor.diverterRoutesSaved');
    }
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
      const baseLabel =
        button.querySelector('.tool-label')?.textContent?.trim() ??
        button.textContent?.trim() ??
        toolKey;
      const localizedReason = availability.reasonKey
        ? i18n.t(availability.reasonKey)
        : availability.reason;
      button.title = localizedReason ? `${baseLabel} — ${localizedReason}` : baseLabel;

      const countBadge = button.querySelector<HTMLElement>(
        `[data-tool-count="${toolKey}"]`,
      );
      if (countBadge && isBuildTool(toolKey)) {
        countBadge.textContent = this.state.unlimitedInventory
          ? '∞'
          : String(this.state.inventory[toolKey]);
      }

      const reasonBadge = button.querySelector<HTMLElement>(
        `[data-tool-reason="${toolKey}"]`,
      );
      if (reasonBadge) {
        if (!availability.enabled && availability.reasonKey === 'tools.notAvailable') {
          reasonBadge.textContent = i18n.t('tools.badgeNotAvailable');
        } else if (
          !availability.enabled &&
          availability.reasonKey === 'tools.noRemaining'
        ) {
          reasonBadge.textContent = i18n.t('tools.badgeEmpty');
        } else if (
          !availability.enabled &&
          availability.reasonKey === 'tools.finishRunToEdit'
        ) {
          reasonBadge.textContent = i18n.t('tools.badgeLocked');
        } else {
          reasonBadge.textContent = '';
        }
      }

      if (!availability.enabled && this.tool === toolKey) {
        this.tool = 'SELECT';
        this.toolbar
          .querySelectorAll<HTMLButtonElement>('[data-tool]')
          .forEach((btn) =>
            btn.setAttribute('aria-pressed', String(btn.dataset['tool'] === 'SELECT')),
          );
      }
    });

    const placementError =
      isBuildTool(this.tool) && this.hover
        ? validatePlacement(this.state, this.tool, this.hover)
        : null;
    const ghost =
      isBuildTool(this.tool) && this.hover
        ? {
            type: this.tool,
            position: this.hover,
            direction: this.direction,
            valid: placementError === null,
          }
        : null;
    this.view.render(this.state.components, ghost, this.selectedId);
    this.sceneManager.renderNow();

    const inventoryItems = (
      Object.entries(this.state.inventory) as [EditableComponentType, number][]
    ).map(([type, count]) => {
      const li = document.createElement('li');
      li.dataset['componentType'] = type;
      const label = document.createElement('span');
      label.textContent = formatComponentType(type);
      const value = document.createElement('strong');
      value.textContent = this.state.unlimitedInventory
        ? i18n.t('editor.unlimited')
        : String(count);
      li.append(label, value);
      return li;
    });
    this.inventory.replaceChildren(...inventoryItems);

    const links = findPortConnections(this.state.components);
    this.connections.textContent = links.length
      ? links.length === 1
        ? i18n.t('editor.connectionsSingle')
        : i18n.t('editor.connectionsPlural', { count: links.length })
      : i18n.t('editor.connectionsDefault');

    const selectedComponent =
      this.state.components.find((component) => component.id === this.selectedId) ?? null;

    if (this.selectedComponentDetails) {
      if (selectedComponent) {
        this.selectedComponentDetails.textContent = i18n.t(
          'inspector.selectedDetails',
          {
            type: formatComponentType(selectedComponent.type),
            x: selectedComponent.position.x,
            y: selectedComponent.position.y,
            direction: formatDirection(selectedComponent.direction),
            fixed: selectedComponent.isFixed ? i18n.t('editor.fixedSuffix') : '',
          },
        );
      } else {
        this.selectedComponentDetails.textContent = i18n.t('inspector.noSelection');
      }
    }

    if (this.targetModeBanner) {
      if (selectedComponent && !selectedComponent.isFixed) {
        this.targetModeBanner.textContent = i18n.t('editor.targetMode.selected', {
          type: formatComponentType(selectedComponent.type),
          direction: formatDirection(selectedComponent.direction),
        });
        this.targetModeBanner.dataset['targetKind'] = 'selected';
      } else if (isBuildTool(this.tool)) {
        this.targetModeBanner.textContent = i18n.t('editor.targetMode.ghost', {
          tool: formatComponentType(this.tool),
          direction: formatDirection(this.direction),
        });
        this.targetModeBanner.dataset['targetKind'] = 'ghost';
      } else if (this.tool === 'REMOVE') {
        this.targetModeBanner.textContent = i18n.t('editor.targetMode.remove');
        this.targetModeBanner.dataset['targetKind'] = 'remove';
      } else {
        this.targetModeBanner.textContent = i18n.t('editor.targetMode.inspect');
        this.targetModeBanner.dataset['targetKind'] = 'inspect';
      }
    }

    const selectedProcessor =
      selectedComponent?.type === 'PROCESSOR' ? selectedComponent : undefined;
    const selectedDiverter =
      selectedComponent?.type === 'DIVERTER' ? selectedComponent : undefined;
    this.rulePanel.hidden = !selectedProcessor;
    this.diverterRulePanel.hidden = !selectedDiverter;
    if (selectedProcessor) {
      this.blueRule.value =
        selectedProcessor.rules.find((rule) => rule.when === 'BLUE_BLANK')?.then ??
        'NONE';
      this.amberRule.value =
        selectedProcessor.rules.find((rule) => rule.when === 'AMBER_BLANK')?.then ??
        'NONE';
    }
    if (selectedDiverter) {
      this.cutRoute.value =
        selectedDiverter.rules.find((rule) => rule.when === 'CUT_PLATE')?.then ?? 'NONE';
      this.pressedRoute.value =
        selectedDiverter.rules.find((rule) => rule.when === 'PRESSED_BLOCK')?.then ??
        'NONE';
    }

    const canRotateSelected = Boolean(selectedComponent && !selectedComponent.isFixed);
    const canRotateGhost = isBuildTool(this.tool);
    const rotate = this.toolbar.querySelector<HTMLButtonElement>('[data-action="rotate"]');
    if (rotate) {
      rotate.disabled =
        this.state.mode !== 'EDITING' || (!canRotateSelected && !canRotateGhost);
    }

    const cancelBtn = this.toolbar.querySelector<HTMLButtonElement>('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.disabled = this.state.mode !== 'EDITING';
    }
    const undoBtn = this.toolbar.querySelector<HTMLButtonElement>('#editor-undo');
    if (undoBtn) {
      undoBtn.disabled = this.state.mode !== 'EDITING' || this.history.past.length === 0;
    }
    const redoBtn = this.toolbar.querySelector<HTMLButtonElement>('#editor-redo');
    if (redoBtn) {
      redoBtn.disabled = this.state.mode !== 'EDITING' || this.history.future.length === 0;
    }

    delete this.placementStatus.dataset['valid'];
    if (!ghost) {
      this.placementStatus.textContent = '';
    } else {
      this.placementStatus.dataset['valid'] = String(ghost.valid);
      this.placementStatus.textContent = ghost.valid
        ? i18n.t('editor.previewValid', {
            x: ghost.position.x,
            y: ghost.position.y,
            direction: formatDirection(ghost.direction),
          })
        : i18n.t('editor.previewBlocked', { reason: errorMessage(placementError!) });
    }
  }

  private emitAction(event: EditorActionEvent): void {
    this.actionListeners.forEach((listener) => listener(event));
  }

  private announce(message: string): void {
    this.status.textContent = message;
  }
}
