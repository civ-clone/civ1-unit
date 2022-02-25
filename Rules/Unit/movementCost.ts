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

export const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  transportRegistry?: TransportRegistry
) => MovementCost[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance
) => [
  ...(
    [
      [Arctic, 2],
      [Desert, 1],
      [Forest, 2],
      [Grassland, 1],
      [Hills, 2],
      [Jungle, 2],
      [Mountains, 3],
      [Plains, 1],
      [River, 1],
      [Swamp, 2],
      [Tundra, 1],
    ] as [typeof Terrain, number][]
  ).map(
    ([TerrainType, cost]: [typeof Terrain, number]): MovementCost =>
      new MovementCost(
        new Criterion((unit: Unit) => unit instanceof Land),
        new Criterion(
          (unit: Unit, action: Action): boolean =>
            action.to().terrain() instanceof TerrainType
        ),
        new Effect((): number => cost)
      )
  ),
  new MovementCost(
    new Criterion((unit: Unit) => unit instanceof Air || unit instanceof Naval),
    new Effect(() => 1)
  ),
  new MovementCost(
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
    new Criterion((unit: Unit): boolean => unit instanceof Land),
    new Criterion((unit: Unit): boolean => {
      try {
        transportRegistry.getByUnit(unit);

        return true;
      } catch (e) {
        return false;
      }
    }),
    new Criterion(
      (unit: Unit): boolean =>
        transportRegistry.getByUnit(unit).transport() instanceof NavalTransport
    ),
    new Effect((): number => 0)
  ),
];

export default getRules;
