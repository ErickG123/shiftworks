import type { Component, ItemType, LevelDefinition } from './component.model';
import type { PlayableLevel } from './level-catalog.model';

export type SectorDefinition = Readonly<{
  id: 'SECTOR-01' | 'SECTOR-02' | 'SECTOR-03' | 'SECTOR-04' | 'SECTOR-05';
  titleKey: string;
  levelIds: readonly string[];
}>;

export const CAMPAIGN_SECTORS_V2: readonly SectorDefinition[] = Object.freeze([
  Object.freeze({
    id: 'SECTOR-01',
    titleKey: 'sectors.SECTOR-01',
    levelIds: Object.freeze(['L01', 'L02', 'L03', 'L04']),
  }),
  Object.freeze({
    id: 'SECTOR-02',
    titleKey: 'sectors.SECTOR-02',
    levelIds: Object.freeze(['L05', 'L06', 'L07', 'L08']),
  }),
  Object.freeze({
    id: 'SECTOR-03',
    titleKey: 'sectors.SECTOR-03',
    levelIds: Object.freeze(['L09', 'L10', 'L11', 'L12']),
  }),
  Object.freeze({
    id: 'SECTOR-04',
    titleKey: 'sectors.SECTOR-04',
    levelIds: Object.freeze(['L13', 'L14', 'L15', 'L16']),
  }),
  Object.freeze({
    id: 'SECTOR-05',
    titleKey: 'sectors.SECTOR-05',
    levelIds: Object.freeze(['L17', 'L18', 'L19', 'L20']),
  }),
]);

function makeStraightLineLevel(params: {
  id: string;
  sectorId: SectorDefinition['id'];
  title: string;
  lesson: string;
  tutorial: string;
  sourceSeq: readonly ItemType[];
  intervalTicks: number;
  dockX: number;
  acceptedTypes: readonly ItemType[];
  goals: LevelDefinition['goals'];
  inventory: LevelDefinition['inventory'];
  referenceComponents: readonly Component[];
  twoStarMaxTicks: number;
  threeStarMaxTicks: number;
  threeStarMaxPieces: number;
}): PlayableLevel {
  const source = Object.freeze({
    id: 'source-1',
    type: 'SOURCE' as const,
    isFixed: true as const,
    position: Object.freeze({ x: 0, y: 3 }),
    direction: 'E' as const,
    sequence: Object.freeze([...params.sourceSeq]),
    intervalTicks: params.intervalTicks,
  });
  const dock = Object.freeze({
    id: 'dock',
    type: 'OUTPUT' as const,
    isFixed: true as const,
    position: Object.freeze({ x: params.dockX, y: 3 }),
    direction: 'E' as const,
    acceptedTypes: Object.freeze([...params.acceptedTypes]),
    label: 'DOCK' as const,
  });
  return Object.freeze({
    id: params.id,
    sectorId: params.sectorId,
    width: 8,
    height: 8,
    fixedComponents: Object.freeze([source, dock]),
    inventory: Object.freeze({ ...params.inventory }),
    goals: Object.freeze(params.goals),
    obstacles: Object.freeze([]),
    referenceLayoutId: `${params.id.toLowerCase()}-reference`,
    title: params.title,
    lesson: params.lesson,
    tutorial: params.tutorial,
    referenceComponents: Object.freeze([source, dock, ...params.referenceComponents]),
    twoStarMaxTicks: params.twoStarMaxTicks,
    threeStarMaxTicks: params.threeStarMaxTicks,
    threeStarMaxPieces: params.threeStarMaxPieces,
  });
}

