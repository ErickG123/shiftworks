import {
  AmbientLight,
  Color,
  DirectionalLight,
  OrthographicCamera,
  Raycaster,
  SRGBColorSpace,
  Scene,
  Vector2,
  WebGLRenderer,
  PCFSoftShadowMap,
} from 'three';
import {
  DEFAULT_GRID_DIMENSIONS,
  type GridCell,
  type GridDimensions,
} from '../domain/grid.model';
import { pickGridCell } from '../interaction/grid-picking';
import { disposeSceneResources, GridView } from './grid-view';
import { CAMERA_ZOOM_STEP, MAX_CAMERA_ZOOM, MIN_CAMERA_ZOOM, orthographicFrustum, zoomFromWheel } from './zoom';

export type SceneManagerOptions = Readonly<{
  canvas: HTMLCanvasElement;
  selectedCellOutput?: HTMLOutputElement | null;
  dimensions?: GridDimensions;
  onCellHover?: (cell: GridCell | null) => void;
  onCellClick?: (cell: GridCell, event: PointerEvent) => void;
  onFrame?: (time: number) => void;
}>;

const BASE_FRUSTUM_HEIGHT = 10.8;
const MAX_PIXEL_RATIO = 2;

export class SceneManager {
  readonly scene = new Scene();
  readonly camera = new OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
  readonly renderer: WebGLRenderer;
  readonly dimensions: GridDimensions;
  readonly canvas: HTMLCanvasElement;

  private readonly gridView: GridView;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly selectedCellOutput: HTMLOutputElement | null;
  private readonly zoomOutButton: HTMLButtonElement | null;
  private readonly zoomInButton: HTMLButtonElement | null;
  private readonly zoomResetButton: HTMLButtonElement | null;
  private readonly onCellHover?: (cell: GridCell | null) => void;
  private readonly onCellClick?: (cell: GridCell, event: PointerEvent) => void;
  private readonly onFrame?: (time: number) => void;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrame: number | null = null;
  private running = false;
  private zoom = 1;
  private selectedCell: GridCell | null = null;

