import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  unitRegistry?: UnitRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine
) => Destroyed[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  engine: Engine = engineInstance
): Destroyed[] => [
  new Destroyed(
    new Effect((unit: Unit, player: Player | null): void => {
      engine.emit('unit:destroyed', unit, player);
    })
  ),
  new Destroyed(
    new Effect((unit: Unit): void => unitRegistry.unregister(unit))
  ),
  new Destroyed(
    new Effect((unit: Unit): void => {
      unit.setActive(false);
      unit.setDestroyed();
    })
  ),
  new Destroyed(
    new Effect((unit: Unit): void =>
      unitImprovementRegistry
        .getByUnit(unit)
        .forEach((unitImprovement) =>
          unitImprovementRegistry.unregister(unitImprovement)
        )
    )
  ),
];

export default getRules;
