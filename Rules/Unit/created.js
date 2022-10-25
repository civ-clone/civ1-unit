"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Created_1 = require("@civ-clone/core-unit/Rules/Created");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitRegistry = UnitRegistry_1.instance, engine = Engine_1.instance) => [
    new Created_1.default(new Effect_1.default((unit) => unitRegistry.register(unit))),
    new Created_1.default(new Effect_1.default((unit) => unit.applyVisibility())),
    new Created_1.default(new Effect_1.default((unit) => unit.moves().set(unit.movement()))),
    new Created_1.default(new Effect_1.default((unit) => {
        engine.emit('unit:created', unit);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map