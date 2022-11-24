import {
  Action,
  hasMovesLeft,
  isCurrentTile,
  isNeighbouringTile,
} from '@civ-clone/core-unit/Rules/Action';
import {
  Air,
  Fortifiable,
  Land as LandUnit,
  Naval,
  NavalTransport,
  Worker,
} from '../../Types';
import {
  Attack,
  BuildIrrigation,
  BuildMine,
  BuildRailroad,
  BuildRoad,
  CaptureCity,
  ClearForest,
  ClearJungle,
  ClearSwamp,
  Disband,
  Disembark,
  Embark,
  Fortify,
  FoundCity,
  Move,
  NoOrders,
  Pillage,
  PlantForest,
  Sleep,
  Unload,
} from '../../Actions';
import {
  CityNameRegistry,
  instance as cityNameRegistryInstance,
} from '@civ-clone/core-civilization/CityNameRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Forest,
  Jungle,
  Plains,
  River,
  Swamp,
} from '@civ-clone/civ1-world/Terrains';
import {
  Irrigation,
  Mine,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import { Land, Water } from '@civ-clone/core-terrain/Types';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TerrainFeatureRegistry,
  instance as terrainFeatureRegistryInstance,
} from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import And from '@civ-clone/core-rule/Criteria/And';
import Available from '@civ-clone/core-tile-improvement/Rules/Available';
import Criterion from '@civ-clone/core-rule/Criterion';
import DelayedAction from '@civ-clone/core-unit/DelayedAction';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import Or from '@civ-clone/core-rule/Criteria/Or';
import { Fighter, Settlers, Submarine } from '../../Units';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';

const isLandUnit = new Criterion(
    (unit: Unit, to: Tile, from: Tile = unit.tile()) => unit instanceof LandUnit
  ),
  isNavalUnit = new Criterion(
    (unit: Unit, to: Tile, from: Tile = unit.tile()) => unit instanceof Naval
  ),
  tileHasCity = (tile: Tile, cityRegistry: CityRegistry): boolean =>
    cityRegistry.getByTile(tile) !== null;