function makeDualOutputLevel(params: {
  id: string;
  sectorId: SectorDefinition['id'];
  title: string;
  lesson: string;
  tutorial: string;
  sourceSeq: readonly ItemType[];
  intervalTicks: number;
  outAX: number;
  outAType: ItemType;
  outBX: number;
  outBY: number;
  outBType: ItemType;
  qtyA: number;
  qtyB: number;
  inventory: LevelDefinition['inventory'];
  referenceEditable: readonly Component[];
  twoStarMaxTicks: number;
  threeStarMaxTicks: number;
  threeStarMaxPieces: number;
}): PlayableLevel {
  const source = Object.freeze({
    id: 'source-1',
    type: 'SOURCE' as const,
    isFixed: true as const,
    position: Object.freeze({ x: 0, y: 3 }),
    direction: 'E' as const,
    sequence: Object.freeze([...params.sourceSeq]),
    intervalTicks: params.intervalTicks,
  });
  const outA = Object.freeze({
    id: 'out-a',
    type: 'OUTPUT' as const,
    isFixed: true as const,
    position: Object.freeze({ x: params.outAX, y: 3 }),
    direction: 'E' as const,
    acceptedTypes: Object.freeze([params.outAType]),
    label: 'A' as const,
  });
  const outB = Object.freeze({
    id: 'out-b',
    type: 'OUTPUT' as const,
    isFixed: true as const,
    position: Object.freeze({ x: params.outBX, y: params.outBY }),
    direction: 'S' as const,
    acceptedTypes: Object.freeze([params.outBType]),
    label: 'B' as const,
  });
  return Object.freeze({
    id: params.id,
    sectorId: params.sectorId,
    width: 8,
    height: 8,
    fixedComponents: Object.freeze([source, outA, outB]),
    inventory: Object.freeze({ ...params.inventory }),
    goals: Object.freeze([
      Object.freeze({ outputId: 'out-a', itemType: params.outAType, quantity: params.qtyA }),
      Object.freeze({ outputId: 'out-b', itemType: params.outBType, quantity: params.qtyB }),
    ]),
    obstacles: Object.freeze([]),
    referenceLayoutId: `${params.id.toLowerCase()}-reference`,
    title: params.title,
    lesson: params.lesson,
    tutorial: params.tutorial,
    referenceComponents: Object.freeze([source, outA, outB, ...params.referenceEditable]),
    twoStarMaxTicks: params.twoStarMaxTicks,
    threeStarMaxTicks: params.threeStarMaxTicks,
    threeStarMaxPieces: params.threeStarMaxPieces,
  });
}

function makeAssemblerLevel(params: {
  id: string;
  sectorId: SectorDefinition['id'];
  title: string;
  lesson: string;
  tutorial: string;
  inputAType: ItemType;
  inputBType: ItemType;
  recipeId: 'CIRCUIT' | 'FRAME' | 'CONTROL_MODULE' | 'AUTOMATION_UNIT';
  quantity: number;
}): PlayableLevel {
  const sourceA = Object.freeze({
    id: 'source-a',
    type: 'SOURCE' as const,
    isFixed: true as const,
    position: Object.freeze({ x: 0, y: 3 }),
    direction: 'E' as const,
    sequence: Object.freeze([params.inputAType]),
    intervalTicks: 8,
  });
  const sourceB = Object.freeze({
    id: 'source-b',
    type: 'SOURCE' as const,
    isFixed: true as const,
    position: Object.freeze({ x: 2, y: 1 }),
    direction: 'S' as const,
    sequence: Object.freeze([params.inputBType]),
    intervalTicks: 8,
  });
  const dock = Object.freeze({
    id: 'dock',
    type: 'OUTPUT' as const,
    isFixed: true as const,
    position: Object.freeze({ x: 5, y: 3 }),
    direction: 'E' as const,
    acceptedTypes: Object.freeze([params.recipeId]),
    label: 'DOCK' as const,
  });
  const editable: readonly Component[] = Object.freeze([
    Object.freeze({ id: 'c-a', type: 'CONVEYOR' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const }),
    Object.freeze({ id: 'c-b', type: 'CONVEYOR' as const, isFixed: false as const, position: { x: 2, y: 2 }, direction: 'S' as const }),
    Object.freeze({ id: 'asm-1', type: 'ASSEMBLER' as const, isFixed: false as const, position: { x: 2, y: 3 }, direction: 'E' as const, recipeId: params.recipeId }),
    Object.freeze({ id: 'c-out1', type: 'CONVEYOR' as const, isFixed: false as const, position: { x: 3, y: 3 }, direction: 'E' as const }),
    Object.freeze({ id: 'c-out2', type: 'CONVEYOR' as const, isFixed: false as const, position: { x: 4, y: 3 }, direction: 'E' as const }),
  ]);
  return Object.freeze({
    id: params.id,
    sectorId: params.sectorId,
    width: 8,
    height: 8,
    fixedComponents: Object.freeze([sourceA, sourceB, dock]),
    inventory: Object.freeze({ CONVEYOR: 12, PROCESSOR: 0, DIVERTER: 0, ASSEMBLER: 1 }),
    goals: Object.freeze([
      Object.freeze({ outputId: 'dock', itemType: params.recipeId, quantity: params.quantity }),
    ]),
    obstacles: Object.freeze([]),
    referenceLayoutId: `${params.id.toLowerCase()}-reference`,
    title: params.title,
    lesson: params.lesson,
    tutorial: params.tutorial,
    referenceComponents: Object.freeze([sourceA, sourceB, dock, ...editable]),
    twoStarMaxTicks: 60,
    threeStarMaxTicks: 48,
    threeStarMaxPieces: 5,
  });
}

