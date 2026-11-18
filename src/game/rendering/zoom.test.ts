import { describe, expect, it } from 'vitest';
import {
  clampCameraZoom,
  MAX_CAMERA_ZOOM,
  MIN_CAMERA_ZOOM,
  orthographicFrustum,
  zoomFromWheel,
} from './zoom';

describe('camera zoom bounds', () => {
  it('clamps zoom to the configured minimum and maximum', () => {
    expect(clampCameraZoom(0)).toBe(MIN_CAMERA_ZOOM);
    expect(clampCameraZoom(4)).toBe(MAX_CAMERA_ZOOM);
    expect(clampCameraZoom(Number.NaN)).toBe(1);
  });

  it('moves one step per wheel direction and never escapes its clamp', () => {
    expect(zoomFromWheel(1, 1)).toBeCloseTo(1.1);
    expect(zoomFromWheel(1, -1)).toBeCloseTo(0.9);
    expect(zoomFromWheel(MAX_CAMERA_ZOOM, 120)).toBe(MAX_CAMERA_ZOOM);
    expect(zoomFromWheel(MIN_CAMERA_ZOOM, -120)).toBe(MIN_CAMERA_ZOOM);
    expect(zoomFromWheel(1, 0)).toBe(1);
  });

  it('keeps the orthographic frustum proportional when the viewport resizes', () => {
    expect(orthographicFrustum(10, 1, 2)).toEqual({
      left: -10,
      right: 10,
      top: 5,
      bottom: -5,
    });
    expect(orthographicFrustum(10, 1, 0.5)).toEqual({
      left: -2.5,
      right: 2.5,
      top: 5,
      bottom: -5,
    });
    expect(() => orthographicFrustum(10, 1, 0)).toThrow(RangeError);
  });
});
