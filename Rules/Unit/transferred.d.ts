import { Engine } from '@civ-clone/core-engine/Engine';
import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
export declare const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine,
  strategyNoteRegistry?: StrategyNoteRegistry
) => Transferred[];
export default getRules;