const procBoth = (x: number, y = 3) =>
  Object.freeze({
    id: `proc-${x}`,
    type: 'PROCESSOR' as const,
    isFixed: false as const,
    position: Object.freeze({ x, y }),
    direction: 'E' as const,
    defaultMode: 'CUT' as const,
    rules: Object.freeze([
      Object.freeze({ when: 'BLUE_BLANK' as const, then: 'CUT' as const }),
      Object.freeze({ when: 'AMBER_BLANK' as const, then: 'PRESS' as const }),
    ]),
  });

const belt = (id: string, x: number, y: number, direction: 'N' | 'E' | 'S' | 'W' = 'E') =>
  Object.freeze({
    id,
    type: 'CONVEYOR' as const,
    isFixed: false as const,
    position: Object.freeze({ x, y }),
    direction,
  });

const divStd = (x: number, y = 3) =>
  Object.freeze({
    id: `div-${x}`,
    type: 'DIVERTER' as const,
    isFixed: false as const,
    position: Object.freeze({ x, y }),
    direction: 'E' as const,
    rules: Object.freeze([
      Object.freeze({ when: 'CUT_PLATE' as const, then: 'A' as const }),
      Object.freeze({ when: 'PRESSED_BLOCK' as const, then: 'B' as const }),
    ]),
  });

