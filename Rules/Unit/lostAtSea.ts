import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  UnitLossRegistry,
  instance as unitLossRegistryInstance,
} from '@civ-clone/core-unit/UnitLossRegistry';
import {
  countLosses,
  emitLostAtSea,
  sink,
} from '@civ-clone/base-unit-lifecycle/lib/lostAtSea';
import Effect from '@civ-clone/core-rule/Effect';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';

export const getRules: (
  engine?: Engine,
  unitLossRegistry?: UnitLossRegistry,
  transportRegistry?: TransportRegistry
) => LostAtSea[] = (
  engine: Engine = engineInstance,
  unitLossRegistry: UnitLossRegistry = unitLossRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance
): LostAtSea[] => [
  new LostAtSea(
    'civ1-unit:unit/lost-at-sea/emit',
    new Effect(emitLostAtSea(engine))
  ),
  new LostAtSea(
    // The ship and everything aboard are losses for the Military report, though no one destroyed them
    //  (civ-clone/web-renderer#405). Before `destroy`, while the manifests still say what's aboard.
    'civ1-unit:unit/lost-at-sea/count-loss',
    new Effect(countLosses(unitLossRegistry, transportRegistry))
  ),
  new LostAtSea('civ1-unit:unit/lost-at-sea/destroy', new Effect(sink)),
];

export default getRules;
