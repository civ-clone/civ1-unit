"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const created_1 = require("@civ-clone/base-unit-lifecycle/lib/created");
const Created_1 = require("@civ-clone/core-unit/Rules/Created");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitRegistry = UnitRegistry_1.instance, engine = Engine_1.instance) => [
    new Created_1.default('civ1-unit:unit/created/register', new Effect_1.default((0, created_1.registerUnit)(unitRegistry))),
    new Created_1.default('civ1-unit:unit/created/apply-visibility', new Effect_1.default(created_1.applyVisibility)),
    new Created_1.default('civ1-unit:unit/created/set-moves', new Effect_1.default(created_1.setMoves)),
    new Created_1.default('civ1-unit:unit/created/emit', new Effect_1.default((0, created_1.emitCreated)(engine))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map