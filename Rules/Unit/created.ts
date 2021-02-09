import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Created from '@civ-clone/core-unit/Rules/Created';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  unitRegistry?: UnitRegistry,
  engine?: Engine
) => Created[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
  engine: Engine = engineInstance
): Created[] => [
  new Created(new Effect((unit: Unit): void => unitRegistry.register(unit))),
  new Created(
    new Effect((unit: Unit): void => unit.moves().set(unit.movement()))
  ),
  new Created(
    new Effect((unit: Unit): void => {
      engine.emit('unit:created', unit);
    })
  ),
];

export default getRules;