export const getRules: (
  cityNameRegistry?: CityNameRegistry,
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry,
  tileImprovementRegistry?: TileImprovementRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry,
  unitRegistry?: UnitRegistry,
  terrainFeatureRegistry?: TerrainFeatureRegistry,
  transportRegistry?: TransportRegistry,
  turn?: Turn
) => Action[] = (
  cityNameRegistry: CityNameRegistry = cityNameRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance,
  turn: Turn = turnInstance
) => [
  new Action(
    isNeighbouringTile,
    hasMovesLeft,
    new Or(
      // `LandUnit`s can move to other `Land` `Tile`s.
      new And(
        isLandUnit,
        new Criterion(
          (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
            from.isLand()
        ),
        new Criterion((unit: Unit, to: Tile): boolean => to.isLand()),
        // Either there are no units, or they're the same `Player`.
        new Criterion((unit: Unit, to: Tile): boolean =>
          unitRegistry
            .getByTile(to)
            .every(
              (tileUnit: Unit): boolean => tileUnit.player() === unit.player()
            )
        )
      ),
      new And(
        isNavalUnit,
        // `Naval` `Unit`s can either move from `Water` or a friendly `City`...
        new Or(
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              from.isWater()
          ),
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              cityRegistry.getByTile(from)?.player() === unit.player()
          )
        ),
        // ...to `Water` or a friendly `City`.
        new Or(
          new Criterion((unit: Unit, to: Tile): boolean => to.isWater()),
          new Criterion(
            (unit: Unit, to: Tile): boolean =>
              cityRegistry.getByTile(to)?.player() === unit.player()
          )
        )
      ),
      new Criterion((unit: Unit): boolean => unit instanceof Air)
    ),

    // This is analogous to the original Civilization unit adjacency rules.
    // You may only move your `Unit` to the `Tile` if...
    new Or(
      new Criterion(
        // ...it's not a `LandUnit` (`Air`, and `Naval` `Unit`s can ignore adjacency `Rule`s)...
        (unit: Unit, to: Tile): boolean => !(unit instanceof LandUnit)
      ),
      // new Criterion(
      //   // ...it's a `Diplomatic` `Unit`...
      //   (unit: Unit, to: Tile): boolean => unit instanceof Diplomatic
      // ),
      new Criterion(
        // ...there's not an enemy `Unit` adjacent to the current `Tile` and also the target `Tile`...
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
          !(
            from.getNeighbours().some((tile: Tile) =>
              unitRegistry.getByTile(tile).some(
                (tileUnit: Unit): boolean =>
                  tileUnit instanceof LandUnit &&
                  // Ignore `LandUnit`s in `Transport` on `Water`
                  tileUnit.tile().terrain() instanceof Land &&
                  tileUnit.player() !== unit.player()
              )
            ) &&
            to.getNeighbours().some((tile: Tile) =>
              unitRegistry.getByTile(tile).some(
                (tileUnit: Unit): boolean =>
                  tileUnit instanceof LandUnit &&
                  // Ignore `LandUnit`s in `Transport` on `Water`
                  tileUnit.tile().terrain() instanceof Land &&
                  tileUnit.player() !== unit.player()
              )
            )
          )
      ),
      new Criterion(
        (unit: Unit, to: Tile): boolean =>
          unitRegistry
            .getByTile(to)
            .filter(
              (tileUnit: Unit): boolean => tileUnit.player() === unit.player()
            ).length > 0
      ),
      new Criterion((unit: Unit, to: Tile): boolean => {
        // ...or one of your `City`s.
        const city = cityRegistry.getByTile(to);

        if (city === null) {
          return false;
        }

        return city.player() === unit.player();
      })
    ),
    new Criterion((unit: Unit, to: Tile): boolean => {
      // ...or one of your `City`s.
      const city = cityRegistry.getByTile(to);

      if (city === null) {
        return true;
      }

      return city.player() === unit.player();
    }),
    new Criterion(
      (unit: Unit, to: Tile): boolean =>
        !unitRegistry
          .getByTile(to)
          .some((tileUnit) => tileUnit.player() !== unit.player())
    ),
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new Move(from, to, unit, ruleRegistry) as UnitAction
    )
  ),

  new Action(
    isNeighbouringTile,
    hasMovesLeft,
    new Criterion((unit: Unit, to: Tile): boolean =>
      unitRegistry
        .getByTile(to)
        .some((tileUnit: Unit): boolean => tileUnit.player() !== unit.player())
    ),
    // Where the Unit is either...
    new Or(
      new And(
        // ...an Air Unit...
        new Criterion((unit: Unit): boolean => unit instanceof Air),
        // ...and either...
        new Or(
          // ...not every Unit on the Tile is another Air Unit...
          new Criterion(
            (unit: Unit, to: Tile): boolean =>
              !unitRegistry
                .getByTile(to)
                .every((tileUnit: Unit): boolean => tileUnit instanceof Air)
          ),
          // ...or the Unit is a Fighter.
          // TODO: `AirAttacker` type? This would allow Mobile SAM etc
          new Criterion(
            (unit: Unit, to: Tile): boolean => unit instanceof Fighter
          )
        )
      ),
      new And(
        // ...or a Land Unit...
        isLandUnit,
        // ...and either...
        new Or(
          // ...the Tile has a City....
          new Criterion((unit: Unit, to: Tile): boolean =>
            tileHasCity(to, cityRegistry)
          ),
          // ...or it's attacking another Land Unit.
          new Criterion((unit: Unit, to: Tile): boolean =>
            unitRegistry
              .getByTile(to)
              .some((tileUnit: Unit): boolean => tileUnit instanceof LandUnit)
          )
        )
      ),
      new And(
        // ...or a Naval Unit...
        isNavalUnit,
        new Or(
          // ...that is either, not a `Submarine` (as they can only attack other `Naval` `Unit`s...
          // TODO: Add a type for this? NavalBombardier?
          new Criterion((unit: Unit, to: Tile) => !(unit instanceof Submarine)),
          // ...or the `Tile` is `Water`.
          new Criterion((unit: Unit, to: Tile) => to.isWater())
        )
      )
    ),
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new Attack(from, to, unit, ruleRegistry, unitRegistry)
    )
  ),

  new Action(
    isNeighbouringTile,
    hasMovesLeft,
    isLandUnit,
    new Criterion((unit: Unit, to: Tile): boolean =>
      tileHasCity(to, cityRegistry)
    ),
    new Criterion(
      (unit: Unit, to: Tile): boolean => unitRegistry.getByTile(to).length === 0
    ),
    new Criterion(
      (unit: Unit, to: Tile): boolean =>
        cityRegistry.getByTile(to)!.player() !== unit.player()
    ),
    new Effect((unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
      const city = cityRegistry.getByTile(to)!;

      return new CaptureCity(from, to, unit, city, ruleRegistry) as UnitAction;
    })
  ),

  new Action(
    hasMovesLeft,
    isCurrentTile,
    new Criterion((unit: Unit): boolean => unit instanceof Fortifiable),
    new Criterion(
      (unit: Unit, to: Tile): boolean =>
        tileImprovementRegistry
          .getByTile(to)
          // TODO: Pillagable(sp?)Improvement subclass? or `CanBePillaged` `Rule`...
          .filter((improvement: TileImprovement): boolean =>
            [Irrigation, Mine, Railroad, Road].some(
              (Improvement: typeof TileImprovement): boolean =>
                improvement instanceof Improvement
            )
          ).length > 0
    ),
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new Pillage(from, to, unit, ruleRegistry, tileImprovementRegistry, turn)
    )
  ),

  new Action(
    hasMovesLeft,
    isCurrentTile,
    new Criterion((unit: Unit): boolean => unit instanceof Fortifiable),
    new Criterion((unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
      from.isLand()
    ),
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new Fortify(from, to, unit, ruleRegistry, turn, unitImprovementRegistry)
    )
  ),

  new Action(
    hasMovesLeft,
    isCurrentTile,
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new Sleep(from, to, unit, ruleRegistry, turn)
    )
  ),

  new Action(
    hasMovesLeft,
    isCurrentTile,
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new Disband(from, to, unit, ruleRegistry)
    )
  ),

  new Action(
    isCurrentTile,
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new NoOrders(from, to, unit, ruleRegistry)
    )
  ),

  new Action(
    hasMovesLeft,
    isCurrentTile,
    new Criterion((unit: Unit): boolean => unit instanceof Settlers),
    new Criterion((unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
      from.isLand()
    ),
    new Criterion(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
        !tileHasCity(from, cityRegistry)
    ),
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new FoundCity(from, to, unit, cityNameRegistry, ruleRegistry)
    )
  ),

  ...(
    [
      [
        Irrigation,
        BuildIrrigation,
        new Or(
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              from.terrain() instanceof River
          ),
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              from
                .getAdjacent()
                .some(
                  (tile: Tile): boolean =>
                    tile.terrain() instanceof River ||
                    tile.terrain() instanceof Water ||
                    (tileImprovementRegistry
                      .getByTile(tile)
                      .some(
                        (improvement: TileImprovement): boolean =>
                          improvement instanceof Irrigation
                      ) &&
                      !tileHasCity(tile, cityRegistry))
                )
          )
        ),
      ],
      [Mine, BuildMine],
      [Road, BuildRoad],
      [
        Railroad,
        BuildRailroad,
        new Criterion((unit: Unit, to: Tile) =>
          tileImprovementRegistry
            .getByTile(to)
            .some(
              (tileImprovement: TileImprovement) =>
                tileImprovement instanceof Road
            )
        ),
      ],
    ] as [typeof TileImprovement, typeof DelayedAction, ...Criterion[]][]
  ).map(
    ([Improvement, ActionType, ...additionalCriteria]: [
      typeof TileImprovement,
      typeof DelayedAction,
      ...Criterion[]
    ]): Action =>
      new Action(
        new Criterion((unit: Unit): boolean => unit instanceof Worker),
        hasMovesLeft,
        new Criterion(
          (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
            ruleRegistry
              .get(Available)
              .some((rule: Available): boolean =>
                rule.validate(from, Improvement, unit.player())
              )
        ),
        isCurrentTile,
        ...additionalCriteria,
        new Effect(
          (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
            new ActionType(from, to, unit, ruleRegistry, turn)
        )
      )
  ),
  ...(
    [
      [Jungle, ClearJungle],
      [Forest, ClearForest],
      [Plains, PlantForest],
      [Swamp, ClearSwamp],
    ] as [
      typeof Terrain,
      (
        | typeof ClearJungle
        | typeof ClearForest
        | typeof PlantForest
        | typeof ClearSwamp
      )
    ][]
  ).map(
    ([TerrainType, ActionType]: [
      typeof Terrain,
      (
        | typeof ClearJungle
        | typeof ClearForest
        | typeof PlantForest
        | typeof ClearSwamp
      )
    ]): Action =>
      new Action(
        hasMovesLeft,
        isCurrentTile,
        new Criterion((unit: Unit): boolean => unit instanceof Worker),
        new Criterion(
          (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
            from.terrain() instanceof TerrainType
        ),
        new Effect(
          (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
            new ActionType(
              from,
              to,
              unit,
              ruleRegistry,
              terrainFeatureRegistry,
              turn
            )
        )
      )
  ),

  new Action(
    isNeighbouringTile,
    hasMovesLeft,
    isLandUnit,
    new Criterion(
      (unit: Unit, to: Tile): boolean => to.terrain() instanceof Water
    ),
    new Criterion((unit: Unit, to: Tile): boolean =>
      unitRegistry
        .getByTile(to)
        .every((tileUnit: Unit): boolean => tileUnit.player() === unit.player())
    ),
    new Criterion((unit: Unit, to: Tile): boolean =>
      unitRegistry
        .getByTile(to)
        .filter((tileUnit: Unit): boolean => tileUnit instanceof NavalTransport)
        .some(
          (tileUnit: Unit): boolean =>
            (tileUnit as NavalTransport).hasCapacity() &&
            (tileUnit as NavalTransport).canStow(unit)
        )
    ),
    new Effect((unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
      const [transport] = unitRegistry
        .getByTile(to)
        .filter((tileUnit: Unit): boolean => tileUnit instanceof NavalTransport)
        .filter(
          (tileUnit: Unit): boolean =>
            (tileUnit as NavalTransport).hasCapacity() &&
            (tileUnit as NavalTransport).canStow(unit)
        );

      return new Embark(
        from,
        to,
        unit,
        transport as unknown as ITransport,
        ruleRegistry
      ) as UnitAction;
    })
  ),

  new Action(
    isNeighbouringTile,
    new Criterion((unit: Unit): boolean => {
      try {
        transportRegistry.getByUnit(unit);

        return true;
      } catch (e) {
        return false;
      }
    }),
    new Or(
      new Criterion(
        (unit: Unit, to: Tile): boolean => !(unit instanceof LandUnit)
      ),
      new Criterion((unit: Unit, to: Tile): boolean => to.isLand())
    ),
    new Criterion(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
        transportRegistry.getByUnit(unit).transport().tile() === from
    ),
    new Effect((unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
      const transport = transportRegistry.getByUnit(unit).transport();

      return new Disembark(
        from,
        to,
        unit,
        transport,
        ruleRegistry
      ) as UnitAction;
    })
  ),

  new Action(
    hasMovesLeft,
    isCurrentTile,
    new Criterion((unit: Unit): boolean => unit instanceof NavalTransport),
    new Criterion((unit: Unit): boolean => (unit as NavalTransport).hasCargo()),
    new Criterion((unit: Unit, to: Tile): boolean =>
      to.getNeighbours().some((tile: Tile): boolean => tile.isLand())
    ),
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new Unload(from, to, unit, ruleRegistry)
    )
  ),
];

export default getRules;
