"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const LostAtSea_1 = require("@civ-clone/core-unit-transport/Rules/LostAtSea");
const getRules = (engine = Engine_1.instance) => [
    new LostAtSea_1.default(new Effect_1.default((unit) => {
        engine.emit('unit:lost-at-sea', unit);
    })),
    new LostAtSea_1.default(new Effect_1.default((unit) => unit.destroy())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=lostAtSea.js.map