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
import {
  defended,
  destroyStack,
  emitAndDestroy,
  hasStack,
  notInCity,
} from '@civ-clone/base-unit-lifecycle/lib/defeated';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';

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
    'civ1-unit:unit/defeated/emit-and-destroy',
    // High, so the beaten unit is destroyed, and counted as a loss to the winner, before any other package's
    //  `Defeated` rule runs: before `civ1-city` shrinks, or destroys, the city it defended, as v474.05's `battle`
    //  (`BATTLE.C`) drops the defender before `vanish` (`CONTROL.C`) removes the city. Shrinking first destroyed a
    //  defender the city supported, or every unit of a player losing its last city, by no one, so the loss went
    //  uncounted (civ-clone/web-renderer#1000).
    new High(),
    // The action is the attack, so a listener can tell the attacker from the defender: `action.unit()` attacked.
    new Effect(emitAndDestroy(engine, ruleRegistry))
  ),
  new Defeated(
    'civ1-unit:unit/defeated/destroy-stack',
    // `Attack` processes `Defeated` for a losing attacker too; only a defeated defender takes its stack with it.
    new Criterion(defended),
    new Criterion(notInCity(cityRegistry)),
    // TODO: Add `Fortress`es
    // new Criterion((unit: Unit) =>
    //   !tileImprovementRegistry.getByTile(unit.tile())
    //     .some((tileImprovement) => tileImprovement instanceof Fortress)
    // ),
    new Criterion(hasStack(unitRegistry)),
    new Effect(destroyStack(unitRegistry, ruleRegistry))
  ),
];

export default getRules;
