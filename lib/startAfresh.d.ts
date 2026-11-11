import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Where `unit/transferred/start-afresh` runs among the `Transferred` rules: between `High` and `Normal`, so before
 * `unit/transferred/emit` tells a client the unit has changed sides. A rule that takes its place (`civ1-enhanced`'s)
 * runs there too, whichever package loads first.
 */
export declare const START_AFRESH_PRIORITY = 1500;
/**
 * `unit`, which has just changed sides, arrives as a new unit would: not fortified, with no moves until its new
 * owner's turn and, an aircraft, with its fuel full; and not a veteran, unless `keepVeteran`. Shared by `civ1-unit`'s
 * `unit/transferred/start-afresh` and `civ1-enhanced`'s, which keeps the unit's veteran status.
 */
export declare const startAfresh: (
  unit: Unit,
  keepVeteran?: boolean,
  unitImprovementRegistry?: UnitImprovementRegistry,
  strategyNoteRegistry?: StrategyNoteRegistry
) => void;
export default startAfresh;