export const EXPANDED_CAMPAIGN_LEVELS: readonly PlayableLevel[] = Object.freeze([
  // SECTOR-01: L04
  makeDualOutputLevel({
    id: 'L04',
    sectorId: 'SECTOR-01',
    title: 'Integrated Line',
    lesson: 'Combine conveyors, SHIFT Processor, and Diverter in a compact line.',
    tutorial: 'Connect Source → Processor → Diverter → Outputs A and B to close Sector 01.',
    sourceSeq: ['BLUE_BLANK', 'AMBER_BLANK'],
    intervalTicks: 9,
    outAX: 5,
    outAType: 'CUT_PLATE',
    outBX: 4,
    outBY: 5,
    outBType: 'PRESSED_BLOCK',
    qtyA: 3,
    qtyB: 3,
    inventory: { CONVEYOR: 12, PROCESSOR: 1, DIVERTER: 1 },
    referenceEditable: [procBoth(1), belt('b2', 2, 3), belt('b3', 3, 3), divStd(4), belt('bb', 4, 4, 'S')],
    twoStarMaxTicks: 72,
    threeStarMaxTicks: 66,
    threeStarMaxPieces: 5,
  }),

  // SECTOR-02: L05–L08 (Buffer & Efficiency)
  makeStraightLineLevel({
    id: 'L05',
    sectorId: 'SECTOR-02',
    title: 'Waiting Queue',
    lesson: 'Use a FIFO Buffer to absorb flow ahead of the Processor.',
    tutorial: 'Place a Buffer and a Processor between Source and Dock to produce 4 Cut Plates.',
    sourceSeq: ['BLUE_BLANK'],
    intervalTicks: 6,
    dockX: 5,
    acceptedTypes: ['CUT_PLATE'],
    goals: [{ outputId: 'dock', itemType: 'CUT_PLATE', quantity: 4 }],
    inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 0, BUFFER: 1 },
    referenceComponents: [
      Object.freeze({ id: 'buf-1', type: 'BUFFER' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, capacity: 4 }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
    ],
    twoStarMaxTicks: 46,
    threeStarMaxTicks: 40,
    threeStarMaxPieces: 4,
  }),

  makeStraightLineLevel({
    id: 'L06',
    sectorId: 'SECTOR-02',
    title: 'Different Rhythms',
    lesson: 'Smooth alternating inflows with a Buffer before SHIFT processing.',
    tutorial: 'Buffer incoming blanks so the Processor delivers 3 Cut Plates and 3 Pressed Blocks.',
    sourceSeq: ['BLUE_BLANK', 'AMBER_BLANK'],
    intervalTicks: 9,
    dockX: 6,
    acceptedTypes: ['CUT_PLATE', 'PRESSED_BLOCK'],
    goals: [
      { outputId: 'dock', itemType: 'CUT_PLATE', quantity: 3 },
      { outputId: 'dock', itemType: 'PRESSED_BLOCK', quantity: 3 },
    ],
    inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 0, BUFFER: 1 },
    referenceComponents: [
      Object.freeze({ id: 'buf-1', type: 'BUFFER' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, capacity: 4 }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
      belt('b5', 5, 3),
    ],
    twoStarMaxTicks: 76,
    threeStarMaxTicks: 70,
    threeStarMaxPieces: 5,
  }),

  makeStraightLineLevel({
    id: 'L07',
    sectorId: 'SECTOR-02',
    title: 'One Machine Only',
    lesson: 'Maximize throughput through a single shared SHIFT Processor.',
    tutorial: 'Deliver 3 Cut Plates and 3 Pressed Blocks with tight cycle discipline.',
    sourceSeq: ['BLUE_BLANK', 'AMBER_BLANK'],
    intervalTicks: 9,
    dockX: 5,
    acceptedTypes: ['CUT_PLATE', 'PRESSED_BLOCK'],
    goals: [
      { outputId: 'dock', itemType: 'CUT_PLATE', quantity: 3 },
      { outputId: 'dock', itemType: 'PRESSED_BLOCK', quantity: 3 },
    ],
    inventory: { CONVEYOR: 8, PROCESSOR: 1, DIVERTER: 0, BUFFER: 1 },
    referenceComponents: [
      Object.freeze({ id: 'buf-1', type: 'BUFFER' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, capacity: 4 }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
    ],
    twoStarMaxTicks: 70,
    threeStarMaxTicks: 64,
    threeStarMaxPieces: 4,
  }),

  makeDualOutputLevel({
    id: 'L08',
    sectorId: 'SECTOR-02',
    title: 'Tight Space',
    lesson: 'Deliver both products with a compact buffered SHIFT line.',
    tutorial: 'Combine Buffer, Processor, and Diverter within a strict component budget.',
    sourceSeq: ['BLUE_BLANK', 'AMBER_BLANK'],
    intervalTicks: 9,
    outAX: 6,
    outAType: 'CUT_PLATE',
    outBX: 5,
    outBY: 5,
    outBType: 'PRESSED_BLOCK',
    qtyA: 3,
    qtyB: 3,
    inventory: { CONVEYOR: 8, PROCESSOR: 1, DIVERTER: 1, BUFFER: 1 },
    referenceEditable: [
      Object.freeze({ id: 'buf-1', type: 'BUFFER' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, capacity: 4 }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
      divStd(5),
      belt('bb', 5, 4, 'S'),
    ],
    twoStarMaxTicks: 76,
    threeStarMaxTicks: 70,
    threeStarMaxPieces: 6,
  }),

  // SECTOR-03: L09–L12 (Sensor, Splitter, Merger)
  makeStraightLineLevel({
    id: 'L09',
    sectorId: 'SECTOR-03',
    title: 'Eyes on the Line',
    lesson: 'Place a Sensor in-line to monitor incoming blanks.',
    tutorial: 'Connect Source → Sensor → Processor → Dock to produce 4 Cut Plates.',
    sourceSeq: ['BLUE_BLANK'],
    intervalTicks: 6,
    dockX: 5,
    acceptedTypes: ['CUT_PLATE'],
    goals: [{ outputId: 'dock', itemType: 'CUT_PLATE', quantity: 4 }],
    inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 0, SENSOR: 1 },
    referenceComponents: [
      Object.freeze({ id: 'sen-1', type: 'SENSOR' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, watchItemType: 'BLUE_BLANK' as const }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
    ],
    twoStarMaxTicks: 46,
    threeStarMaxTicks: 40,
    threeStarMaxPieces: 4,
  }),

  makeDualOutputLevel({
    id: 'L10',
    sectorId: 'SECTOR-03',
    title: 'Divide to Win',
    lesson: 'Use a Splitter to balance items evenly across two outputs.',
    tutorial: 'Place a Splitter so Output A and Output B each receive 2 Blue Blanks.',
    sourceSeq: ['BLUE_BLANK'],
    intervalTicks: 6,
    outAX: 5,
    outAType: 'BLUE_BLANK',
    outBX: 4,
    outBY: 5,
    outBType: 'BLUE_BLANK',
    qtyA: 2,
    qtyB: 2,
    inventory: { CONVEYOR: 10, PROCESSOR: 0, DIVERTER: 0, SPLITTER: 1 },
    referenceEditable: [
      belt('b1', 1, 3),
      belt('b2', 2, 3),
      belt('b3', 3, 3),
      Object.freeze({ id: 'spl-1', type: 'SPLITTER' as const, isFixed: false as const, position: { x: 4, y: 3 }, direction: 'E' as const }),
      belt('bb', 4, 4, 'S'),
    ],
    twoStarMaxTicks: 42,
    threeStarMaxTicks: 36,
    threeStarMaxPieces: 5,
  }),

  (() => {
    const s1 = Object.freeze({ id: 'source-1', type: 'SOURCE' as const, isFixed: true as const, position: { x: 0, y: 3 }, direction: 'E' as const, sequence: Object.freeze(['BLUE_BLANK' as const]), intervalTicks: 8 });
    const s2 = Object.freeze({ id: 'source-2', type: 'SOURCE' as const, isFixed: true as const, position: { x: 2, y: 1 }, direction: 'S' as const, sequence: Object.freeze(['BLUE_BLANK' as const]), intervalTicks: 8 });
    const dock = Object.freeze({ id: 'dock', type: 'OUTPUT' as const, isFixed: true as const, position: { x: 5, y: 3 }, direction: 'E' as const, acceptedTypes: Object.freeze(['BLUE_BLANK' as const]), label: 'DOCK' as const });
    const editable: readonly Component[] = Object.freeze([
      belt('b1', 1, 3),
      belt('b2', 2, 2, 'S'),
      Object.freeze({ id: 'mrg-1', type: 'MERGER' as const, isFixed: false as const, position: { x: 2, y: 3 }, direction: 'E' as const }),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
    ]);
    return Object.freeze({
      id: 'L11',
      sectorId: 'SECTOR-03',
      width: 8,
      height: 8,
      fixedComponents: Object.freeze([s1, s2, dock]),
      inventory: Object.freeze({ CONVEYOR: 10, PROCESSOR: 0, DIVERTER: 0, MERGER: 1 }),
      goals: Object.freeze([{ outputId: 'dock', itemType: 'BLUE_BLANK' as const, quantity: 4 }]),
      obstacles: Object.freeze([]),
      referenceLayoutId: 'l11-reference',
      title: 'Two Paths, One Destination',
      lesson: 'Combine two incoming lines deterministically with a Merger.',
      tutorial: 'Connect both Sources into the Merger (rear + left) and deliver 4 Blue Blanks to Dock.',
      referenceComponents: Object.freeze([s1, s2, dock, ...editable]),
      twoStarMaxTicks: 38,
      threeStarMaxTicks: 30,
      threeStarMaxPieces: 5,
    });
  })(),

  makeDualOutputLevel({
    id: 'L12',
    sectorId: 'SECTOR-03',
    title: 'Autonomous Factory',
    lesson: 'Integrate Sensor, SHIFT Processor, and Diverter into one automated pipeline.',
    tutorial: 'Monitor and route 3 Cut Plates to A and 3 Pressed Blocks to B.',
    sourceSeq: ['BLUE_BLANK', 'AMBER_BLANK'],
    intervalTicks: 9,
    outAX: 6,
    outAType: 'CUT_PLATE',
    outBX: 5,
    outBY: 5,
    outBType: 'PRESSED_BLOCK',
    qtyA: 3,
    qtyB: 3,
    inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 1, SENSOR: 1 },
    referenceEditable: [
      Object.freeze({ id: 'sen-1', type: 'SENSOR' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, watchItemType: 'BLUE_BLANK' as const }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
      divStd(5),
      belt('bb', 5, 4, 'S'),
    ],
    twoStarMaxTicks: 76,
    threeStarMaxTicks: 70,
    threeStarMaxPieces: 6,
  }),

  // SECTOR-04: L13–L16 (Copper & Assembler 2-input crafting)
  makeStraightLineLevel({
    id: 'L13',
    sectorId: 'SECTOR-04',
    title: 'New Metal',
    lesson: 'Process Copper Blanks into Copper Strips with CUT mode.',
    tutorial: 'Connect Source (Copper Blank) → Processor (CUT) → Dock to deliver 4 Copper Strips.',
    sourceSeq: ['COPPER_BLANK'],
    intervalTicks: 7,
    dockX: 5,
    acceptedTypes: ['COPPER_STRIP'],
    goals: [{ outputId: 'dock', itemType: 'COPPER_STRIP', quantity: 4 }],
    inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 0 },
    referenceComponents: [
      Object.freeze({
        id: 'proc-copper',
        type: 'PROCESSOR' as const,
        isFixed: false as const,
        position: { x: 1, y: 3 },
        direction: 'E' as const,
        defaultMode: 'CUT' as const,
        rules: Object.freeze([{ when: 'COPPER_BLANK' as const, then: 'CUT' as const }]),
      }),
      belt('b2', 2, 3),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
    ],
    twoStarMaxTicks: 46,
    threeStarMaxTicks: 40,
    threeStarMaxPieces: 4,
  }),

  makeAssemblerLevel({
    id: 'L14',
    sectorId: 'SECTOR-04',
    title: 'First Assembly',
    lesson: 'Combine Copper Strip + Insulator in an Assembler to craft Circuits.',
    tutorial: 'Feed both inputs into the Assembler (rear + left) to deliver 3 Circuits.',
    inputAType: 'COPPER_STRIP',
    inputBType: 'INSULATOR',
    recipeId: 'CIRCUIT',
    quantity: 3,
  }),

  makeAssemblerLevel({
    id: 'L15',
    sectorId: 'SECTOR-04',
    title: 'Two Lines',
    lesson: 'Assemble Cut Plates and Pressed Blocks into Structural Frames.',
    tutorial: 'Feed Cut Plate and Pressed Block into the Assembler to deliver 3 Frames.',
    inputAType: 'CUT_PLATE',
    inputBType: 'PRESSED_BLOCK',
    recipeId: 'FRAME',
    quantity: 3,
  }),

  makeAssemblerLevel({
    id: 'L16',
    sectorId: 'SECTOR-04',
    title: 'Control Module',
    lesson: 'Craft Control Modules from Frames and Circuits.',
    tutorial: 'Combine Frame + Circuit in the Assembler to deliver 3 Control Modules.',
    inputAType: 'FRAME',
    inputBType: 'CIRCUIT',
    recipeId: 'CONTROL_MODULE',
    quantity: 3,
  }),

  // SECTOR-05: L17–L20 (SHIFT Master)
  makeDualOutputLevel({
    id: 'L17',
    sectorId: 'SECTOR-05',
    title: 'Shift Change',
    lesson: 'Handle rapid alternating production waves without bottlenecks.',
    tutorial: 'Use Buffer + Processor + Diverter to deliver 4 Cut Plates and 4 Pressed Blocks.',
    sourceSeq: ['BLUE_BLANK', 'AMBER_BLANK'],
    intervalTicks: 9,
    outAX: 6,
    outAType: 'CUT_PLATE',
    outBX: 5,
    outBY: 5,
    outBType: 'PRESSED_BLOCK',
    qtyA: 4,
    qtyB: 4,
    inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 1, BUFFER: 1 },
    referenceEditable: [
      Object.freeze({ id: 'buf-1', type: 'BUFFER' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, capacity: 4 }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
      divStd(5),
      belt('bb', 5, 4, 'S'),
    ],
    twoStarMaxTicks: 96,
    threeStarMaxTicks: 90,
    threeStarMaxPieces: 6,
  }),

  makeDualOutputLevel({
    id: 'L18',
    sectorId: 'SECTOR-05',
    title: 'Without Stopping',
    lesson: 'Sustain continuous SHIFT operation with Sensor monitoring.',
    tutorial: 'Build a zero-rejection automated line for 4 Cut Plates and 4 Pressed Blocks.',
    sourceSeq: ['BLUE_BLANK', 'BLUE_BLANK', 'AMBER_BLANK', 'AMBER_BLANK'],
    intervalTicks: 8,
    outAX: 6,
    outAType: 'CUT_PLATE',
    outBX: 5,
    outBY: 5,
    outBType: 'PRESSED_BLOCK',
    qtyA: 4,
    qtyB: 4,
    inventory: { CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 1, SENSOR: 1 },
    referenceEditable: [
      Object.freeze({ id: 'sen-1', type: 'SENSOR' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, watchItemType: 'BLUE_BLANK' as const }),
      procBoth(2),
      belt('b3', 3, 3),
      belt('b4', 4, 3),
      divStd(5),
      belt('bb', 5, 4, 'S'),
    ],
    twoStarMaxTicks: 88,
    threeStarMaxTicks: 80,
    threeStarMaxPieces: 6,
  }),

  makeAssemblerLevel({
    id: 'L19',
    sectorId: 'SECTOR-05',
    title: 'Elite Line',
    lesson: 'Assemble the final Automation Unit from Control Modules and Pressed Blocks.',
    tutorial: 'Connect both streams into the Assembler to deliver 3 Automation Units.',
    inputAType: 'CONTROL_MODULE',
    inputBType: 'PRESSED_BLOCK',
    recipeId: 'AUTOMATION_UNIT',
    quantity: 3,
  }),

  makeDualOutputLevel({
    id: 'L20',
    sectorId: 'SECTOR-05',
    title: 'SHIFT Master',
    lesson: 'Master all fundamentals in the final SHIFTWORKS capstone.',
    tutorial: 'Combine Buffer, Sensor, SHIFT Processor, and Diverter to deliver 4 Cut Plates and 4 Pressed Blocks.',
    sourceSeq: ['BLUE_BLANK', 'AMBER_BLANK'],
    intervalTicks: 8,
    outAX: 6,
    outAType: 'CUT_PLATE',
    outBX: 5,
    outBY: 5,
    outBType: 'PRESSED_BLOCK',
    qtyA: 4,
    qtyB: 4,
    inventory: { CONVEYOR: 12, PROCESSOR: 1, DIVERTER: 1, BUFFER: 1, SENSOR: 1 },
    referenceEditable: [
      Object.freeze({ id: 'buf-1', type: 'BUFFER' as const, isFixed: false as const, position: { x: 1, y: 3 }, direction: 'E' as const, capacity: 4 }),
      Object.freeze({ id: 'sen-1', type: 'SENSOR' as const, isFixed: false as const, position: { x: 2, y: 3 }, direction: 'E' as const, watchItemType: 'BLUE_BLANK' as const }),
      procBoth(3),
      belt('b4', 4, 3),
      divStd(5),
      belt('bb', 5, 4, 'S'),
    ],
    twoStarMaxTicks: 92,
    threeStarMaxTicks: 84,
    threeStarMaxPieces: 6,
  }),
]);
