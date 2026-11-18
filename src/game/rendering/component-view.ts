import { BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, SphereGeometry, type Scene } from 'three';
import type { Component, Direction } from '../domain/component.model';
import type { GridCell, GridDimensions } from '../domain/grid.model';
import { gridToWorld } from '../domain/grid.model';
import { portsFor } from '../domain/ports.model';

const directionAngle: Record<Direction, number> = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
const directionVector: Record<Direction, readonly [number, number]> = { E: [1, 0], S: [0, 1], W: [-1, 0], N: [0, -1] };

export type MachineVisualState = Readonly<{
  componentId: string;
  phase: 'IDLE' | 'SHIFTING' | 'PROCESSING' | 'READY' | 'RULE_MISSING';
  mode: 'CUT' | 'PRESS';
  targetMode: 'CUT' | 'PRESS' | null;
  route: 'A' | 'B' | null;
}>;

type AnimatedMachine = { processorHead?: Mesh; processorLight?: Mesh<SphereGeometry, MeshBasicMaterial>; diverterArm?: Group; diverterBaseRotation?: number };

export class ComponentView {
  private group = new Group();
  private readonly animationParts = new Map<string, AnimatedMachine>();
  private readonly runtimeStates = new Map<string, MachineVisualState>();
  private simulationRunning = false;
  constructor(private readonly scene: Scene, private readonly dimensions: GridDimensions) { this.group.name = 'editor-components'; scene.add(this.group); }

  render(components: readonly Component[], ghost?: Readonly<{ type: Component['type']; position: GridCell; direction: Direction; valid: boolean }> | null): void {
    this.disposeGroup();
    this.group = new Group(); this.group.name = 'editor-components'; this.scene.add(this.group);
    components.forEach((component) => this.drawComponent(component, false, true));
    if (ghost) this.drawComponent({ id: 'placement-preview', type: ghost.type, position: ghost.position, direction: ghost.direction, isFixed: false } as Component, true, ghost.valid);
  }

  dispose(): void { this.disposeGroup(); }

  setRuntimeStates(states: readonly MachineVisualState[], running: boolean): void {
    this.runtimeStates.clear();
    states.forEach((state) => this.runtimeStates.set(state.componentId, state));
    this.simulationRunning = running;
  }

  animate(time: number): void {
    for (const [componentId, parts] of this.animationParts) {
      const state = this.runtimeStates.get(componentId);
      if (!state) continue;
      if (parts.processorHead) {
        const active = state.phase === 'PROCESSING' || state.phase === 'SHIFTING';
        parts.processorHead.position.y = state.phase === 'READY' ? 0.68 : active && this.simulationRunning ? 0.76 + Math.sin(time * 0.012) * 0.045 : 0.81;
        if (parts.processorLight) parts.processorLight.material.color.set(state.phase === 'RULE_MISSING' ? 0xef4444 : state.targetMode === 'PRESS' ? 0xf59e0b : state.mode === 'PRESS' ? 0xf59e0b : 0x38bdf8);
      }
      if (parts.diverterArm) {
        const target = state.route === 'B' ? Math.PI / 2 : 0;
        const pulse = this.simulationRunning && state.route ? Math.sin(time * 0.008) * 0.035 : 0;
        parts.diverterArm.rotation.y = (parts.diverterBaseRotation ?? 0) + target + pulse;
      }
    }
  }

