"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Destroyed_1 = require("@civ-clone/core-unit/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitRegistry = UnitRegistry_1.instance, engine = Engine_1.instance) => [
    new Destroyed_1.default(new Effect_1.default((unit, player) => {
        engine.emit('unit:destroyed', unit, player);
    })),
    new Destroyed_1.default(new Effect_1.default((unit) => unitRegistry.unregister(unit))),
    new Destroyed_1.default(new Effect_1.default((unit) => {
        unit.setActive(false);
        unit.setDestroyed();
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=destroyed.js.map