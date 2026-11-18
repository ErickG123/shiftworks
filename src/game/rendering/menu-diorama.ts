import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { L03_LEVEL, L03_REFERENCE_COMPONENTS } from '../domain/l03-level.model';
import { ComponentView, type MachineVisualState } from './component-view';
import type { SceneManager } from './scene-manager';

export class MenuDiorama {
  private active = false;
  private componentView: ComponentView | null = null;
  private itemsGroup: Group | null = null;
  private itemMeshes: Mesh[] = [];

  constructor(private readonly sceneManager: SceneManager) {}

  isActive(): boolean {
    return this.active;
  }

  start(): void {
    if (this.active) return;
    this.active = true;
    this.setGameplayGroupsVisible(false);

    this.componentView = new ComponentView(this.sceneManager.scene, L03_LEVEL);
    this.componentView.render(L03_REFERENCE_COMPONENTS, null);

    this.itemsGroup = new Group();
    this.itemsGroup.name = 'diorama-items';
    const blueBlank = new Mesh(
      new BoxGeometry(0.3, 0.3, 0.3),
      new MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.36, metalness: 0.08 }),
    );
    const cutPlate = new Mesh(
      new BoxGeometry(0.42, 0.09, 0.3),
      new MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.36, metalness: 0.08 }),
    );
    const pressedBlock = new Mesh(
      new CylinderGeometry(0.19, 0.19, 0.24, 6),
      new MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.36, metalness: 0.08 }),
    );
    this.itemMeshes = [blueBlank, cutPlate, pressedBlock];
    this.itemsGroup.add(blueBlank, cutPlate, pressedBlock);
    this.sceneManager.scene.add(this.itemsGroup);

    this.updateAnimatedPositions(0);
    this.sceneManager.renderNow();
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    if (this.itemsGroup) {
      this.itemsGroup.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      this.sceneManager.scene.remove(this.itemsGroup);
      this.itemsGroup = null;
      this.itemMeshes = [];
    }
    this.componentView?.dispose();
    this.componentView = null;
    this.setGameplayGroupsVisible(true);
    this.sceneManager.renderNow();
  }

  animate(time: number): void {
    if (!this.active) return;
    this.updateAnimatedPositions(time);
    this.componentView?.animate(time);
  }

  dispose(): void {
    this.stop();
  }

  private updateAnimatedPositions(time: number): void {
    const cycle = (time * 0.00045) % 1;
    const isPressPhase = cycle >= 0.5;
    const states: MachineVisualState[] = [
      {
        componentId: 'processor-1',
        phase: 'PROCESSING',
        mode: isPressPhase ? 'PRESS' : 'CUT',
        targetMode: isPressPhase ? 'PRESS' : 'CUT',
        route: null,
      },
      {
        componentId: 'diverter-1',
        phase: 'PROCESSING',
        mode: 'CUT',
        targetMode: null,
        route: isPressPhase ? 'B' : 'A',
      },
    ];
    this.componentView?.setRuntimeStates(states, true);

    const [m0, m1, m2] = this.itemMeshes;
    if (m0) {
      const t0 = (time * 0.001) % 1;
      m0.position.set(-3.5 + t0 * 1.0, 0.52, -0.5);
    }
    if (m1) {
      const t1 = ((time * 0.0007) + 0.33) % 1;
      m1.position.set(-2.5 + t1 * 4.5, 0.43, -0.5);
    }
    if (m2) {
      const t2 = ((time * 0.0007) + 0.66) % 1;
      m2.position.set(1.5, 0.52, -0.5 + t2 * 2.0);
    }
  }

  private setGameplayGroupsVisible(visible: boolean): void {
    for (const child of this.sceneManager.scene.children) {
      if (child.name === 'editor-components' || child.name === 'simulation-items') {
        child.visible = visible;
      }
    }
  }
}
