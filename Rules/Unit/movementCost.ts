import {
  Arctic,
  Desert,
  Forest,
  Grassland,
  Hills,
  Jungle,
  Mountains,
  Ocean,
  Plains,
  River,
  Swamp,
  Tundra,
} from '@civ-clone/civ1-world/Terrains';
import { Air, Land, Naval, NavalTransport } from '../../Types';
import {
  BuildIrrigation,
  BuildMine,
  BuildRailroad,
  BuildRoad,
  CleanPollution,
  ClearForest,
  ClearJungle,
  ClearSwamp,
  Fortify,
  Move,
  Pillage,
  PlantForest,
  Sleep,
} from '../../Actions';
import {
  Irrigation,
  Mine,
  Pollution,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import { RAILROAD_MOVEMENT_RULE } from '../../RuleIds';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import Action from '@civ-clone/core-unit/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description, {
  EffectDescription,
} from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import { Settlers } from '../../Units';
import availableRequirements from '@civ-clone/civ1-world/Requirements';
import { cachedTerrainLookup } from '@civ-clone/base-terrain-properties/lib/terrainTable';
import {
  TerrainJob as BaseTerrainJob,
  multipleOf,
  terrainJobTurns as jobTurns,
} from '@civ-clone/base-terrain-properties/lib/jobTurns';

// I wonder if this would be easier to manage as a `Yield` on the `Terrain`?
export const baseTerrainMovementCost: [typeof Terrain, number][] = [
  [Arctic, 2],
  [Desert, 1],
  [Forest, 2],
  [Grassland, 1],
  [Hills, 2],
  [Jungle, 2],
  [Mountains, 3],
  [Ocean, 1],
  [Plains, 1],
  [River, 1],
  [Swamp, 2],
  [Tundra, 1],
];

/**
 * The table above, as a lookup, cached by the terrain's own constructor (see
 * `base-terrain-properties`' `cachedTerrainLookup`).
 *
 * This used to be expressed as one `MovementCost` rule per cell — one per
 * terrain for moving, and one per (action, terrain) pair for everything else,
 * 132 of those. That reads well and is how rules are meant to compose, but it
 * put a 12-way and a 132-way linear scan on the hottest path in the engine:
 * `RuleRegistry.process(MovementCost, …)` is 98.5% of every rule validation a
 * game performs, the path finder calls it once per neighbouring tile it
 * considers, and it walked 148 rules to find the one that applied. The other
 * 147 were answering "no" — most of them on `action instanceof Action`, before
 * terrain was ever consulted.
 *
 * A lookup is the same answer without the scan, because the twelve terrains
 * are siblings: `Arctic`…`Tundra` all extend `Land` or `Water` and none
 * extends another, so at most one row can ever match a given terrain and
 * "which rows match" was never a meaningful question.
 *
 * `instanceof` rather than an identity check on the constructor, so a mod's
 * `class Steppe extends Plains` still costs what `Plains` costs, as it did
 * when this was 132 rules. Where such a subclass could match two rows the
 * first row wins, whereas 132 rules would have matched twice and left the
 * caller to choose; nothing in the table can do that today, and a terrain that
 * wants its own cost should have its own row.
 */
export const terrainMovementCost: (terrain: Terrain) => number | null =
  cachedTerrainLookup(baseTerrainMovementCost);

type TerrainJob = BaseTerrainJob<typeof UnitAction>;

/** A road takes this many times the terrain's movement cost in turns, and a railroad `RAILROAD_JOB_FACTOR` times. */
export const ROAD_JOB_FACTOR: number = 2,
  RAILROAD_JOB_FACTOR: number = 4;

/**
 * The tile improvement each terrain job builds, or whose order it is: in Civ1 clearing a Forest, a Jungle or a Swamp
 * is the irrigate order on it, and planting a Forest the mine order. For the Civilopedia (civ-clone/web-renderer#620).
 */
export const terrainJobImprovements: [
  typeof UnitAction,
  typeof TileImprovement
][] = [
  [BuildIrrigation, Irrigation],
  [BuildMine, Mine],
  [BuildRoad, Road],
  [BuildRailroad, Railroad],
  [ClearForest, Irrigation],
  [ClearJungle, Irrigation],
  [ClearSwamp, Irrigation],
  [PlantForest, Mine],
];

/** The tile improvement each terrain job takes away, for the Civilopedia (civ-clone/web-renderer#621). */
export const terrainJobRemovals: [typeof UnitAction, typeof TileImprovement][] =
  [[CleanPollution, Pollution]];

/** A land unit moves this many squares along a road for each of its moves. */
export const ROAD_SQUARES_PER_MOVE: number = 3;

