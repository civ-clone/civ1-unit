import {
  Action,
  hasMovesLeft,
  isNeighbouringTile,
} from '@civ-clone/core-unit/Rules/Action';
import {
  Attack,
  BuildIrrigation,
  BuildMine,
  BuildRoad,
  CaptureCity,
  ClearForest,
  ClearJungle,
  ClearSwamp,
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
  Available,
  IAvailableRegistry,
} from '@civ-clone/core-tile-improvement/Rules/Available';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import { Fortifiable, Land as LandUnit, Naval } from '../../Types';
import {
  Irrigation,
  Mine,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import {
  Forest,
  Jungle,
  Plains,
  River,
  Swamp,
} from '@civ-clone/civ1-world/Terrains';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import And from '@civ-clone/core-rule/Criteria/And';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Or from '@civ-clone/core-rule/Criteria/Or';
import { Settlers } from '../../Units';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import { Water } from '@civ-clone/core-terrain/Types/Water';
import { NavalTransport, Worker } from '../../Types';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';

export const getRules: (
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry,
  tileImprovementRegistry?: TileImprovementRegistry,
  unitRegistry?: UnitRegistry,
  transportRegistry?: TransportRegistry
) => Action[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance
) => {
  return [
    new Action(
      isNeighbouringTile,
      hasMovesLeft,
      new Or(
        new And(
          new Criterion(
            (unit: Unit, to: Tile): boolean => unit instanceof LandUnit
          ),
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              from.isLand()
          ),
          new Criterion((unit: Unit, to: Tile): boolean => to.isLand()),
          new Criterion((unit: Unit, to: Tile): boolean =>
            unitRegistry
              .getByTile(to)
              .every(
                (tileUnit: Unit): boolean => tileUnit.player() === unit.player()
              )
          )
        ),
        new And(
          new Criterion(
            (unit: Unit, to: Tile): boolean => unit instanceof Naval
          ),
          new Or(
            new Criterion(
              (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
                from.isWater()
            ),
            new Criterion(
              (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
                cityRegistry
                  .getByTile(from)
                  .some(
                    (city: City): boolean => city.player() === unit.player()
                  )
            )
          ),
          new Or(
            new Criterion((unit: Unit, to: Tile): boolean => to.isWater()),
            new Criterion((unit: Unit, to: Tile) =>
              cityRegistry
                .getByTile(to)
                .some((city: City): boolean => city.player() === unit.player())
            )
          )
        )
      ),
      new Or(
        new Criterion(
          (unit: Unit, to: Tile): boolean => !(unit instanceof LandUnit)
        ),
        new Or(
          new Criterion(
            (unit: Unit, to: Tile): boolean =>
              !cityRegistry.getByTile(to).length
          ),
          new Criterion((unit: Unit, to: Tile): boolean =>
            cityRegistry
              .getByTile(to)
              .every((city: City): boolean => city.player() === unit.player())
          )
        )
      ),

      // This is analogous to the original Civilization unit adjacency rules
      new Or(
        new Criterion(
          (unit: Unit, to: Tile): boolean => !(unit instanceof LandUnit)
        ),
        new Criterion(
          (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
            !(
              from
                .getNeighbours()
                .some((tile: Tile) =>
                  unitRegistry
                    .getByTile(tile)
                    .some(
                      (tileUnit: Unit): boolean =>
                        tileUnit.player() !== unit.player()
                    )
                ) &&
              to
                .getNeighbours()
                .some((tile: Tile) =>
                  unitRegistry
                    .getByTile(tile)
                    .some(
                      (tileUnit: Unit): boolean =>
                        tileUnit.player() !== unit.player()
                    )
                )
            )
        )
      ),
      new Criterion((unit: Unit, to: Tile): boolean =>
        unitRegistry
          .getByTile(to)
          .every(
            (tileUnit: Unit): boolean => tileUnit.player() === unit.player()
          )
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Move(from, to, unit, ruleRegistry) as UnitAction
      )
    ),

    new Action(
      isNeighbouringTile,
      hasMovesLeft,
      new Or(
        new And(
          new Criterion(
            (unit: Unit, to: Tile): boolean => unit instanceof LandUnit
          ),
          new Criterion((unit: Unit, to: Tile): boolean => to.isLand())
        ),
        new And(
          new Criterion(
            (unit: Unit, to: Tile): boolean => unit instanceof Naval
          ),
          new Or(
            new Criterion((unit: Unit, to: Tile): boolean => to.isWater()),
            new And(
              new Criterion((unit: Unit, to: Tile): boolean =>
                unitRegistry
                  .getByTile(to)
                  .some(
                    (tileUnit: Unit): boolean =>
                      tileUnit.player() !== unit.player()
                  )
              )
            )
          )
        )
      ),
      new Criterion((unit: Unit, to: Tile): boolean =>
        unitRegistry
          .getByTile(to)
          // this will return false if there are no other units on the tile
          .some(
            (tileUnit: Unit): boolean => tileUnit.player() !== unit.player()
          )
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Attack(from, to, unit, ruleRegistry)
      )
    ),

    new Action(
      isNeighbouringTile,
      hasMovesLeft,
      new Criterion((unit: Unit, to: Tile): boolean =>
        cityRegistry
          .getByTile(to)
          .some((city: City): boolean => city.player() !== unit.player())
      ),
      new Criterion(
        (unit: Unit, to: Tile): boolean => unit instanceof LandUnit
      ),
      new Criterion(
        (unit: Unit, to: Tile): boolean =>
          unitRegistry.getByTile(to).length === 0
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
          const [city] = cityRegistry.getByTile(to);

          return new CaptureCity(
            from,
            to,
            unit,
            city,
            ruleRegistry
          ) as UnitAction;
        }
      )
    ),

    new Action(
      hasMovesLeft,
      new Criterion((unit: Unit): boolean => unit instanceof Fortifiable),
      new Criterion(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean => from === to
      ),
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
          new Pillage(from, to, unit, ruleRegistry)
      )
    ),

    new Action(
      hasMovesLeft,
      new Criterion((unit: Unit): boolean => unit instanceof Fortifiable),
      new Criterion((unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
        from.isLand()
      ),
      new Criterion(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean => from === to
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Fortify(from, to, unit, ruleRegistry)
      )
    ),

    new Action(
      hasMovesLeft,
      new Criterion(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean => from === to
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Sleep(from, to, unit, ruleRegistry)
      )
    ),

    new Action(
      new Criterion(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean => from === to
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new NoOrders(from, to, unit, ruleRegistry)
      )
    ),

    new Action(
      hasMovesLeft,
      new Criterion((unit: Unit): boolean => unit instanceof Settlers),
      new Criterion((unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
        from.isLand()
      ),
      new Criterion(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
          !cityRegistry.getByTile(from).length
      ),
      new Criterion(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean => from === to
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new FoundCity(from, to, unit, ruleRegistry)
      )
    ),

    ...([
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
              from.isCoast()
          ),
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              from
                .getAdjacent()
                .some(
                  (tile: Tile): boolean =>
                    tile.terrain() instanceof River ||
                    (tileImprovementRegistry
                      .getByTile(tile)
                      .some(
                        (improvement: TileImprovement): boolean =>
                          improvement instanceof Irrigation
                      ) &&
                      !cityRegistry.getByTile(tile).length)
                )
          )
        ),
      ],
      [Mine, BuildMine],
      [Road, BuildRoad],
    ] as [typeof TileImprovement, typeof UnitAction, ...Criterion[]][]).map(
      ([Improvement, ActionType, ...additionalCriteria]: [
        typeof TileImprovement,
        typeof UnitAction,
        ...Criterion[]
      ]): Action =>
        new Action(
          new Criterion((unit: Unit): boolean => unit instanceof Worker),
          hasMovesLeft,
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              (ruleRegistry as IAvailableRegistry)
                .get(Available)
                .some((rule: Available): boolean =>
                  rule.validate(from, Improvement, unit.player())
                )
          ),
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              from === to
          ),
          new Criterion(
            (unit: Unit, to: Tile): boolean =>
              !tileImprovementRegistry
                .getByTile(to)
                .some(
                  (improvement: TileImprovement): boolean =>
                    improvement instanceof Improvement
                )
          ),
          ...additionalCriteria,
          new Effect(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
              new ActionType(from, to, unit, ruleRegistry)
          )
        )
    ),
    ...([
      [Jungle, ClearJungle],
      [Forest, ClearForest],
      [Plains, PlantForest],
      [Swamp, ClearSwamp],
    ] as [typeof Terrain, typeof UnitAction][]).map(
      ([TerrainType, ActionType]: [
        typeof Terrain,
        typeof UnitAction
      ]): Action =>
        new Action(
          hasMovesLeft,
          new Criterion((unit: Unit): boolean => unit instanceof Worker),
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              to === from
          ),
          new Criterion(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
              from.terrain() instanceof TerrainType
          ),
          new Effect(
            (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
              new ActionType(from, to, unit, ruleRegistry)
          )
        )
    ),

    new Action(
      isNeighbouringTile,
      hasMovesLeft,
      new Criterion((unit: Unit): boolean => unit instanceof LandUnit),
      new Criterion(
        (unit: Unit, to: Tile): boolean => to.terrain() instanceof Water
      ),
      new Criterion((unit: Unit, to: Tile): boolean =>
        unitRegistry
          .getByTile(to)
          .every(
            (tileUnit: Unit): boolean => tileUnit.player() === unit.player()
          )
      ),
      new Criterion((unit: Unit, to: Tile): boolean =>
        unitRegistry
          .getByTile(to)
          .filter(
            (tileUnit: Unit): boolean => tileUnit instanceof NavalTransport
          )
          .some((tileUnit: Unit): boolean =>
            (tileUnit as NavalTransport).hasCapacity()
          )
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
          const [transport] = unitRegistry
            .getByTile(to)
            .filter(
              (tileUnit: Unit): boolean => tileUnit instanceof NavalTransport
            )
            .filter((tileUnit: Unit): boolean =>
              (tileUnit as NavalTransport).hasCapacity()
            );

          return new Embark(
            from,
            to,
            unit,
            (transport as unknown) as ITransport,
            ruleRegistry
          ) as UnitAction;
        }
      )
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
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
          const transport = transportRegistry.getByUnit(unit).transport();

          return new Disembark(
            from,
            to,
            unit,
            transport,
            ruleRegistry
          ) as UnitAction;
        }
      )
    ),

    new Action(
      hasMovesLeft,
      new Criterion((unit: Unit): boolean => unit instanceof NavalTransport),
      new Criterion((unit: Unit): boolean =>
        (unit as NavalTransport).hasCargo()
      ),
      new Criterion(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean => from === to
      ),
      new Criterion((unit: Unit, to: Tile): boolean =>
        to.getNeighbours().some((tile: Tile): boolean => tile.isLand())
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Unload(from, to, unit, ruleRegistry)
      )
    ),
  ];
};

export default getRules;
