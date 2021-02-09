import { Engine } from '@civ-clone/core-engine/Engine';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
export declare const getRules: (
  unitRegistry?: UnitRegistry,
  engine?: Engine
) => Destroyed[];
export default getRules;
