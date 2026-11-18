import { describe, expect, it } from 'vitest';
import type { ItemInstance } from '../domain/simulation.model';
import type { TransferProposal } from './transfer-resolver';
import { resolveTransferReservations } from './transfer-resolver';

const item = (id: string, sequence: number): ItemInstance => ({ id, sequence, type: 'BLUE_BLANK', bornTick: 1, route: null });
const proposal = (sourceId: string, source: { x: number; y: number }, itemId: string, sequence: number): TransferProposal => ({ sourceId, destinationId: 'target', source, destination: { x: 2, y: 1 }, item: item(itemId, sequence) });

describe('stable destination reservation', () => {
  it('selects one deterministic winner independent of proposal input order', () => {
    const proposals = [proposal('right', { x: 1, y: 2 }, 'right:0', 0), proposal('left', { x: 0, y: 1 }, 'left:0', 0)];
    const forward = resolveTransferReservations(proposals, new Set());
    const reversed = resolveTransferReservations([...proposals].reverse(), new Set());
    expect(forward.accepted.map((entry) => entry.sourceId)).toEqual(['left']);
    expect(reversed.accepted.map((entry) => entry.sourceId)).toEqual(['left']);
    expect(forward.rejected[0]?.reason).toBe('DESTINATION_RESERVED');
  });

  it('rejects all proposals to an occupied destination without accepting any', () => {
    const result = resolveTransferReservations([proposal('left', { x: 0, y: 1 }, 'left:0', 0)], new Set(['target']));
    expect(result.accepted).toEqual([]);
    expect(result.rejected[0]?.reason).toBe('DESTINATION_OCCUPIED');
  });
});
