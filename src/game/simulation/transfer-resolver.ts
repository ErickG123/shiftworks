import type { GridCell } from '../domain/grid.model';
import type { ItemInstance } from '../domain/simulation.model';

export type TransferProposal = Readonly<{
  sourceId: string;
  destinationId: string;
  source: GridCell;
  destination: GridCell;
  item: ItemInstance;
}>;
export type TransferRejection = Readonly<{ proposal: TransferProposal; reason: 'DESTINATION_OCCUPIED' | 'DESTINATION_RESERVED' }>;
export type TransferResolution = Readonly<{ accepted: readonly TransferProposal[]; rejected: readonly TransferRejection[] }>;

function compareNumber(a: number, b: number): number { return a - b; }
function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }

export function compareTransferPriority(a: TransferProposal, b: TransferProposal): number {
  return compareNumber(a.destination.y, b.destination.y)
    || compareNumber(a.destination.x, b.destination.x)
    || compareNumber(a.source.y, b.source.y)
    || compareNumber(a.source.x, b.source.x)
    || compareNumber(a.item.sequence, b.item.sequence)
    || compareText(a.item.id, b.item.id)
    || compareText(a.sourceId, b.sourceId)
    || compareText(a.destinationId, b.destinationId);
}

/** Resolves all proposals against one occupancy snapshot and reserves each destination at most once. */
export function resolveTransferReservations(
  proposals: readonly TransferProposal[],
  occupiedDestinationIds: ReadonlySet<string>,
): TransferResolution {
  const accepted: TransferProposal[] = [];
  const rejected: TransferRejection[] = [];
  const reserved = new Set<string>();
  const ordered = [...proposals].sort(compareTransferPriority);

  for (const proposal of ordered) {
    if (occupiedDestinationIds.has(proposal.destinationId)) {
      rejected.push(Object.freeze({ proposal, reason: 'DESTINATION_OCCUPIED' }));
      continue;
    }
    if (reserved.has(proposal.destinationId)) {
      rejected.push(Object.freeze({ proposal, reason: 'DESTINATION_RESERVED' }));
      continue;
    }
    reserved.add(proposal.destinationId);
    accepted.push(proposal);
  }

  return Object.freeze({ accepted: Object.freeze(accepted), rejected: Object.freeze(rejected) });
}
