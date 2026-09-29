"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.shortfallFactor = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ValidateMove_1 = require("@civ-clone/core-unit/Rules/ValidateMove");
const core_random_1 = require("@civ-clone/core-random");
/**
 * A unit short of the moves a step costs gets there when its remaining moves
 * reach this fraction of the cost, scaled by a random draw: always with at
 * least half the cost left, otherwise with a chance of `remaining / (cost × this)`.
 * `expectedMovementCost` prices routes from the same number.
 */
exports.shortfallFactor = 0.5;
const getRules = (randomNumberGenerator = core_random_1.instance) => [
    new ValidateMove_1.default('civ1-unit:unit/validate-move/enough-moves', new Criterion_1.default((unit, movementCost) => unit.moves().value() >= movementCost), new Effect_1.default((unit, movementCost) => {
        unit.moves().subtract(movementCost);
        return true;
    })),
    new ValidateMove_1.default('civ1-unit:unit/validate-move/not-enough-moves', new Criterion_1.default((unit, movementCost) => unit.moves().value() < movementCost), new Effect_1.default((unit, movementCost) => {
        const remainingMoves = unit.moves().value();
        unit.moves().set(0);
        return (remainingMoves >=
            movementCost * exports.shortfallFactor * randomNumberGenerator());
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=validateMove.js.map