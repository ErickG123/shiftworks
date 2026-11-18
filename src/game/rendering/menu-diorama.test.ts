import { describe, expect, it } from 'vitest';
import { Group, Scene } from 'three';
import { MenuDiorama } from './menu-diorama';
import type { SceneManager } from './scene-manager';

function createFakeSceneManager(): SceneManager {
  const scene = new Scene();
  const editorGroup = new Group();
  editorGroup.name = 'editor-components';
  const simGroup = new Group();
  simGroup.name = 'simulation-items';
  scene.add(editorGroup, simGroup);

  return {
    scene,
    fitBoard: () => undefined,
    renderNow: () => undefined,
  } as unknown as SceneManager;
}

describe('MenuDiorama', () => {
  it('hides gameplay groups while active and restores them on stop()', () => {
    const sceneManager = createFakeSceneManager();
    const diorama = new MenuDiorama(sceneManager);

    expect(diorama.isActive()).toBe(false);
    diorama.start();
    expect(diorama.isActive()).toBe(true);

    const editorGroup = sceneManager.scene.children.find((c) => c.name === 'editor-components')!;
    expect(editorGroup.visible).toBe(false);

    // Idempotent start
    diorama.start();
    expect(diorama.isActive()).toBe(true);

    diorama.stop();
    expect(diorama.isActive()).toBe(false);
    expect(editorGroup.visible).toBe(true);
  });
});
