"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BuildCost_1 = require("@civ-clone/core-city-build/Rules/BuildCost");
const Units_1 = require("../../Units");
const getRules = () => [
    ...[
        [Units_1.Catapult, 40],
        [Units_1.Chariot, 40],
        [Units_1.Horseman, 20],
        [Units_1.Knight, 40],
        [Units_1.Musketman, 30],
        [Units_1.Sail, 40],
        [Units_1.Settlers, 40],
        [Units_1.Spearman, 20],
        [Units_1.Swordman, 20],
        [Units_1.Trireme, 40],
        [Units_1.Warrior, 10],
    ].flatMap(([UnitType, cost]) => BuildCost_1.buildCost(UnitType, cost)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=buildCost.js.map