import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';

export const getRules: (engine?: Engine) => LostAtSea[] = (
  engine: Engine = engineInstance
): LostAtSea[] => [
  new LostAtSea(
    new Effect((unit: ITransport): void => {
      engine.emit('unit:lost-at-sea', unit);
    })
  ),
  new LostAtSea(new Effect((unit: ITransport): void => unit.destroy(null))),
];

export default getRules;
