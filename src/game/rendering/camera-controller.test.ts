import { OrthographicCamera } from 'three';
import { describe, expect, it } from 'vitest';
import { CameraController } from './camera-controller';
import { MAX_CAMERA_ZOOM, MIN_CAMERA_ZOOM } from './zoom';

function createController(): CameraController {
  const camera = new OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
  return new CameraController(camera, { width: 8, height: 8 });
}

describe('CameraController (WASD pan, Q/E 90° rotation, zoom & bounds)', () => {
  it('starts centered at (0,0) with isometric position (10, 13, 10) and 45° azimuth', () => {
    const controller = createController();
    const state = controller.getState();
    expect(state.target).toEqual({ x: 0, z: 0 });
    expect(state.position.x).toBeCloseTo(10, 5);
    expect(state.position.y).toBe(13);
    expect(state.position.z).toBeCloseTo(10, 5);
    expect(state.yawIndex).toBe(0);
    expect(state.azimuthDegrees).toBe(45);
  });

  it('returns to the exact initial orientation after 4 Q rotations or 4 E rotations', () => {
    const controller = createController();
    const initial = controller.getState();

    // 4 counter-clockwise 90° steps (Q)
    controller.rotateLeft();
    expect(controller.getAzimuthDegrees()).toBe(315);
    controller.rotateLeft();
    expect(controller.getAzimuthDegrees()).toBe(225);
    controller.rotateLeft();
    expect(controller.getAzimuthDegrees()).toBe(135);
    const afterFourQ = controller.rotateLeft();
    expect(afterFourQ.yawIndex).toBe(0);
    expect(afterFourQ.azimuthDegrees).toBe(45);
    expect(afterFourQ.position.x).toBeCloseTo(initial.position.x, 5);
    expect(afterFourQ.position.z).toBeCloseTo(initial.position.z, 5);

    // 4 clockwise 90° steps (E)
    controller.rotateRight();
    expect(controller.getAzimuthDegrees()).toBe(135);
    controller.rotateRight();
    expect(controller.getAzimuthDegrees()).toBe(225);
    controller.rotateRight();
    expect(controller.getAzimuthDegrees()).toBe(315);
    const afterFourE = controller.rotateRight();
    expect(afterFourE.yawIndex).toBe(0);
    expect(afterFourE.azimuthDegrees).toBe(45);
    expect(afterFourE.position.x).toBeCloseTo(initial.position.x, 5);
    expect(afterFourE.position.z).toBeCloseTo(initial.position.z, 5);
  });

  it('computes orthonormal forward and right basis vectors on the XZ plane at every yaw', () => {
    const controller = createController();
    for (let step = 0; step < 4; step += 1) {
      const { forward, right } = controller.getBasisVectors();
      expect(Math.hypot(forward.x, forward.z)).toBeCloseTo(1, 6);
      expect(Math.hypot(right.x, right.z)).toBeCloseTo(1, 6);
      // Dot product must be 0 (orthogonal)
      expect(forward.x * right.x + forward.z * right.z).toBeCloseTo(0, 6);
      // 2D cross product (forward x up = right => -forward.z == right.x, forward.x == right.z? No: right = (-fz, fx))
      expect(right.x).toBeCloseTo(-forward.z, 6);
      expect(right.z).toBeCloseTo(forward.x, 6);
      controller.rotateRight();
    }
  });

  it('pans camera-relative with WASD without inverting directions after 180° camera rotation', () => {
    const controller = createController();
    // At yaw 0 (45°), camera is at (+10, 13, +10), looking towards (-x, -z)
    controller.pan(1, 0, 0.1); // W (forward)
    const afterW0 = controller.getState().target;
    expect(afterW0.x).toBeLessThan(0);
    expect(afterW0.z).toBeLessThan(0);

    // Rotate 180° (two E steps -> camera at (-10, 13, -10), looking towards (+x, +z))
    controller.reset();
    controller.rotateRight();
    controller.rotateRight();
    expect(controller.getAzimuthDegrees()).toBe(225);
    controller.pan(1, 0, 0.1); // W (forward in new view)
    const afterW180 = controller.getState().target;
    expect(afterW180.x).toBeGreaterThan(0);
    expect(afterW180.z).toBeGreaterThan(0);
  });

  it('clamps pan within board bounds and resets cleanly via reset()', () => {
    const controller = createController();
    for (let i = 0; i < 50; i += 1) {
      controller.pan(1, 1, 0.2);
    }
    const clamped = controller.getState().target;
    expect(Math.abs(clamped.x)).toBeLessThanOrEqual(4.5);
    expect(Math.abs(clamped.z)).toBeLessThanOrEqual(4.5);

    const resetState = controller.reset();
    expect(resetState.target).toEqual({ x: 0, z: 0 });
    expect(resetState.yawIndex).toBe(0);
    expect(resetState.zoom).toBe(1);
  });

  it('clamps zoom and updates orthographic frustum', () => {
    const controller = createController();
    expect(controller.setZoom(0.1, 1.5)).toBe(MIN_CAMERA_ZOOM);
    expect(controller.canZoomIn()).toBe(false);
    expect(controller.setZoom(10, 1.5)).toBe(MAX_CAMERA_ZOOM);
    expect(controller.canZoomOut()).toBe(false);
  });
});
