import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
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
  engine?: Engine
) => Destroyed[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
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
];

export default getRules;
