import { Engine } from '@civ-clone/core-engine/Engine';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
export declare const getRules: (
  unitRegistry?: UnitRegistry,
  engine?: Engine
) => Defeated[];
export default getRules;
