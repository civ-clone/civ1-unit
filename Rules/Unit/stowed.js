"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Stowed_1 = require("@civ-clone/core-unit-transport/Rules/Stowed");
const stowed_1 = require("@civ-clone/base-unit-lifecycle/lib/stowed");
const getRules = () => [
    new Stowed_1.default('civ1-unit:unit/stowed/sleep', new Effect_1.default(stowed_1.sleepAboard)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=stowed.js.map