/** The tile improvement `Action` builds, or whose order it is (`terrainJobImprovements`), or `null`. */
export const terrainJobImprovement = (
  Action: typeof UnitAction
): typeof TileImprovement | null =>
  terrainJobImprovements.find(
    ([JobAction]: [typeof UnitAction, typeof TileImprovement]): boolean =>
      JobAction === Action
  )?.[1] ?? null;

/**
 * How many turns each of a Settlers' terrain jobs takes in Civ1, per terrain:
 * v474.05's terrain modification table for irrigating and mining (OpenCivOne
 * `GameData.cs`), and twice (a road) or four times (a railroad) the terrain's
 * movement cost. *Rome on 640K a Day*, Table 3-2, agrees.
 *
 * A job converting the terrain (`ClearForest`, `PlantForest` and so on) is the
 * irrigate or mine order on that terrain, so it takes that order's time.
 */
export const civ1TerrainJobTurns: TerrainJob[] = [
  [
    BuildIrrigation,
    [
      [Desert, 5],
      [Grassland, 5],
      [Hills, 10],
      [Plains, 5],
      [River, 5],
    ],
  ],
  [
    BuildMine,
    [
      [Desert, 5],
      [Hills, 10],
      [Mountains, 10],
    ],
  ],
  [BuildRoad, multipleOf(terrainMovementCost, ROAD_JOB_FACTOR)],
  [BuildRailroad, multipleOf(terrainMovementCost, RAILROAD_JOB_FACTOR)],
  // Cleaning up pollution takes 4 turns on any terrain (Table 3-2; v474.05 `CheckPlayerTurn.cs` ~L1050,
  //  civ-clone/web-renderer#32).
  [CleanPollution, (): number => 4],
  [ClearForest, [[Forest, 5]]],
  [ClearJungle, [[Jungle, 15]]],
  [ClearSwamp, [[Swamp, 15]]],
  [
    PlantForest,
    [
      [Grassland, 10],
      [Jungle, 15],
      [Plains, 15],
      [Swamp, 15],
    ],
  ],
];

/**
 * The turns a unit is busy with `Action` on `terrain`, or `null` if the job
 * has no time there.
 *
 * One fewer than Civ1's figure: Civ1 counts the turn the order is given on,
 * and a `DelayedAction` started on turn T finishes at the start of turn
 * T + turns. So a road on Grassland (2 in Civ1) is there at the start of the
 * next turn, as it is in Civ1.
 */
export const terrainJobTurns = (
  Action: typeof UnitAction,
  terrain: Terrain
): number | null => jobTurns(civ1TerrainJobTurns, Action, terrain);

/** The unit whose work the terrain jobs are, as the Civilopedia says it. */
export const terrainJobUnit: typeof Unit = Settlers;

/**
 * The advances a Road on `TerrainType` needs, from civ1-world's requirements (Bridge Building on a River), which a
 *  Railroad, built on a Road, needs too.
 */
export const roadAdvancesOn = (
  TerrainType: typeof Terrain,
  requirements: typeof availableRequirements = availableRequirements
): Function[] =>
  requirements
    .filter(
      (requirement): boolean =>
        requirement.subject === Road &&
        (requirement.where ?? []).includes(TerrainType)
    )
    .flatMap(
      (requirement): Function[] =>
        requirement.targets.filter(
          (target): boolean => typeof target === 'function'
        ) as Function[]
    );

/**
 * What each terrain job says it takes, for the Civilopedia (civ-clone/web-renderer#620): Civ1's turns (the table's
 * figure, which counts the turn the order is given on, as Civ1 does) to build the job's improvement on each terrain it
 * has a time for. A time worked out from the terrain (a road, a railroad) is given for each terrain civ1-world lets
 * the improvement be built on. A job with no improvement (cleaning up pollution) says nothing. A job converting the
 * terrain (clearing or planting a forest) is named as itself, not as the order it is, as it builds no improvement.
 */
export const terrainJobDescriptions = (
  [Action, time]: TerrainJob,
  requirements: typeof availableRequirements = availableRequirements
): EffectDescription[] => {
  const Improvement = terrainJobImprovement(Action);

  if (Improvement === null) {
    return removalDescriptions([Action, time]);
  }

  const rows: [typeof Terrain, number | null][] = Array.isArray(time)
    ? time
    : requirements
        .filter((requirement): boolean => requirement.subject === Improvement)
        .flatMap(
          (requirement): (typeof Terrain)[] =>
            (requirement.where ?? []) as (typeof Terrain)[]
        )
        .filter(
          (TerrainType: typeof Terrain, i: number, terrains): boolean =>
            terrains.indexOf(TerrainType) === i
        )
        .map((TerrainType: typeof Terrain): [typeof Terrain, number | null] => [
          TerrainType,
          // Made without its constructor, which would run the game's `Created` rules: the lookup only needs its class.
          time(Object.create(TerrainType.prototype)),
        ]);

  return rows
    .filter(([, turns]): boolean => turns !== null)
    .map(([TerrainType, turns]): EffectDescription => {
      const needs =
        Improvement === Road || Improvement === Railroad
          ? roadAdvancesOn(TerrainType, requirements)
          : [];

      return {
        type: 'improvement_turns',
        subject: TerrainType,
        // A conversion declares the terrain it leaves (`result`); a job that builds an improvement doesn't.
        improvement: 'result' in Action ? Action : Improvement,
        value: turns as number,
        unit: terrainJobUnit,
        with: needs.length > 0 ? needs : undefined,
      };
    });
};

