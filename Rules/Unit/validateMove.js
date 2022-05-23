"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ValidateMove_1 = require("@civ-clone/core-unit/Rules/ValidateMove");
const getRules = (randomNumberGenerator = () => Math.random()) => [
    new ValidateMove_1.default(new Criterion_1.default((unit, movementCost) => unit.moves().value() >= movementCost), new Effect_1.default((unit, movementCost) => {
        unit.moves().subtract(movementCost);
        return true;
    })),
    new ValidateMove_1.default(new Criterion_1.default((unit, movementCost) => unit.moves().value() < movementCost), new Effect_1.default((unit, movementCost) => {
        const remainingMoves = unit.moves().value();
        unit.moves().set(0);
        return remainingMoves >= movementCost * 0.5 * randomNumberGenerator();
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=validateMove.js.map