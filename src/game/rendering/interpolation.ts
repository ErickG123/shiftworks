export type Position3 = Readonly<{ x: number; y: number; z: number }>;

export function interpolatePosition(from: Position3, to: Position3, progress: number): Position3 {
  const t = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const eased = t * t * (3 - 2 * t);
  return Object.freeze({
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
    z: from.z + (to.z - from.z) * eased,
  });
}
