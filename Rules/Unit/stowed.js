"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Stowed_1 = require("@civ-clone/core-unit-transport/Rules/Stowed");
const stowed_1 = require("@civ-clone/base-unit-lifecycle/lib/stowed");
// A unit that has just boarded sleeps aboard, looking for enemies among the game's own units
//  (civ-clone/web-renderer#1110).
const getRules = (ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new Stowed_1.default('civ1-unit:unit/stowed/sleep', new Effect_1.default((0, stowed_1.sleepAboardWith)(ruleRegistry, turn, unitRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=stowed.js.map