import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Effect from '@civ-clone/core-rule/Effect';
import Halted from '@civ-clone/base-unit-action-goto/Rules/Halted';
import { emitHalted } from '@civ-clone/base-unit-lifecycle/lib/halted';

export const getRules: (engine?: Engine) => Halted[] = (
  engine: Engine = engineInstance
): Halted[] => [
  // A GoTo stopped next to its destination for the player to choose what to do there (civ-clone/web-renderer#357).
  new Halted('civ1-unit:unit/halted/emit', new Effect(emitHalted(engine))),
];

export default getRules;
