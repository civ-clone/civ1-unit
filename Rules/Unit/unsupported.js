"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Unsupported_1 = require("@civ-clone/core-unit/Rules/Unsupported");
const getRules = (engine = Engine_1.instance) => [
    new Unsupported_1.default(new Effect_1.default((city, unit) => {
        engine.emit('unit:unsupported', city, unit);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=unsupported.js.map