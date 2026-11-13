import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Effect from '@civ-clone/core-rule/Effect';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';
import { emitUnsupported } from '@civ-clone/base-unit-lifecycle/lib/unsupported';

export const getRules: (engine?: Engine) => Unsupported[] = (
  engine: Engine = engineInstance
): Unsupported[] => [
  new Unsupported(
    'civ1-unit:unit/unsupported/emit',
    new Effect(emitUnsupported(engine))
  ),
];

export default getRules;