/**
 * What a job that takes a tile improvement away says it takes (civ-clone/web-renderer#621): Civ1's turns, as the table
 *  gives them, to clean up Pollution. Said once for each time the land terrains give, which is one in Civ1, as it
 *  takes the same on any terrain. A job that takes nothing away says nothing.
 */
const removalDescriptions = ([
  Action,
  time,
]: TerrainJob): EffectDescription[] => {
  const Removed =
    terrainJobRemovals.find(
      ([JobAction]: [typeof UnitAction, typeof TileImprovement]): boolean =>
        JobAction === Action
    )?.[1] ?? null;

  if (Removed === null) {
    return [];
  }

  const turns = (
    Array.isArray(time)
      ? time.map(([, turns]): number | null => turns)
      : baseTerrainMovementCost
          .filter(([TerrainType]): boolean => TerrainType !== Ocean)
          .map(([TerrainType]): number | null =>
            // Made without its constructor, as `terrainJobDescriptions` does: the lookup only needs its class.
            time(Object.create(TerrainType.prototype))
          )
  ).filter(
    (value: number | null, i: number, values): value is number =>
      value !== null && values.indexOf(value) === i
  );

  return turns.map(
    (value: number): EffectDescription => ({
      type: 'removal_turns',
      subject: Removed,
      value,
      unit: terrainJobUnit,
    })
  );
};

