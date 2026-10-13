import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Effect from '@civ-clone/core-rule/Effect';
import Halted from '@civ-clone/base-unit-action-goto/Rules/Halted';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (engine?: Engine) => Halted[] = (
  engine: Engine = engineInstance
): Halted[] => [
  // A GoTo stopped next to its destination for the player to choose what to do there (civ-clone/web-renderer#357).
  new Halted(
    'civ1-unit:unit/halted/emit',
    new Effect((unit: Unit, target: Tile): void => {
      engine.emit('unit:halted', unit, target);
    })
  ),
];

export default getRules;
