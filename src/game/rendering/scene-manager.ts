import {
  AmbientLight,
  Color,
  DirectionalLight,
  OrthographicCamera,
  PCFSoftShadowMap,
  Raycaster,
  SRGBColorSpace,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';
import {
  DEFAULT_GRID_DIMENSIONS,
  type GridCell,
  type GridDimensions,
} from '../domain/grid.model';
import { pickGridCell } from '../interaction/grid-picking';
import {
  isGlobalShortcutAllowed,
  resolveShortcutAction,
} from '../interaction/keyboard-shortcuts';
import { i18n } from '../../i18n';
import {
  CameraController,
  type CameraStateSnapshot,
  type PanKey,
} from './camera-controller';
import { disposeSceneResources, GridView } from './grid-view';

export type SceneManagerOptions = Readonly<{
  canvas: HTMLCanvasElement;
  selectedCellOutput?: HTMLOutputElement | null;
  dimensions?: GridDimensions;
  onCellHover?: (cell: GridCell | null) => void;
  onCellClick?: (cell: GridCell, event: PointerEvent) => void;
  onFrame?: (time: number) => void;
}>;

const MAX_PIXEL_RATIO = 2;

export class SceneManager {
  readonly scene = new Scene();
  readonly camera = new OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
  readonly renderer: WebGLRenderer;
  readonly dimensions: GridDimensions;
  readonly canvas: HTMLCanvasElement;
  readonly cameraController: CameraController;

  private readonly gridView: GridView;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private hasActivePointer = false;
  private readonly selectedCellOutput: HTMLOutputElement | null;
  private readonly zoomOutButton: HTMLButtonElement | null;
  private readonly zoomInButton: HTMLButtonElement | null;
  private readonly zoomResetButton: HTMLButtonElement | null;
  private readonly rotateLeftButton: HTMLButtonElement | null;
  private readonly rotateRightButton: HTMLButtonElement | null;
  private readonly cameraAngleOutput: HTMLElement | null;
  private readonly onCellHover?: (cell: GridCell | null) => void;
  private readonly onCellClick?: (cell: GridCell, event: PointerEvent) => void;
  private readonly onFrame?: (time: number) => void;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrame: number | null = null;
  private lastFrameTime: number | null = null;
  private running = false;
  private selectedCell: GridCell | null = null;

  private readonly handleResize = (): void => this.resize();
  private readonly handlePointerMove = (event: PointerEvent): void => this.updatePointer(event);
  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.canvas.focus({ preventScroll: true });
    this.updatePointer(event);
    if (event.button === 0 && this.selectedCell) {
      this.onCellClick?.(this.selectedCell, event);
    }
  };
  private readonly handlePointerLeave = (): void => {
    this.hasActivePointer = false;
    this.selectCell(null);
  };
  private readonly handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.cameraController.zoomByWheel(event.deltaY, this.currentAspect());
    this.syncCameraUi();
    this.recomputeRaycastIfPointerActive();
    this.renderNow();
  };
  private readonly handleZoomOut = (): void => {
    this.cameraController.zoomOut(this.currentAspect());
    this.syncCameraUi();
    this.recomputeRaycastIfPointerActive();
    this.renderNow();
  };
  private readonly handleZoomIn = (): void => {
    this.cameraController.zoomIn(this.currentAspect());
    this.syncCameraUi();
    this.recomputeRaycastIfPointerActive();
    this.renderNow();
  };
  private readonly handleZoomReset = (): void => this.fitBoard();
  private readonly handleRotateLeft = (): void => {
    this.rotateCameraLeft();
  };
  private readonly handleRotateRight = (): void => {
    this.rotateCameraRight();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const action = resolveShortcutAction(event);
    if (!action) return;

    // Never handle R here: R is exclusively reserved for piece/ghost rotation
    if (
      action === 'ROTATE_PIECE' ||
      action === 'CANCEL_TOOL' ||
      action === 'TOGGLE_SIMULATION'
    ) {
      return;
    }

    const isPanAction =
      action === 'CAMERA_PAN_FORWARD' ||
      action === 'CAMERA_PAN_BACKWARD' ||
      action === 'CAMERA_PAN_LEFT' ||
      action === 'CAMERA_PAN_RIGHT';

    if (!isGlobalShortcutAllowed(event, { allowRepeat: isPanAction })) {
      return;
    }

    if (action === 'CAMERA_ROTATE_LEFT') {
      event.preventDefault();
      this.rotateCameraLeft();
      return;
    }

    if (action === 'CAMERA_ROTATE_RIGHT') {
      event.preventDefault();
      this.rotateCameraRight();
      return;
    }

    if (action === 'CAMERA_CENTER') {
      event.preventDefault();
      this.fitBoard();
      return;
    }

    const panKey = this.actionToPanKey(action);
    if (panKey) {
      event.preventDefault();
      const moved = this.cameraController.setPanKey(panKey, true, !event.repeat);
      if (moved) {
        this.recomputeRaycastIfPointerActive();
        this.renderNow();
      }
    }
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const action = resolveShortcutAction(event);
    if (!action) return;
    const panKey = this.actionToPanKey(action);
    if (panKey) {
      this.cameraController.setPanKey(panKey, false);
    }
  };

  private readonly handleWindowBlur = (): void => {
    this.cameraController.clearPressedKeys();
  };

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.stop();
  };
  private readonly handleContextRestored = (): void => {
    this.resize();
    this.start();
  };
  private readonly handleVisibilityChange = (): void => {
    this.cameraController.clearPressedKeys();
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
    this.rotateLeftButton = document.querySelector<HTMLButtonElement>('#camera-rotate-left');
    this.rotateRightButton = document.querySelector<HTMLButtonElement>('#camera-rotate-right');
    this.cameraAngleOutput = document.querySelector<HTMLElement>('#camera-angle-indicator');
    this.onCellHover = options.onCellHover;
    this.onCellClick = options.onCellClick;
    this.onFrame = options.onFrame;
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.scene.background = new Color(0x0d1526);

    this.cameraController = new CameraController(this.camera, this.dimensions);

    const ambient = new AmbientLight(0xd8e6f8, 1.7);
    const keyLight = new DirectionalLight(0xffffff, 2.35);
    keyLight.position.set(-6, 13, 8);
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
    this.fitBoard();
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastFrameTime = performance.now();
    const renderFrame = (): void => {
      if (!this.running) {
        return;
      }

      const now = performance.now();
      const dtSeconds =
        this.lastFrameTime !== null ? Math.max(0, (now - this.lastFrameTime) / 1000) : 0;
      this.lastFrameTime = now;

      if (this.cameraController.update(dtSeconds)) {
        this.recomputeRaycastIfPointerActive();
      }

      this.onFrame?.(now);
      this.renderer.render(this.scene, this.camera);
      this.animationFrame = window.requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  stop(): void {
    this.running = false;
    this.lastFrameTime = null;
    this.cameraController.clearPressedKeys();
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
    this.cameraController.updateFrustum(width / height);
    this.renderer.render(this.scene, this.camera);
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
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    this.zoomOutButton?.removeEventListener('click', this.handleZoomOut);
    this.zoomInButton?.removeEventListener('click', this.handleZoomIn);
    this.zoomResetButton?.removeEventListener('click', this.handleZoomReset);
    this.rotateLeftButton?.removeEventListener('click', this.handleRotateLeft);
    this.rotateRightButton?.removeEventListener('click', this.handleRotateRight);
    disposeSceneResources(this.scene);
    this.renderer.dispose();
  }

  fitBoard(): void {
    this.cameraController.reset(this.currentAspect());
    this.syncCameraUi();
    this.recomputeRaycastIfPointerActive();
    this.renderNow();
  }

  rotateCameraLeft(): CameraStateSnapshot {
    const state = this.cameraController.rotateLeft();
    this.syncCameraUi();
    this.recomputeRaycastIfPointerActive();
    this.renderNow();
    return state;
  }

  rotateCameraRight(): CameraStateSnapshot {
    const state = this.cameraController.rotateRight();
    this.syncCameraUi();
    this.recomputeRaycastIfPointerActive();
    this.renderNow();
    return state;
  }

  getCameraState(): CameraStateSnapshot {
    return this.cameraController.getState();
  }

  getRenderStats(): {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
    zoom: number;
    selectedCell: GridCell | null;
    camera: CameraStateSnapshot;
  } {
    return {
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      zoom: this.cameraController.getZoom(),
      selectedCell: this.selectedCell,
      camera: this.cameraController.getState(),
    };
  }

  getZoom(): number {
    return this.cameraController.getZoom();
  }

  getSelectedCell(): GridCell | null {
    return this.selectedCell;
  }

  refreshSelectedCellLabel(): void {
    this.syncCameraUi();
    if (!this.selectedCellOutput) return;
    this.selectedCellOutput.textContent = this.selectedCell
      ? i18n.t('common.selectedCell', { x: this.selectedCell.x, y: this.selectedCell.y })
      : i18n.t('common.selectedCellNone');
  }

  renderNow(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
    this.zoomOutButton?.addEventListener('click', this.handleZoomOut);
    this.zoomInButton?.addEventListener('click', this.handleZoomIn);
    this.zoomResetButton?.addEventListener('click', this.handleZoomReset);
    this.rotateLeftButton?.addEventListener('click', this.handleRotateLeft);
    this.rotateRightButton?.addEventListener('click', this.handleRotateRight);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
    } else {
      window.addEventListener('resize', this.handleResize);
    }
  }

  private actionToPanKey(
    action: ReturnType<typeof resolveShortcutAction>,
  ): PanKey | null {
    if (action === 'CAMERA_PAN_FORWARD') return 'W';
    if (action === 'CAMERA_PAN_BACKWARD') return 'S';
    if (action === 'CAMERA_PAN_LEFT') return 'A';
    if (action === 'CAMERA_PAN_RIGHT') return 'D';
    return null;
  }

  private updatePointer(event: PointerEvent): void {
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) {
      this.hasActivePointer = false;
      this.selectCell(null);
      return;
    }

    const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const normalizedY = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    if (normalizedX < -1 || normalizedX > 1 || normalizedY < -1 || normalizedY > 1) {
      this.hasActivePointer = false;
      this.selectCell(null);
      return;
    }

    this.pointer.set(normalizedX, normalizedY);
    this.hasActivePointer = true;
    this.raycastCurrentPointer();
  }

  private recomputeRaycastIfPointerActive(): void {
    if (!this.hasActivePointer) return;
    this.raycastCurrentPointer();
  }

  private raycastCurrentPointer(): void {
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersections = this.raycaster.intersectObjects(this.gridView.pickTargets, false);
    this.selectCell(pickGridCell(intersections, this.dimensions));
  }

  private selectCell(cell: GridCell | null): void {
    const changed = this.selectedCell?.x !== cell?.x || this.selectedCell?.y !== cell?.y;
    this.selectedCell = cell;
    this.gridView.setSelectedCell(cell);
    if (changed) this.onCellHover?.(cell);
    this.refreshSelectedCellLabel();
  }

  private syncCameraUi(): void {
    const zoom = this.cameraController.getZoom();
    if (this.zoomOutButton) {
      this.zoomOutButton.disabled = !this.cameraController.canZoomOut();
    }
    if (this.zoomInButton) {
      this.zoomInButton.disabled = !this.cameraController.canZoomIn();
    }
    if (this.zoomResetButton) {
      const magnification = Math.round((1 / zoom) * 100);
      this.zoomResetButton.textContent = `${magnification}%`;
    }
    if (this.cameraAngleOutput) {
      this.cameraAngleOutput.textContent = i18n.t('camera.angleLabel', {
        angle: this.cameraController.getAzimuthDegrees(),
      });
    }
  }

  private currentAspect(): number {
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width > 0 && bounds.height > 0) {
      return bounds.width / bounds.height;
    }

    return 1;
  }
}
