"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Unsupported_1 = require("@civ-clone/core-unit/Rules/Unsupported");
const unsupported_1 = require("@civ-clone/base-unit-lifecycle/lib/unsupported");
const getRules = (engine = Engine_1.instance) => [
    new Unsupported_1.default('civ1-unit:unit/unsupported/emit', new Effect_1.default((0, unsupported_1.emitUnsupported)(engine))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=unsupported.js.map