import type { OrthographicCamera } from 'three';
import type { GridDimensions } from '../domain/grid.model';
import { DEFAULT_CELL_SIZE, DEFAULT_GRID_DIMENSIONS } from '../domain/grid.model';
import {
  CAMERA_ZOOM_STEP,
  clampCameraZoom,
  MAX_CAMERA_ZOOM,
  MIN_CAMERA_ZOOM,
  orthographicFrustum,
  zoomFromWheel,
} from './zoom';

export type CameraYawIndex = 0 | 1 | 2 | 3;
export type PanKey = 'W' | 'A' | 'S' | 'D';

export type PlanarVector = Readonly<{ x: number; z: number }>;

export type CameraStateSnapshot = Readonly<{
  target: PlanarVector;
  position: Readonly<{ x: number; y: number; z: number }>;
  yawIndex: CameraYawIndex;
  azimuthDegrees: 45 | 135 | 225 | 315;
  zoom: number;
}>;

export const DEFAULT_CAMERA_OFFSET_XZ = 10;
export const DEFAULT_CAMERA_HEIGHT = 13;
export const DEFAULT_ORBIT_RADIUS = Math.hypot(
  DEFAULT_CAMERA_OFFSET_XZ,
  DEFAULT_CAMERA_OFFSET_XZ,
);
export const INITIAL_AZIMUTH_RADIANS = Math.PI / 4;
export const DEFAULT_PAN_SPEED = 6.5;
export const INITIAL_KEY_TAP_DT = 0.08;
export const BASE_FRUSTUM_HEIGHT = 10.8;

const YAW_DEGREES: readonly (45 | 135 | 225 | 315)[] = [45, 135, 225, 315];

export function maxPanForDimensions(
  dimensions: GridDimensions = DEFAULT_GRID_DIMENSIONS,
  cellSize = DEFAULT_CELL_SIZE,
): Readonly<{ maxX: number; maxZ: number }> {
  return Object.freeze({
    maxX: Math.max(2, (dimensions.width * cellSize) / 2 + 0.5),
    maxZ: Math.max(2, (dimensions.height * cellSize) / 2 + 0.5),
  });
}

export class CameraController {
  private targetX = 0;
  private targetZ = 0;
  private yawIndex: CameraYawIndex = 0;
  private zoom = 1;
  private readonly pressedKeys = new Set<PanKey>();
  private readonly maxPan: Readonly<{ maxX: number; maxZ: number }>;

  constructor(
    private readonly camera: OrthographicCamera,
    dimensions: GridDimensions = DEFAULT_GRID_DIMENSIONS,
    private readonly panSpeed = DEFAULT_PAN_SPEED,
  ) {
    this.maxPan = maxPanForDimensions(dimensions);
    this.applyToCamera();
  }

  getState(): CameraStateSnapshot {
    const pos = this.computeCameraPosition();
    return Object.freeze({
      target: Object.freeze({ x: this.targetX, z: this.targetZ }),
      position: pos,
      yawIndex: this.yawIndex,
      azimuthDegrees: YAW_DEGREES[this.yawIndex]!,
      zoom: this.zoom,
    });
  }

  getZoom(): number {
    return this.zoom;
  }

  getYawIndex(): CameraYawIndex {
    return this.yawIndex;
  }

  getAzimuthRadians(): number {
    return INITIAL_AZIMUTH_RADIANS + this.yawIndex * (Math.PI / 2);
  }

  getAzimuthDegrees(): 45 | 135 | 225 | 315 {
    return YAW_DEGREES[this.yawIndex]!;
  }

  getBasisVectors(): Readonly<{ forward: PlanarVector; right: PlanarVector }> {
    const theta = this.getAzimuthRadians();
    const forward = Object.freeze({
      x: -Math.cos(theta),
      z: -Math.sin(theta),
    });
    const right = Object.freeze({
      x: Math.sin(theta),
      z: -Math.cos(theta),
    });
    return Object.freeze({ forward, right });
  }

  /**
   * Q key: Rotate camera 90 degrees counter-clockwise around the board target.
   */
  rotateLeft(): CameraStateSnapshot {
    this.yawIndex = ((this.yawIndex + 3) % 4) as CameraYawIndex;
    this.applyToCamera();
    return this.getState();
  }

  /**
   * E key: Rotate camera 90 degrees clockwise around the board target.
   */
  rotateRight(): CameraStateSnapshot {
    this.yawIndex = ((this.yawIndex + 1) % 4) as CameraYawIndex;
    this.applyToCamera();
    return this.getState();
  }

