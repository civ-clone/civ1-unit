import { Engine } from '@civ-clone/core-engine/Engine';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
export declare const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine
) => Transferred[];
export default getRules;