export const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  transportRegistry?: TransportRegistry
) => MovementCost[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance
) => [
  // One rule, not one per terrain: see `terrainMovementCost`. Was
  // `civ1-unit:unit/movement-cost/move/<Terrain>`.
  new MovementCost(
    'civ1-unit:unit/movement-cost/move',
    new Criterion((unit: Unit, action: UnitAction) => action instanceof Move),
    new Criterion((unit: Unit) => unit instanceof Land),
    new Criterion(
      (unit: Unit, action: Action): boolean =>
        terrainMovementCost(action.to().terrain()) !== null
    ),
    new Effect(
      (unit: Unit, action: Action): number =>
        terrainMovementCost(action.to().terrain()) as number
    ),
    // What each terrain costs to move onto, for the Civilopedia (civ-clone/web-renderer#620).
    new Description(
      ...baseTerrainMovementCost.map(
        ([TerrainType, value]: [
          typeof Terrain,
          number
        ]): EffectDescription => ({
          type: 'movement_cost',
          subject: TerrainType,
          value,
        })
      )
    )
  ),
  new MovementCost(
    'civ1-unit:unit/movement-cost/air-and-naval',
    new Criterion((unit: Unit, action: UnitAction) => action instanceof Move),
    new Criterion((unit: Unit) => unit instanceof Air || unit instanceof Naval),
    new Effect(() => 1)
  ),
  new MovementCost(
    'civ1-unit:unit/movement-cost/road',
    new Criterion((unit: Unit, action: UnitAction) => action instanceof Move),
    new Criterion((unit: Unit) => unit instanceof Land),
    new Criterion((unit: Unit, action: Action) =>
      tileImprovementRegistry
        .getByTile(action.from())
        .some(
          (improvement: TileImprovement): boolean => improvement instanceof Road
        )
    ),
    new Criterion((unit: Unit, action: Action): boolean =>
      tileImprovementRegistry
        .getByTile(action.to())
        .some(
          (improvement: TileImprovement): boolean => improvement instanceof Road
        )
    ),
    new Effect((): number => 1 / ROAD_SQUARES_PER_MOVE),
    // What a road gives, for the Civilopedia (civ-clone/web-renderer#1272).
    new Description({
      type: 'route_squares',
      subject: Road,
      value: ROAD_SQUARES_PER_MOVE,
    })
  ),

  // v474.05's railroad (`CONTROL.C`, the move): free from a square with a Railroad to one with a Road, so a train runs
  //  on into a city, which has no Railroad of its own (civ-clone/web-renderer#1029), and off the end of the line onto a
  //  road. Leaving a city onto the railroad costs a road move. v474.05 gives this only to the human's units moving by
  //  hand, not to the computer players' or to a goto: not followed here.
  new MovementCost(
    RAILROAD_MOVEMENT_RULE,
    new Criterion((unit: Unit, action: UnitAction) => action instanceof Move),
    new Criterion((unit: Unit) => unit instanceof Land),
    // A Railroad and a Road on the square left (a Railroad is built on a Road, but a save or a rule set might part them),
    //  and a Road on the square entered.
    new Criterion((unit: Unit, action: Action): boolean => {
      const left = tileImprovementRegistry.getByTile(action.from());

      return (
        left.some(
          (improvement: TileImprovement): boolean =>
            improvement instanceof Railroad
        ) &&
        left.some(
          (improvement: TileImprovement): boolean => improvement instanceof Road
        )
      );
    }),
    new Criterion((unit: Unit, action: Action): boolean =>
      tileImprovementRegistry
        .getByTile(action.to())
        .some(
          (improvement: TileImprovement): boolean => improvement instanceof Road
        )
    ),
    new Effect((): number => 0),
    // What a railroad gives, for the Civilopedia (civ-clone/web-renderer#1272).
    new Description({
      type: 'route_free',
      subject: Railroad,
    })
  ),

  new MovementCost(
    'civ1-unit:unit/movement-cost/transported',
    new Criterion((unit: Unit, action: UnitAction) => action instanceof Move),
    new Criterion((unit: Unit): boolean => unit instanceof Land),
    // `hasUnit`, not `getByUnit` in a `try`: the latter answers "no" by
    // throwing, and this criterion is evaluated for every land unit on every
    // move. A 150-turn game spent 23% of its time in `getByUnit`, nearly all
    // of it scanning every manifest and then constructing a `TypeError` to say
    // the unit was not aboard anything.
    new Criterion((unit: Unit): boolean => transportRegistry.hasUnit(unit)),
    new Criterion(
      (unit: Unit): boolean =>
        transportRegistry.getByUnit(unit).transport() instanceof NavalTransport
    ),
    new Effect((): number => 0)
  ),

  new MovementCost(
    // An aircraft aboard a Carrier moves with it for free, even after landing has used up its moves. Taking off (a
    // `Move` away from the Carrier's tile) costs as normal.
    'civ1-unit:unit/movement-cost/transported/air',
    new Criterion((unit: Unit, action: UnitAction) => action instanceof Move),
    new Criterion((unit: Unit): boolean => unit instanceof Air),
    new Criterion((unit: Unit): boolean => transportRegistry.hasUnit(unit)),
    new Criterion(
      (unit: Unit, action: Action): boolean =>
        transportRegistry.getByUnit(unit).transport().tile() === action.to()
    ),
    new Effect((): number => 0)
  ),

  // One rule per action, not one per (action, terrain) pair: 11 rules where
  // there were 132, all but one of which used to be rejected on the
  // `instanceof` below. Was
  // `civ1-unit:unit/movement-cost/action/<Action>/<Terrain>`.
  ...(
    [
      [Fortify, 1],
      [Pillage, 1],
      [Sleep, 0],
    ] as [typeof UnitAction, number][]
  ).map(
    ([Action, moveCost]: [typeof UnitAction, number]): MovementCost =>
      new MovementCost(
        `civ1-unit:unit/movement-cost/action/${Action.name}`,
        new Criterion(
          (unit: Unit, action: UnitAction) => action instanceof Action
        ),
        new Criterion(
          (unit: Unit): boolean =>
            terrainMovementCost(unit.tile().terrain()) !== null
        ),
        new Effect(
          (unit: Unit): number =>
            moveCost * (terrainMovementCost(unit.tile().terrain()) as number)
        )
      )
  ),

  // Terrain jobs take the turns in `civ1TerrainJobTurns`, less the turn the
  // order is given on: see `terrainJobTurns`.
  ...civ1TerrainJobTurns.map(([Action, time]: TerrainJob): MovementCost => {
    const descriptions = terrainJobDescriptions([Action, time]);

    return new MovementCost(
      `civ1-unit:unit/movement-cost/action/${Action.name}`,
      new Criterion(
        (unit: Unit, action: UnitAction) => action instanceof Action
      ),
      new Criterion(
        (unit: Unit): boolean =>
          terrainJobTurns(Action, unit.tile().terrain()) !== null
      ),
      new Effect(
        (unit: Unit): number =>
          terrainJobTurns(Action, unit.tile().terrain()) as number
      ),
      // The turns each terrain takes, for the Civilopedia (civ-clone/web-renderer#620).
      ...(descriptions.length > 0 ? [new Description(...descriptions)] : [])
    );
  }),
];

export default getRules;
