import { Engine } from '@civ-clone/core-engine/Engine';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { UnitLossRegistry } from '@civ-clone/core-unit/UnitLossRegistry';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
export declare const getRules: (
  engine?: Engine,
  unitLossRegistry?: UnitLossRegistry,
  transportRegistry?: TransportRegistry
) => LostAtSea[];
export default getRules;
