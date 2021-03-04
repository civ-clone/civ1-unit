import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  unitRegistry?: UnitRegistry,
  engine?: Engine
) => Defeated[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
  engine: Engine = engineInstance
): Defeated[] => [
  new Defeated(
    new Effect((unit: Unit): void => {
      unit.setDestroyed();

      unitRegistry.unregister(unit);
    })
  ),
  new Defeated(
    new Effect((unit: Unit, by: Unit): void => {
      engine.emit('unit:defeated', unit, by);
    })
  ),
];

export default getRules;
