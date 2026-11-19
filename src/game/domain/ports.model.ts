import type { Component, Direction, ItemType } from './component.model';

export type Port = Readonly<{
  componentId: string;
  cell: Readonly<{ x: number; y: number }>;
  direction: Direction;
  kind: 'INPUT' | 'OUTPUT';
  acceptedTypes?: readonly ItemType[];
}>;

const rightDirection: Record<Direction, Direction> = { N: 'E', E: 'S', S: 'W', W: 'N' };
const leftDirection: Record<Direction, Direction> = { N: 'W', W: 'S', S: 'E', E: 'N' };
const opposite: Record<Direction, Direction> = { N: 'S', E: 'W', S: 'N', W: 'E' };
const offsets: Record<Direction, Readonly<{ x: number; y: number }>> = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

export const turnRight = (direction: Direction): Direction => rightDirection[direction];
export const turnLeft = (direction: Direction): Direction => leftDirection[direction];
export const oppositeDirection = (direction: Direction): Direction => opposite[direction];

const step = (cell: Port['cell'], direction: Direction) => ({
  x: cell.x + offsets[direction].x,
  y: cell.y + offsets[direction].y,
});

export function portsFor(component: Component): readonly Port[] {
  const { position, direction, id } = component;
  const inputDirection = oppositeDirection(direction);
  const input = {
    componentId: id,
    cell: step(position, inputDirection),
    direction: inputDirection,
    kind: 'INPUT' as const,
  };
  const output = {
    componentId: id,
    cell: step(position, direction),
    direction,
    kind: 'OUTPUT' as const,
  };

  if (component.type === 'SOURCE') return [output];
  if (component.type === 'OUTPUT') {
    return [{ ...input, acceptedTypes: component.acceptedTypes }];
  }
  if (component.type === 'DIVERTER' || component.type === 'SPLITTER') {
    const side = turnRight(direction);
    return [
      input,
      output,
      { componentId: id, cell: step(position, side), direction: side, kind: 'OUTPUT' },
    ];
  }
  if (component.type === 'MERGER' || component.type === 'ASSEMBLER') {
    const sideIn = turnLeft(direction);
    return [
      input,
      { componentId: id, cell: step(position, sideIn), direction: sideIn, kind: 'INPUT' },
      output,
    ];
  }
  return [input, output];
}

export function findPortConnections(
  components: readonly Component[],
): readonly Readonly<{ from: Port; to: Port }>[] {
  const ports = components.flatMap(portsFor);
  const componentById = new Map(components.map((component) => [component.id, component]));
  return ports
    .filter((from) => from.kind === 'OUTPUT')
    .flatMap((from) =>
      ports
        .filter((to) => {
          if (
            to.kind !== 'INPUT' ||
            to.componentId === from.componentId ||
            to.direction !== oppositeDirection(from.direction)
          ) {
            return false;
          }
          const fromComponent = componentById.get(from.componentId);
          const toComponent = componentById.get(to.componentId);
          return Boolean(
            fromComponent &&
              toComponent &&
              from.cell.x === toComponent.position.x &&
              from.cell.y === toComponent.position.y &&
              to.cell.x === fromComponent.position.x &&
              to.cell.y === fromComponent.position.y,
          );
        })
        .map((to) => ({ from, to })),
    );
}