  private readonly handleResize = (): void => this.resize();
  private readonly handlePointerMove = (event: PointerEvent): void => this.updatePointer(event);
  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.updatePointer(event);
    if (event.button === 0 && this.selectedCell) this.onCellClick?.(this.selectedCell, event);
  };
  private readonly handlePointerLeave = (): void => this.selectCell(null);
  private readonly handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.setZoom(zoomFromWheel(this.zoom, event.deltaY));
  };
  private readonly handleZoomOut = (): void => this.setZoom(this.zoom - CAMERA_ZOOM_STEP);
  private readonly handleZoomIn = (): void => this.setZoom(this.zoom + CAMERA_ZOOM_STEP);
  private readonly handleZoomReset = (): void => this.fitBoard();
  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.stop();
  };
  private readonly handleContextRestored = (): void => {
    this.resize();
    this.start();
  };
  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  };

  constructor(options: SceneManagerOptions) {
    this.canvas = options.canvas;
    this.dimensions = options.dimensions ?? DEFAULT_GRID_DIMENSIONS;
    this.selectedCellOutput = options.selectedCellOutput ?? null;
    this.zoomOutButton = document.querySelector<HTMLButtonElement>('#zoom-out');
    this.zoomInButton = document.querySelector<HTMLButtonElement>('#zoom-in');
    this.zoomResetButton = document.querySelector<HTMLButtonElement>('#zoom-reset');
    this.onCellHover = options.onCellHover;
    this.onCellClick = options.onCellClick;
    this.onFrame = options.onFrame;
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.scene.background = new Color(0x111827);

    this.camera.position.set(10, 13, 10);
    this.camera.lookAt(0, 0, 0);

    const ambient = new AmbientLight(0xc7d7ee, 1.55);
    const keyLight = new DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(-5, 11, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(ambient, keyLight);

    this.gridView = new GridView(this.scene, this.dimensions);
    this.bindEvents();
    this.resize();
    this.setZoom(1);
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    const renderFrame = (): void => {
      if (!this.running) {
        return;
      }

      this.onFrame?.(performance.now());
      this.renderer.render(this.scene, this.camera);
      this.animationFrame = window.requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  stop(): void {
    this.running = false;
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  resize(): void {
    const bounds = this.canvas.getBoundingClientRect();
    const width = Math.floor(bounds.width || this.canvas.clientWidth);
    const height = Math.floor(bounds.height || this.canvas.clientHeight);

    if (width < 1 || height < 1) {
      return;
    }

    this.renderer.setSize(width, height, false);
    this.updateCameraFrustum(width / height);
  }

  dispose(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (typeof ResizeObserver === 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }

    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.zoomOutButton?.removeEventListener('click', this.handleZoomOut);
    this.zoomInButton?.removeEventListener('click', this.handleZoomIn);
    this.zoomResetButton?.removeEventListener('click', this.handleZoomReset);
    disposeSceneResources(this.scene);
    this.renderer.dispose();
  }

  fitBoard(): void {
    this.camera.position.set(10, 13, 10);
    this.camera.lookAt(0, 0, 0);
    this.setZoom(1);
  }

  getRenderStats(): {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
    zoom: number;
    selectedCell: GridCell | null;
  } {
    return {
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      zoom: this.zoom,
      selectedCell: this.selectedCell,
    };
  }

  getZoom(): number {
    return this.zoom;
  }

  getSelectedCell(): GridCell | null {
    return this.selectedCell;
  }

  renderNow(): void { this.renderer.render(this.scene, this.camera); }

  private bindEvents(): void {
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.zoomOutButton?.addEventListener('click', this.handleZoomOut);
    this.zoomInButton?.addEventListener('click', this.handleZoomIn);
    this.zoomResetButton?.addEventListener('click', this.handleZoomReset);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
    } else {
      window.addEventListener('resize', this.handleResize);
    }
  }

  private updatePointer(event: PointerEvent): void {
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) {
      this.selectCell(null);
      return;
    }

    const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const normalizedY = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    if (normalizedX < -1 || normalizedX > 1 || normalizedY < -1 || normalizedY > 1) {
      this.selectCell(null);
      return;
    }

    this.pointer.set(normalizedX, normalizedY);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersections = this.raycaster.intersectObjects(this.gridView.pickTargets, false);
    this.selectCell(pickGridCell(intersections, this.dimensions));
  }

  private selectCell(cell: GridCell | null): void {
    const changed = this.selectedCell?.x !== cell?.x || this.selectedCell?.y !== cell?.y;
    this.selectedCell = cell;
    this.gridView.setSelectedCell(cell);
    if (changed) this.onCellHover?.(cell);
    if (this.selectedCellOutput) {
      this.selectedCellOutput.textContent = cell
        ? `Selected cell: ${cell.x}, ${cell.y}`
        : 'Selected cell: none';
    }
  }

  private updateCameraFrustum(aspect = this.currentAspect()): void {
    const frustum = orthographicFrustum(BASE_FRUSTUM_HEIGHT, this.zoom, aspect);
    this.camera.left = frustum.left;
    this.camera.right = frustum.right;
    this.camera.top = frustum.top;
    this.camera.bottom = frustum.bottom;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  private setZoom(zoom: number): void {
    this.zoom = Math.min(MAX_CAMERA_ZOOM, Math.max(MIN_CAMERA_ZOOM, zoom));
    if (this.zoomOutButton) this.zoomOutButton.disabled = this.zoom <= MIN_CAMERA_ZOOM;
    if (this.zoomInButton) this.zoomInButton.disabled = this.zoom >= MAX_CAMERA_ZOOM;
    if (this.zoomResetButton) this.zoomResetButton.textContent = `${Math.round(this.zoom * 100)}%`;
    this.updateCameraFrustum();
  }

  private currentAspect(): number {
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width > 0 && bounds.height > 0) {
      return bounds.width / bounds.height;
    }

    return 1;
  }
}
