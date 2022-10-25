import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';

export const getRules: (engine?: Engine) => Unsupported[] = (
  engine: Engine = engineInstance
): Unsupported[] => [
  new Unsupported(
    new Effect((city: City, unit: Unit): void => {
      engine.emit('unit:unsupported', city, unit);
    })
  ),
];

export default getRules;
