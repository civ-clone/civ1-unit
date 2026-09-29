import { Engine } from '@civ-clone/core-engine/Engine';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
export declare const getRules: (
  unitRegistry?: UnitRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine,
  transportRegistry?: TransportRegistry
) => Destroyed[];
export default getRules;
