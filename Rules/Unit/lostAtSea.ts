import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Effect from '@civ-clone/core-rule/Effect';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (engine?: Engine) => LostAtSea[] = (
  engine: Engine = engineInstance
): LostAtSea[] => [
  new LostAtSea(
    new Effect((unit: Unit): void => {
      engine.emit('unit:lost-at-sea', unit);
    })
  ),
  new LostAtSea(new Effect((unit: Unit): void => unit.destroy())),
];

export default getRules;
