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
  ClearForest,
  ClearJungle,
  ClearSwamp,
  Fortify,
  Move,
  Pillage,
  PlantForest,
  Sleep,
} from '../../Actions';
import { Railroad, Road } from '@civ-clone/civ1-world/TileImprovements';
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
import Effect from '@civ-clone/core-rule/Effect';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';

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
 * The table above, as a lookup, cached by the terrain's own constructor.
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
const cachedTerrainMovementCost = new Map<Function, number | null>();

export const terrainMovementCost = (terrain: Terrain): number | null => {
  const cached = cachedTerrainMovementCost.get(terrain.constructor);

  if (cached !== undefined) {
    return cached;
  }

  const match = baseTerrainMovementCost.find(
      ([TerrainType]: [typeof Terrain, number]): boolean =>
        terrain instanceof TerrainType
    ),
    cost = match === undefined ? null : match[1];

  cachedTerrainMovementCost.set(terrain.constructor, cost);

  return cost;
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
    new Effect((): number => 1 / 3)
  ),

  new MovementCost(
    'civ1-unit:unit/movement-cost/railroad',
    new Criterion((unit: Unit, action: UnitAction) => action instanceof Move),
    new Criterion((unit: Unit) => unit instanceof Land),
    new Criterion((unit: Unit, action: Action): boolean =>
      tileImprovementRegistry
        .getByTile(action.from())
        .some(
          (improvement: TileImprovement): boolean =>
            improvement instanceof Railroad
        )
    ),
    new Criterion((unit: Unit, action: Action): boolean =>
      tileImprovementRegistry
        .getByTile(action.to())
        .some(
          (improvement: TileImprovement): boolean =>
            improvement instanceof Railroad
        )
    ),
    // TODO: need to also protect against goto etc, like classic Civ does, although I'd rather that was done by evaluating
    //  the moves and if a loop is detected auto-cancelling - this is pretty primitive.
    // new Criterion((unit) => ! (unit.player() instanceof AIPlayer)),
    new Effect((): number => 0)
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

  // One rule per action, not one per (action, terrain) pair: 11 rules where
  // there were 132, all but one of which used to be rejected on the
  // `instanceof` below. Was
  // `civ1-unit:unit/movement-cost/action/<Action>/<Terrain>`.
  ...(
    [
      [BuildIrrigation, 2],
      [BuildMine, 3],
      [BuildRoad, 1],
      [BuildRailroad, 2],
      [ClearForest, 2],
      [ClearJungle, 3],
      [ClearSwamp, 3],
      [Fortify, 1],
      [Pillage, 1],
      [PlantForest, 3],
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
];

export default getRules;