  /**
   * Pans the camera target on the XZ plane relative to current camera orientation.
   * forwardAxis: +1 for W (up/forward), -1 for S (down/backward)
   * rightAxis: +1 for D (right), -1 for A (left)
   */
  pan(forwardAxis: number, rightAxis: number, dtSeconds: number): boolean {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return false;
    if (forwardAxis === 0 && rightAxis === 0) return false;

    const clampedDt = Math.min(dtSeconds, 0.25);
    const length = Math.hypot(forwardAxis, rightAxis);
    const normForward = length > 0 ? forwardAxis / length : 0;
    const normRight = length > 0 ? rightAxis / length : 0;

    const { forward, right } = this.getBasisVectors();
    const stepDistance = this.panSpeed * clampedDt;
    const dx = (forward.x * normForward + right.x * normRight) * stepDistance;
    const dz = (forward.z * normForward + right.z * normRight) * stepDistance;

    const nextX = Math.max(-this.maxPan.maxX, Math.min(this.maxPan.maxX, this.targetX + dx));
    const nextZ = Math.max(-this.maxPan.maxZ, Math.min(this.maxPan.maxZ, this.targetZ + dz));

    if (nextX === this.targetX && nextZ === this.targetZ) return false;
    this.targetX = nextX;
    this.targetZ = nextZ;
    this.applyToCamera();
    return true;
  }

  setPanKey(key: PanKey, pressed: boolean, applyInitialTap = false): boolean {
    const alreadyPressed = this.pressedKeys.has(key);
    if (pressed) {
      this.pressedKeys.add(key);
      if (!alreadyPressed && applyInitialTap) {
        return this.stepFromKeys(INITIAL_KEY_TAP_DT);
      }
      return false;
    } else {
      this.pressedKeys.delete(key);
      return false;
    }
  }

  clearPressedKeys(): void {
    this.pressedKeys.clear();
  }

  hasActivePanKeys(): boolean {
    return this.pressedKeys.size > 0;
  }

  update(dtSeconds: number): boolean {
    if (this.pressedKeys.size === 0) return false;
    return this.stepFromKeys(dtSeconds);
  }

  setZoom(zoom: number, aspect = 1): number {
    this.zoom = clampCameraZoom(zoom);
    this.updateFrustum(aspect);
    return this.zoom;
  }

  zoomByWheel(deltaY: number, aspect = 1): number {
    return this.setZoom(zoomFromWheel(this.zoom, deltaY), aspect);
  }

  zoomIn(aspect = 1): number {
    return this.setZoom(this.zoom - CAMERA_ZOOM_STEP, aspect);
  }

  zoomOut(aspect = 1): number {
    return this.setZoom(this.zoom + CAMERA_ZOOM_STEP, aspect);
  }

  canZoomIn(): boolean {
    return this.zoom > MIN_CAMERA_ZOOM + 1e-6;
  }

  canZoomOut(): boolean {
    return this.zoom < MAX_CAMERA_ZOOM - 1e-6;
  }

  reset(aspect = 1): CameraStateSnapshot {
    this.targetX = 0;
    this.targetZ = 0;
    this.yawIndex = 0;
    this.pressedKeys.clear();
    this.applyToCamera();
    this.setZoom(1, aspect);
    return this.getState();
  }

  updateFrustum(aspect: number): void {
    const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
    const frustum = orthographicFrustum(BASE_FRUSTUM_HEIGHT, this.zoom, safeAspect);
    this.camera.left = frustum.left;
    this.camera.right = frustum.right;
    this.camera.top = frustum.top;
    this.camera.bottom = frustum.bottom;
    this.camera.updateProjectionMatrix();
  }

  applyToCamera(): void {
    const pos = this.computeCameraPosition();
    this.camera.position.set(pos.x, pos.y, pos.z);
    this.camera.lookAt(this.targetX, 0, this.targetZ);
    this.camera.updateMatrixWorld();
  }

  private stepFromKeys(dtSeconds: number): boolean {
    const forwardAxis =
      (this.pressedKeys.has('W') ? 1 : 0) - (this.pressedKeys.has('S') ? 1 : 0);
    const rightAxis =
      (this.pressedKeys.has('D') ? 1 : 0) - (this.pressedKeys.has('A') ? 1 : 0);
    return this.pan(forwardAxis, rightAxis, dtSeconds);
  }

  private computeCameraPosition(): Readonly<{ x: number; y: number; z: number }> {
    const theta = this.getAzimuthRadians();
    const x = Number((this.targetX + Math.cos(theta) * DEFAULT_ORBIT_RADIUS).toFixed(6));
    const z = Number((this.targetZ + Math.sin(theta) * DEFAULT_ORBIT_RADIUS).toFixed(6));
    return Object.freeze({ x, y: DEFAULT_CAMERA_HEIGHT, z });
  }
}
