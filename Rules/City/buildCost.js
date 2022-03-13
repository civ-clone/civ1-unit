"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BuildCost_1 = require("@civ-clone/core-city-build/Rules/BuildCost");
const Units_1 = require("../../Units");
const getRules = () => [
    ...[
        [Units_1.Artillery, 80],
        [Units_1.Battleship, 160],
        [Units_1.Bomber, 120],
        [Units_1.Cannon, 40],
        [Units_1.Caravan, 50],
        [Units_1.Carrier, 160],
        [Units_1.Catapult, 40],
        [Units_1.Chariot, 40],
        [Units_1.Cruiser, 80],
        [Units_1.Diplomat, 30],
        [Units_1.Fighter, 60],
        [Units_1.Frigate, 40],
        [Units_1.Horseman, 20],
        [Units_1.Ironclad, 50],
        [Units_1.Knight, 40],
        [Units_1.MechanizedInfantry, 50],
        [Units_1.Musketman, 30],
        [Units_1.Nuclear, 160],
        [Units_1.Rifleman, 30],
        [Units_1.Sail, 40],
        [Units_1.Settlers, 40],
        [Units_1.Spearman, 20],
        [Units_1.Submarine, 50],
        [Units_1.Swordman, 20],
        [Units_1.Tank, 80],
        [Units_1.Transport, 50],
        [Units_1.Trireme, 40],
        [Units_1.Warrior, 10],
    ].flatMap(([UnitType, cost]) => 
    // Why does TS hate this inheritance so much, is this an anti-pattern?
    (0, BuildCost_1.buildCost)(UnitType, cost)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=buildCost.js.map