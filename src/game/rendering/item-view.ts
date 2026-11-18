import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, type Scene } from 'three';
import type { ItemInstance } from '../domain/simulation.model';
import type { GridCell, GridDimensions } from '../domain/grid.model';
import { gridToWorld } from '../domain/grid.model';
import { interpolatePosition } from './interpolation';

const ITEM_TRAVEL_MS = 250;

type ItemMotion = { from: Readonly<{ x: number; y: number; z: number }>; to: Readonly<{ x: number; y: number; z: number }>; startedAt: number; progress: number };

export type ItemProjection = Readonly<{ item: ItemInstance; position: GridCell }>;

export class ItemView {
  private group = new Group();
  private readonly meshes = new Map<string, Mesh>();
  private readonly motions = new Map<string, ItemMotion>();
  private animationFrame: number | null = null;
  private paused = false;

  constructor(private readonly scene: Scene, private readonly dimensions: GridDimensions) {
    this.group.name = 'simulation-items';
    this.scene.add(this.group);
  }

  render(items: readonly ItemProjection[], animate = true): void {
    const present = new Set(items.map(({ item }) => item.id));
    for (const [id, mesh] of this.meshes) {
      if (!present.has(id)) {
        this.disposeMesh(mesh);
        this.meshes.delete(id);
        this.motions.delete(id);
      }
    }
    for (const projection of items) {
      const { item, position } = projection;
      const world = gridToWorld(position, this.dimensions);
      const y = item.type === 'CUT_PLATE' ? 0.43 : 0.52;
      const target = Object.freeze({ x: world.x, y, z: world.z });
      let mesh = this.meshes.get(item.id);
      if (mesh && mesh.userData['itemType'] !== item.type) {
        this.disposeMesh(mesh);
        this.meshes.delete(item.id);
        this.motions.delete(item.id);
        mesh = undefined;
      }
      if (!mesh) {
        mesh = this.createMesh(item);
        mesh.userData['itemType'] = item.type;
        mesh.position.set(target.x, target.y, target.z);
        this.meshes.set(item.id, mesh);
        this.group.add(mesh);
      } else {
        const from = Object.freeze({ x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
        if (!animate || this.paused || (from.x === target.x && from.z === target.z)) {
          mesh.position.set(target.x, target.y, target.z);
          this.motions.delete(item.id);
        } else {
          this.motions.set(item.id, { from, to: target, startedAt: performance.now(), progress: 0 });
        }
      }
    }
    if (!this.scene.children.includes(this.group)) this.scene.add(this.group);
    if (!animate) this.stopAnimation();
    else this.scheduleAnimation();
  }

  pause(): void {
    this.paused = true;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  resume(): void {
    this.paused = false;
    const now = performance.now();
    for (const motion of this.motions.values()) motion.startedAt = now - motion.progress * ITEM_TRAVEL_MS;
    this.scheduleAnimation();
  }

  dispose(): void {
    this.stopAnimation();
    for (const mesh of this.meshes.values()) this.disposeMesh(mesh);
    this.meshes.clear();
    this.motions.clear();
    this.scene.remove(this.group);
  }

  private createMesh(item: ItemInstance): Mesh {
    const color = item.type === 'BLUE_BLANK' || item.type === 'CUT_PLATE' ? 0x38bdf8 : 0xf59e0b;
    const geometry = item.type === 'AMBER_BLANK'
      ? new CylinderGeometry(0.19, 0.19, 0.24, 6)
      : item.type === 'CUT_PLATE'
        ? new BoxGeometry(0.42, 0.09, 0.3)
        : item.type === 'PRESSED_BLOCK'
          ? new BoxGeometry(0.29, 0.24, 0.29)
          : new BoxGeometry(0.3, 0.3, 0.3);
    const material = new MeshStandardMaterial({ color, roughness: 0.36, metalness: 0.08, emissive: color, emissiveIntensity: 0.08 });
    const mesh = new Mesh(geometry, material);
    mesh.name = `item-${item.id}`;
    mesh.castShadow = true;
    mesh.userData['itemId'] = item.id;
    mesh.userData['itemType'] = item.type;
    return mesh;
  }

  private scheduleAnimation(): void {
    if (this.paused || this.animationFrame !== null || this.motions.size === 0) return;
    const animate = (now: number): void => {
      this.animationFrame = null;
      for (const [id, motion] of this.motions) {
        const mesh = this.meshes.get(id);
        if (!mesh) { this.motions.delete(id); continue; }
        motion.progress = Math.min(1, (now - motion.startedAt) / ITEM_TRAVEL_MS);
        const position = interpolatePosition(motion.from, motion.to, motion.progress);
        mesh.position.set(position.x, position.y, position.z);
        if (motion.progress >= 1) this.motions.delete(id);
      }
      if (this.motions.size > 0 && !this.paused) this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.motions.clear();
  }

  private disposeMesh(mesh: Mesh): void {
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => material.dispose());
    this.group.remove(mesh);
  }
}
