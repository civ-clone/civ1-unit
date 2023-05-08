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
  GoTo,
  Move,
  NoOrders,
  Pillage,
  PlantForest,
  Sleep,
  SneakAttack,
  SneakCaptureCity,
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
import { Fighter, Settlers, Submarine } from '../../Units';
import {
  Forest,
  Jungle,
  Plains,
  River,
  Swamp,
} from '@civ-clone/civ1-world/Terrains';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  Irrigation,
  Mine,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import { Land, Water } from '@civ-clone/core-terrain/Types';
import {
  PathFinderRegistry,
  instance as pathFinderRegistryInstance,
} from '@civ-clone/core-world-path/PathFinderRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
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
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import And from '@civ-clone/core-rule/Criteria/And';
import Available from '@civ-clone/core-tile-improvement/Rules/Available';
import Criterion from '@civ-clone/core-rule/Criterion';
import DelayedAction from '@civ-clone/core-unit/DelayedAction';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import Or from '@civ-clone/core-rule/Criteria/Or';
import Path from '@civ-clone/core-world-path/Path';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
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

export const getRules = (
  cityNameRegistry: CityNameRegistry = cityNameRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance,
  turn: Turn = turnInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  pathFinderRegistry: PathFinderRegistry = pathFinderRegistryInstance,
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
): Action[] => {
  const attackCriteria = [
      isNeighbouringTile,
      hasMovesLeft,
      new Criterion((unit: Unit, to: Tile): boolean =>
        unitRegistry
          .getByTile(to)
          .some(
            (tileUnit: Unit): boolean => tileUnit.player() !== unit.player()
          )
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
            new Criterion(
              (unit: Unit, to: Tile) => !(unit instanceof Submarine)
            ),
            // ...or the `Tile` is `Water`.
            new Criterion((unit: Unit, to: Tile) => to.isWater())
          )
        )
      ),
    ],
    captureCityCriteria = [
      isNeighbouringTile,
      hasMovesLeft,
      isLandUnit,
      new Criterion((unit: Unit, to: Tile): boolean =>
        tileHasCity(to, cityRegistry)
      ),
      new Criterion(
        (unit: Unit, to: Tile): boolean =>
          unitRegistry.getByTile(to).length === 0
      ),
      new Criterion(
        (unit: Unit, to: Tile): boolean =>
          cityRegistry.getByTile(to)!.player() !== unit.player()
      ),
    ];

  return [
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
      ...attackCriteria,
      new Criterion((unit: Unit, to: Tile): boolean =>
        unitRegistry.getByTile(to).every((tileUnit) =>
          interactionRegistry
            .getByPlayers(unit.player(), tileUnit.player())
            .filter(
              (interaction): interaction is Peace =>
                interaction instanceof Peace
            )
            .every((interaction) => interaction.expired())
        )
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Attack(from, to, unit, ruleRegistry, unitRegistry)
      )
    ),

    new Action(
      ...attackCriteria,
      new Criterion((unit: Unit, to: Tile): boolean =>
        unitRegistry
          .getByTile(to)
          .every((tileUnit) =>
            interactionRegistry
              .getByPlayers(unit.player(), tileUnit.player())
              .some(
                (interaction): interaction is Peace =>
                  interaction instanceof Peace && interaction.active()
              )
          )
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
          const enemies = Array.from(
            new Set(
              unitRegistry
                .getByTile(to)
                .filter((tileUnit) =>
                  interactionRegistry
                    .getByPlayers(unit.player(), tileUnit.player())
                    .some(
                      (interaction): interaction is Peace =>
                        interaction instanceof Peace && interaction.active()
                    )
                )
                .map((unit) => unit.player())
            )
          );

          if (enemies.length > 1) {
            console.warn('Multiple targets for declaring war:');
            console.warn(enemies);
            console.warn('core-unit/Rules/Unit/action.ts');
          }

          return new SneakAttack(
            from,
            to,
            unit,
            enemies[0],
            ruleRegistry,
            unitRegistry
          ) as UnitAction;
        }
      )
    ),

    new Action(
      ...captureCityCriteria,
      new Criterion((unit: Unit, to: Tile): boolean => {
        const city = cityRegistry.getByTile(to)!;

        return interactionRegistry
          .getByPlayers(unit.player(), city.player())
          .filter(
            (interaction): interaction is Peace => interaction instanceof Peace
          )
          .every((interaction) => interaction.expired());
      }),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
          const city = cityRegistry.getByTile(to)!;

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
      ...captureCityCriteria,
      new Criterion((unit: Unit, to: Tile): boolean => {
        const city = cityRegistry.getByTile(to)!;

        return interactionRegistry
          .getByPlayers(unit.player(), city.player())
          .filter(
            (interaction): interaction is Peace => interaction instanceof Peace
          )
          .some((interaction) => interaction.active());
      }),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
          const city = cityRegistry.getByTile(to)!;

          return new SneakCaptureCity(
            from,
            to,
            unit,
            city,
            city.player(),
            ruleRegistry
          ) as UnitAction;
        }
      )
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
          new Pillage(
            from,
            to,
            unit,
            ruleRegistry,
            tileImprovementRegistry,
            turn
          )
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
          new Fortify(
            from,
            to,
            unit,
            ruleRegistry,
            turn,
            unitImprovementRegistry
          )
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
          new FoundCity(
            from,
            to,
            unit,
            cityNameRegistry,
            ruleRegistry,
            workedTileRegistry
          )
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
          .some(
            (tileUnit: Unit): boolean =>
              (tileUnit as NavalTransport).hasCapacity() &&
              (tileUnit as NavalTransport).canStow(unit)
          )
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction => {
          const [transport] = unitRegistry
            .getByTile(to)
            .filter(
              (tileUnit: Unit): boolean => tileUnit instanceof NavalTransport
            )
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
      isCurrentTile,
      new Criterion((unit: Unit): boolean => unit instanceof NavalTransport),
      new Criterion((unit: Unit): boolean =>
        (unit as NavalTransport).hasCargo()
      ),
      new Criterion((unit: Unit, to: Tile): boolean =>
        to.getNeighbours().some((tile: Tile): boolean => tile.isLand())
      ),
      new Effect(
        (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Unload(from, to, unit, ruleRegistry)
      )
    ),

    new Action(
      hasMovesLeft,
      new Criterion(
        (unit: Unit, to: Tile, from: Tile) =>
          to !== from && !to.isNeighbourOf(from)
      ),
      new Criterion((unit: Unit, to: Tile, from: Tile) => {
        const [PathFinder] = pathFinderRegistry.entries();

        if (!PathFinder) {
          return false;
        }

        const path = new PathFinder(unit, from, to).generate();

        return path instanceof Path;
      }),
      new Effect(
        (unit: Unit, to: Tile, from: Tile): UnitAction =>
          new GoTo(
            from,
            to,
            unit,
            ruleRegistry,
            pathFinderRegistry,
            strategyNoteRegistry
          )
      )
    ),
  ];
};

export default getRules;
