"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerActions_1 = require("../../PlayerActions");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const playerAction_1 = require("@civ-clone/base-unit-lifecycle/lib/playerAction");
const Action_1 = require("@civ-clone/core-player/Rules/Action");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitRegistry = UnitRegistry_1.instance) => {
    return [
        new Action_1.default('civ1-unit:player/action/active-units', new Criterion_1.default((0, playerAction_1.hasActiveUnits)(unitRegistry)), new Effect_1.default((0, playerAction_1.activeUnits)(unitRegistry, PlayerActions_1.ActiveUnit))),
        new Action_1.default('civ1-unit:player/action/inactive-units', new Criterion_1.default((0, playerAction_1.hasInactiveUnits)(unitRegistry)), new Effect_1.default((0, playerAction_1.inactiveUnits)(unitRegistry, PlayerActions_1.InactiveUnit))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map