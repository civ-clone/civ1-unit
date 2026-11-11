import { Engine } from '@civ-clone/core-engine/Engine';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Created from '@civ-clone/core-unit/Rules/Created';
export declare const getRules: (
  unitRegistry?: UnitRegistry,
  engine?: Engine
) => Created[];
export default getRules;
