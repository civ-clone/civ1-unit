"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Sleep_1 = require("@civ-clone/base-unit-action-sleep/Sleep");
const Stowed_1 = require("@civ-clone/core-unit-transport/Rules/Stowed");
const getRules = () => [
    new Stowed_1.default(new Effect_1.default((unit) => unit.action(new Sleep_1.default(unit.tile(), unit.tile(), unit)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=stowed.js.map