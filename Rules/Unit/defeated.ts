import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry,
  tileImprovementRegistry?: TileImprovementRegistry,
  unitRegistry?: UnitRegistry,
  engine?: Engine
) => Defeated[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  engine: Engine = engineInstance
): Defeated[] => [
  new Defeated(
    new Effect((unit: Unit, by: Unit): void => {
      engine.emit('unit:defeated', unit, by);

      ruleRegistry.process(Destroyed, unit, by.player());
    })
  ),
  new Defeated(
    new Criterion((unit: Unit) => cityRegistry.getByTile(unit.tile()) === null),
    // TODO: Add `Fortress`es
    // new Criterion((unit: Unit) =>
    //   !tileImprovementRegistry.getByTile(unit.tile())
    //     .some((tileImprovement) => tileImprovement instanceof Fortress)
    // ),
    new Criterion(
      (unit: Unit) =>
        unitRegistry
          .getByTile(unit.tile())
          .filter(
            (tileUnit: Unit) =>
              tileUnit !== unit && tileUnit.player() === unit.player()
          ).length > 0
    ),
    new Effect((unit: Unit, by: Unit): void =>
      unitRegistry.getByTile(unit.tile()).forEach((tileUnit) => {
        if (!(tileUnit !== unit && tileUnit.player() === unit.player())) {
          return;
        }

        ruleRegistry.process(Destroyed, unit, by.player());
      })
    )
  ),
];

export default getRules;
