"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const UnitImprovements_1 = require("../../UnitImprovements");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Transferred_1 = require("@civ-clone/core-unit/Rules/Transferred");
const getRules = (unitImprovementRegistry = UnitImprovementRegistry_1.instance, engine = Engine_1.instance) => [
    // v474.05 deletes a bribed or defecting unit and creates a new one for its new owner, so it arrives as a new unit
    //  would: not a veteran, not fortified, and with no moves until its new owner's turn (Rome on 640K a Day, p273).
    new Transferred_1.default('civ1-unit:unit/transferred/start-afresh', new Effect_1.default((unit) => {
        unitImprovementRegistry
            .getByUnit(unit)
            .filter((improvement) => improvement instanceof UnitImprovements_1.Fortified || improvement instanceof UnitImprovements_1.Veteran)
            .forEach((improvement) => unitImprovementRegistry.unregister(improvement));
        unit.setBusy();
        unit.moves().set(0);
        unit.applyVisibility();
    })),
    new Transferred_1.default('civ1-unit:unit/transferred/emit', new Effect_1.default((unit, player, previousPlayer) => {
        engine.emit('unit:transferred', unit, player, previousPlayer);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=transferred.js.map