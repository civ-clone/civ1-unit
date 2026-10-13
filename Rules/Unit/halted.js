"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Halted_1 = require("@civ-clone/base-unit-action-goto/Rules/Halted");
const getRules = (engine = Engine_1.instance) => [
    // A GoTo stopped next to its destination for the player to choose what to do there (civ-clone/web-renderer#357).
    new Halted_1.default('civ1-unit:unit/halted/emit', new Effect_1.default((unit, target) => {
        engine.emit('unit:halted', unit, target);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=halted.js.map