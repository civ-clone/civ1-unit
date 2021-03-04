"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Defeated_1 = require("@civ-clone/core-unit/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitRegistry = UnitRegistry_1.instance, engine = Engine_1.instance) => [
    new Defeated_1.default(new Effect_1.default((unit) => {
        unit.setDestroyed();
        unitRegistry.unregister(unit);
    })),
    new Defeated_1.default(new Effect_1.default((unit, by) => {
        engine.emit('unit:defeated', unit, by);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map