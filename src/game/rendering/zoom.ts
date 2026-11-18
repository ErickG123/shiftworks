export const MIN_CAMERA_ZOOM = 0.65;
export const MAX_CAMERA_ZOOM = 1.6;
export const CAMERA_ZOOM_STEP = 0.1;

export type OrthographicFrustum = Readonly<{
  left: number;
  right: number;
  top: number;
  bottom: number;
}>;

export function clampCameraZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) {
    return 1;
  }

  return Math.min(MAX_CAMERA_ZOOM, Math.max(MIN_CAMERA_ZOOM, zoom));
}

export function zoomFromWheel(zoom: number, deltaY: number): number {
  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return clampCameraZoom(zoom);
  }

  const direction = deltaY > 0 ? 1 : -1;
  return clampCameraZoom(zoom + direction * CAMERA_ZOOM_STEP);
}

export function orthographicFrustum(
  baseHeight: number,
  zoom: number,
  aspect: number,
): OrthographicFrustum {
  if (!Number.isFinite(baseHeight) || baseHeight <= 0) {
    throw new RangeError('Frustum height must be positive and finite.');
  }
  if (!Number.isFinite(aspect) || aspect <= 0) {
    throw new RangeError('Viewport aspect ratio must be positive and finite.');
  }

  const height = baseHeight * clampCameraZoom(zoom);
  const width = height * aspect;
  return Object.freeze({
    left: -width / 2,
    right: width / 2,
    top: height / 2,
    bottom: -height / 2,
  });
}