  private drawComponent(component: Component, ghost: boolean, valid: boolean): void {
    const world = gridToWorld(component.position, this.dimensions);
    const item = new Group(); item.name = `${ghost ? 'ghost' : 'component'}-${component.id}`; item.position.set(world.x, 0, world.z);
    const animated: AnimatedMachine = {};
    const alpha = ghost ? 0.48 : 1;
    const main = ghost ? (valid ? 0x67e8a5 : 0xfb7185) : component.type === 'SOURCE' ? 0x4f97d6 : component.type === 'OUTPUT' ? 0xdba04c : component.type === 'PROCESSOR' ? 0xa78bfa : component.type === 'DIVERTER' ? 0xf472b6 : 0x67c7a5;
    const mat = new MeshStandardMaterial({ color: main, transparent: alpha < 1, opacity: alpha, roughness: 0.42, metalness: 0.24 });
    const baseMat = new MeshStandardMaterial({ color: 0x334155, transparent: alpha < 1, opacity: alpha, metalness: 0.38, roughness: 0.55 });
    const base = new Mesh(new BoxGeometry(0.78, 0.13, 0.78), baseMat); base.position.y = 0.105; item.add(base);
    if (component.type === 'SOURCE') {
      const body = new Mesh(new CylinderGeometry(0.25, 0.32, 0.63, 8), mat); body.position.y = 0.48; item.add(body);
      const cap = new Mesh(new CylinderGeometry(0.16, 0.2, 0.14, 8), new MeshStandardMaterial({ color: 0xe2e8f0 })); cap.position.y = 0.88; item.add(cap);
      const band = new Mesh(new CylinderGeometry(0.3, 0.3, 0.07, 8), new MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.5 })); band.position.y = 0.5; item.add(band);
    } else if (component.type === 'OUTPUT') {
      const body = new Mesh(new CylinderGeometry(0.27, 0.29, 0.22, 6), mat); body.position.y = 0.27; item.add(body);
      const label = new Mesh(new CircleGeometry(0.12, 12), new MeshBasicMaterial({ color: 0xfff7ed })); label.rotation.x = -Math.PI / 2; label.position.y = 0.39; item.add(label);
    } else if (component.type === 'CONVEYOR') {
      const belt = new Mesh(new BoxGeometry(0.66, 0.11, 0.4), mat); belt.position.y = 0.26; belt.rotation.y = directionAngle[component.direction]; item.add(belt);
      for (let n = -1; n <= 1; n += 1) { const roller = new Mesh(new CylinderGeometry(0.035, 0.035, 0.44, 8), baseMat); roller.rotation.z = Math.PI / 2; roller.position.set(n * 0.18, 0.33, 0); item.add(roller); }
    } else if (component.type === 'PROCESSOR') {
      const body = new Mesh(new BoxGeometry(0.56, 0.62, 0.56), mat); body.position.y = 0.43; item.add(body);
      const head = new Mesh(new CylinderGeometry(0.17, 0.22, 0.12, 8), new MeshStandardMaterial({ color: 0xe9d5ff })); head.position.y = 0.81; item.add(head); animated.processorHead = head;
      const lightMaterial = new MeshBasicMaterial({ color: 0x38bdf8 });
      const light = new Mesh(new SphereGeometry(0.075, 10, 8), lightMaterial); light.position.set(0, 0.68, 0.29); item.add(light); animated.processorLight = light;
      const stripe = new Mesh(new BoxGeometry(0.58, 0.055, 0.59), new MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })); stripe.position.y = 0.16; item.add(stripe);
    } else {
      const body = new Mesh(new BoxGeometry(0.54, 0.42, 0.54), mat); body.position.y = 0.34; item.add(body);
      const pivot = new Group(); pivot.position.y = 0.59; pivot.rotation.y = directionAngle[component.direction]; item.add(pivot); animated.diverterArm = pivot; animated.diverterBaseRotation = directionAngle[component.direction];
      const arrow = new Mesh(new ConeGeometry(0.18, 0.3, 3), new MeshStandardMaterial({ color: 0xfdf2f8 })); arrow.position.y = 0.08; pivot.add(arrow);
      const arm = new Mesh(new BoxGeometry(0.48, 0.065, 0.13), new MeshStandardMaterial({ color: 0xf9a8d4, metalness: 0.28 })); arm.position.set(0, 0.04, 0); pivot.add(arm);
    }
    const vector = directionVector[component.direction];
    const arrow = new Mesh(new ConeGeometry(0.11, 0.2, 4), new MeshBasicMaterial({ color: 0xf8fafc, transparent: ghost, opacity: alpha }));
    arrow.position.set(vector[0] * 0.31, 0.48, vector[1] * 0.31); arrow.rotation.z = vector[0] ? -Math.PI / 2 : 0; arrow.rotation.y = directionAngle[component.direction]; item.add(arrow);
    portsFor(component).forEach((port) => {
      const relX = port.cell.x - component.position.x; const relY = port.cell.y - component.position.y;
      const marker = new Mesh(new SphereGeometry(0.075, 8, 6), new MeshBasicMaterial({ color: port.kind === 'INPUT' ? 0x67e8f9 : 0xfacc15, transparent: ghost, opacity: alpha }));
      marker.position.set(relX * 0.35, 0.17, relY * 0.35); item.add(marker);
    });
    this.group.add(item);
    item.traverse((object) => { if (object instanceof Mesh) object.castShadow = !ghost; });
    if (!ghost && (animated.processorHead || animated.diverterArm)) this.animationParts.set(component.id, animated);
  }

  private disposeGroup(): void {
    this.group.traverse((object) => { if (object instanceof Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((material) => material.dispose()); } });
    this.scene.remove(this.group);
    this.animationParts.clear();
  }
}
