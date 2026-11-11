import { Fortified, Veteran } from '../UnitImprovements';
import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import { turnsAloftKey } from '../Rules/Player/turnEnd';

/**
 * Where `unit/transferred/start-afresh` runs among the `Transferred` rules: between `High` and `Normal`, so before
 * `unit/transferred/emit` tells a client the unit has changed sides. A rule that takes its place (`civ1-enhanced`'s)
 * runs there too, whichever package loads first.
 */
export const START_AFRESH_PRIORITY = 1500;

/**
 * `unit`, which has just changed sides, arrives as a new unit would: not fortified, with no moves until its new
 * owner's turn and, an aircraft, with its fuel full; and not a veteran, unless `keepVeteran`. Shared by `civ1-unit`'s
 * `unit/transferred/start-afresh` and `civ1-enhanced`'s, which keeps the unit's veteran status.
 */
export const startAfresh = (
  unit: Unit,
  keepVeteran: boolean = false,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
): void => {
  unitImprovementRegistry
    .getByUnit(unit)
    .filter(
      (improvement: UnitImprovement): boolean =>
        improvement instanceof Fortified ||
        (!keepVeteran && improvement instanceof Veteran)
    )
    .forEach((improvement: UnitImprovement): void =>
      unitImprovementRegistry.unregister(improvement)
    );

  const turnsAloft = strategyNoteRegistry.getByKey(turnsAloftKey(unit));

  if (turnsAloft) {
    strategyNoteRegistry.unregister(turnsAloft);
  }

  unit.setBusy();
  unit.moves().set(0);
  unit.applyVisibility();
};

export default startAfresh;
