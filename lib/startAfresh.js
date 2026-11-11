"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAfresh = exports.START_AFRESH_PRIORITY = void 0;
const UnitImprovements_1 = require("../UnitImprovements");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const turnEnd_1 = require("../Rules/Player/turnEnd");
/**
 * Where a rule that takes the place of `unit/transferred/start-afresh` (`civ1-enhanced`'s) runs among the
 * `Transferred` rules: between `High` and `Normal`, so before `unit/transferred/emit` tells a client the unit has
 * changed sides, whichever package loads first. `start-afresh` itself is registered just before `emit`.
 */
exports.START_AFRESH_PRIORITY = 1500;
/**
 * `unit`, which has just changed sides, arrives as a new unit would: not fortified, with no moves until its new
 * owner's turn and, an aircraft, with its fuel full; and not a veteran, unless `keepVeteran`. Shared by `civ1-unit`'s
 * `unit/transferred/start-afresh` and `civ1-enhanced`'s, which keeps the unit's veteran status.
 */
const startAfresh = (unit, keepVeteran = false, unitImprovementRegistry = UnitImprovementRegistry_1.instance, strategyNoteRegistry = StrategyNoteRegistry_1.instance) => {
    unitImprovementRegistry
        .getByUnit(unit)
        .filter((improvement) => improvement instanceof UnitImprovements_1.Fortified ||
        (!keepVeteran && improvement instanceof UnitImprovements_1.Veteran))
        .forEach((improvement) => unitImprovementRegistry.unregister(improvement));
    const turnsAloft = strategyNoteRegistry.getByKey((0, turnEnd_1.turnsAloftKey)(unit));
    if (turnsAloft) {
        strategyNoteRegistry.unregister(turnsAloft);
    }
    unit.setBusy();
    unit.moves().set(0);
    unit.applyVisibility();
};
exports.startAfresh = startAfresh;
exports.default = exports.startAfresh;
//# sourceMappingURL=startAfresh.js.map