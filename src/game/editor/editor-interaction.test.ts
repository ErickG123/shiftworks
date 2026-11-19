import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Scene } from 'three';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EditorController } from './editor-controller';
import { SimulationController } from '../simulation/simulation-controller';
import { NavigationController } from '../ui/navigation-controller';
import type { SceneManager } from '../rendering/scene-manager';
import { i18n } from '../../i18n';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

function createFakeSceneManager(): SceneManager {
  const scene = new Scene();
  return {
    scene,
    renderNow: () => undefined,
    resize: () => undefined,
    fitBoard: () => undefined,
    refreshSelectedCellLabel: () => undefined,
  } as unknown as SceneManager;
}

describe('EditorController, SimulationController & Tutorial T00 integration', () => {
  let editor: EditorController;
  let simulation: SimulationController;
  let navigation: NavigationController;

  beforeEach(() => {
    localStorage.clear();
    i18n.setLocale('pt-BR');
    const bodyMatch = indexHtml.match(/<body>([\s\S]*)<\/body>/i);
    document.body.innerHTML = bodyMatch ? bodyMatch[1]! : indexHtml;
    const app = document.querySelector<HTMLElement>('#app')!;
    const sceneManager = createFakeSceneManager();
    editor = new EditorController(sceneManager);
    simulation = new SimulationController(sceneManager, editor);
    navigation = new NavigationController(app, editor, simulation, null);
    navigation.setScreen('GAMEPLAY');
  });

  afterEach(() => {
    navigation.dispose();
    simulation.dispose();
    editor.dispose();
    document.body.innerHTML = '';
  });

  it('rotates ghost orientation N->E->S->W->N with R when Conveyor tool is active and applies it to the next placement', () => {
    const conveyorBtn = document.querySelector<HTMLButtonElement>(
      '[data-tool="CONVEYOR"]',
    )!;
    conveyorBtn.click();
    expect(editor.getTool()).toBe('CONVEYOR');
    expect(editor.getPlacementDirection()).toBe('E');

    // Hover an empty cell so ghost is active
    editor.onHover({ x: 2, y: 3 });

    const expectedSequence = ['S', 'W', 'N', 'E'] as const;
    for (const expectedDir of expectedSequence) {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'r',
          code: 'KeyR',
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(editor.getPlacementDirection()).toBe(expectedDir);
    }

    // Rotate once more to S and place at (2, 3)
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        code: 'KeyR',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(editor.getPlacementDirection()).toBe('S');

    editor.onClick({ x: 2, y: 3 });
    const placed = editor
      .getComponents()
      .find((c) => c.position.x === 2 && c.position.y === 3);
    expect(placed).toBeDefined();
    expect(placed?.direction).toBe('S');
  });

  it('rotates an existing selected conveyor with R and shows guidance when no piece or build tool is active', () => {
    // 1. In SELECT mode with nothing selected, R must not rotate anything and must show guidance
    expect(editor.getTool()).toBe('SELECT');
    expect(editor.getSelectedComponentId()).toBeNull();
    const initialDirections = editor.getComponents().map((c) => c.direction);

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        code: 'KeyR',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(editor.getComponents().map((c) => c.direction)).toEqual(initialDirections);
    expect(document.querySelector('#editor-feedback')?.textContent).toBe(
      i18n.t('editor.selectBeforeRotate'),
    );

    // 2. Place a conveyor at (1, 3), switch to SELECT, select it, and press R 4 times
    document.querySelector<HTMLButtonElement>('[data-tool="CONVEYOR"]')!.click();
    editor.onClick({ x: 1, y: 3 });
    document.querySelector<HTMLButtonElement>('[data-tool="SELECT"]')!.click();
    editor.onClick({ x: 1, y: 3 });
    expect(editor.getSelectedComponentId()).toBe('piece-1');

    for (const expectedDir of ['S', 'W', 'N', 'E'] as const) {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'r',
          code: 'KeyR',
          bubbles: true,
          cancelable: true,
        }),
      );
      const comp = editor.getComponents().find((c) => c.id === 'piece-1');
      expect(comp?.direction).toBe(expectedDir);
    }
  });

  it('supports Start -> Pause (read-only inspection) -> Resume -> Pause -> Edit Factory without locking tools or losing layout', () => {
    document.querySelector<HTMLButtonElement>('[data-tool="CONVEYOR"]')!.click();
    editor.onClick({ x: 1, y: 3 });
    editor.onClick({ x: 2, y: 3 });
    expect(editor.getComponents().filter((c) => !c.isFixed)).toHaveLength(2);
    expect(editor.getState().inventory.CONVEYOR).toBe(10);

    // Start simulation
    const startBtn = document.querySelector<HTMLButtonElement>('#start-simulation')!;
    const pauseBtn = document.querySelector<HTMLButtonElement>('#pause-simulation')!;
    const resumeBtn = document.querySelector<HTMLButtonElement>('#resume-simulation')!;
    const editBtn = document.querySelector<HTMLButtonElement>('#edit-simulation')!;
    const conveyorBtn = document.querySelector<HTMLButtonElement>(
      '[data-tool="CONVEYOR"]',
    )!;

    startBtn.click();
    expect(simulation.getMode()).toBe('RUNNING');
    expect(conveyorBtn.disabled).toBe(true);

    // Pause simulation
    pauseBtn.click();
    expect(simulation.getMode()).toBe('PAUSED');
    expect(
      document.querySelector<HTMLElement>('#paused-callout-banner')?.hidden,
    ).toBe(false);
    expect(conveyorBtn.disabled).toBe(true);

    // In PAUSED, clicking a placed component inspects it in read-only mode
    editor.onClick({ x: 1, y: 3 });
    expect(editor.getSelectedComponentId()).toBe('piece-1');
    expect(document.querySelector('#editor-feedback')?.textContent).toContain(
      'Editar fábrica',
    );

    // In PAUSED, pressing R does not rotate the piece
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        code: 'KeyR',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(editor.getComponents().find((c) => c.id === 'piece-1')?.direction).toBe('E');

    // Resume then Pause again
    resumeBtn.click();
    expect(simulation.getMode()).toBe('RUNNING');
    pauseBtn.click();
    expect(simulation.getMode()).toBe('PAUSED');

    // Click Edit Factory: returns to EDITING, preserves layout, re-enables tools
    editBtn.click();
    expect(simulation.getMode()).toBe('EDITING');
    expect(editor.getState().mode).toBe('EDITING');
    expect(editor.getComponents().filter((c) => !c.isFixed)).toHaveLength(2);
    expect(editor.getState().inventory.CONVEYOR).toBe(10);
    expect(conveyorBtn.disabled).toBe(false);
    expect(
      document.querySelector<HTMLElement>('#paused-callout-banner')?.hidden,
    ).toBe(true);

    // Can immediately select Conveyor tool and place a 3rd conveyor
    conveyorBtn.click();
    editor.onClick({ x: 3, y: 3 });
    expect(editor.getComponents().filter((c) => !c.isFixed)).toHaveLength(3);
  });

  it('advances Tutorial T00 only on real editor and simulation actions', () => {
    navigation.startTutorial();
    expect(navigation.isTutorialActive()).toBe(true);
    expect(navigation.getTutorialStepIndex()).toBe(0);

    // Unrelated click on canvas does not advance Step 0 (select-conveyor)
    editor.onClick({ x: 1, y: 3 });
    expect(navigation.getTutorialStepIndex()).toBe(0);

    // Step 1/4: Select Conveyor tool
    document.querySelector<HTMLButtonElement>('[data-tool="CONVEYOR"]')!.click();
    expect(navigation.getTutorialStepIndex()).toBe(1);

    // Clicking an occupied fixed source cell (0, 3) fails placement and does NOT advance Step 2/4
    editor.onClick({ x: 0, y: 3 });
    expect(navigation.getTutorialStepIndex()).toBe(1);

    // Step 2/4: Place conveyor on empty cell (1, 3)
    editor.onHover({ x: 1, y: 3 });
    editor.onClick({ x: 1, y: 3 });
    expect(navigation.getTutorialStepIndex()).toBe(2);

    // Step 3/4: Press R to rotate conveyor / ghost
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        code: 'KeyR',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(navigation.getTutorialStepIndex()).toBe(3);

    // Step 4/4: Press Start
    document.querySelector<HTMLButtonElement>('#start-simulation')!.click();
    expect(navigation.isTutorialActive()).toBe(false);
  });
});
