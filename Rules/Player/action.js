"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerActions_1 = require("../../PlayerActions");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Action_1 = require("@civ-clone/core-player/Rules/Action");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitRegistry = UnitRegistry_1.instance) => {
    return [
        new Action_1.default(new Criterion_1.default((player) => unitRegistry
            .getByPlayer(player)
            .some((unit) => unit.active() && unit.moves().value())), new Effect_1.default((player) => unitRegistry
            .getByPlayer(player)
            .filter((unit) => unit.active() && unit.moves().value() > 0)
            .sort((a, b) => (a.waiting() ? 1 : 0) - (b.waiting() ? 1 : 0))
            .map((unit) => new PlayerActions_1.ActiveUnit(player, unit)))),
        new Action_1.default(new Criterion_1.default((player) => unitRegistry
            .getByPlayer(player)
            .some((unit) => !unit.active() || !unit.moves().value())), new Effect_1.default((player) => unitRegistry
            .getByPlayer(player)
            .filter((unit) => !unit.active() || unit.moves().value() === 0)
            .sort((a, b) => (a.waiting() ? 1 : 0) - (b.waiting() ? 1 : 0))
            .map((unit) => new PlayerActions_1.InactiveUnit(player, unit)))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map