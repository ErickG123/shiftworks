import {
  BufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  type Material,
  type Scene,
} from 'three';
import {
  DEFAULT_CELL_SIZE,
  type GridCell,
  type GridDimensions,
  gridToWorld,
} from '../domain/grid.model';

const TILE_GAP = 0.035;
const PICK_LAYER_NAME = 'grid-cell-pick-target';

export class GridView {
  readonly pickTargets: Mesh[] = [];
  readonly group = new Group();
  private readonly highlight: Mesh<PlaneGeometry, MeshBasicMaterial>;

  constructor(
    private readonly scene: Scene,
    readonly dimensions: GridDimensions,
    readonly cellSize = DEFAULT_CELL_SIZE,
  ) {
    this.highlight = this.createHighlight();
    this.buildGrid();
    this.scene.add(this.group);
  }

  setSelectedCell(cell: GridCell | null): void {
    if (!cell) {
      this.highlight.visible = false;
      return;
    }

    const world = gridToWorld(cell, this.dimensions, this.cellSize);
    this.highlight.position.set(world.x, 0.065, world.z);
    this.highlight.visible = true;
  }

  private buildGrid(): void {
    const ground = new Mesh(
      new PlaneGeometry(this.dimensions.width * this.cellSize, this.dimensions.height * this.cellSize),
      new MeshStandardMaterial({ color: 0x182334, roughness: 0.94 }),
    );
    ground.name = 'factory-ground';
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.04;
    this.group.add(ground);

    for (let y = 0; y < this.dimensions.height; y += 1) {
      for (let x = 0; x < this.dimensions.width; x += 1) {
        const cell = Object.freeze({ x, y });
        const world = gridToWorld(cell, this.dimensions, this.cellSize);
        this.addTile(cell, world.x, world.z, (x + y) % 2 === 0);
        this.addPickTarget(cell, world.x, world.z);
      }
    }

    this.highlight.renderOrder = 3;
    this.highlight.visible = false;
    this.group.add(this.highlight);
  }

  private addTile(cell: GridCell, x: number, z: number, alternate: boolean): void {
    const material = new MeshStandardMaterial({
      color: alternate ? 0x26364a : 0x202f41,
      roughness: 0.88,
      metalness: 0.04,
    });
    const tile = new Mesh(
      new PlaneGeometry(this.cellSize - TILE_GAP, this.cellSize - TILE_GAP),
      material,
    );
    tile.name = `grid-tile-${cell.x}-${cell.y}`;
    tile.rotation.x = -Math.PI / 2;
    tile.position.set(x, 0.005, z);
    tile.receiveShadow = true;
    this.group.add(tile);
  }

  private addPickTarget(cell: GridCell, x: number, z: number): void {
    const target = new Mesh(
      new PlaneGeometry(this.cellSize, this.cellSize),
      new MeshBasicMaterial({
        colorWrite: false,
        depthWrite: false,
        side: DoubleSide,
      }),
    );
    target.name = `${PICK_LAYER_NAME}-${cell.x}-${cell.y}`;
    target.rotation.x = -Math.PI / 2;
    target.position.set(x, 0.035, z);
    target.userData['gridCell'] = cell;
    this.pickTargets.push(target);
    this.group.add(target);
  }

  private createHighlight(): Mesh<PlaneGeometry, MeshBasicMaterial> {
    return new Mesh(
      new PlaneGeometry(this.cellSize - 0.12, this.cellSize - 0.12),
      new MeshBasicMaterial({
        color: 0xf5c96a,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        side: DoubleSide,
      }),
    );
  }

}

export function disposeSceneResources(scene: Scene): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();

  scene.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    geometries.add(object.geometry);
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => materials.add(material));
    } else {
      materials.add(object.material);
    }
  });

  scene.clear();
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
