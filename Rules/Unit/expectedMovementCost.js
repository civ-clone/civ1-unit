"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ExpectedMovementCost_1 = require("@civ-clone/core-world-path/Rules/ExpectedMovementCost");
const validateMove_1 = require("./validateMove");
const getRules = () => [
    new ExpectedMovementCost_1.default(
    // With full moves `m`, a step costing `c > m` is entered with chance
    // `min(1, m / (c × shortfallFactor))` per turn (see `validateMove`), and each
    // attempt spends the turn. So on average it's worth
    // `max(m, c × shortfallFactor)`: one turn while success is certain,
    // `1 / chance` turns after that.
    'civ1-unit:unit/expected-movement-cost/shortfall', new Criterion_1.default((unit, movementCost, movement) => movement > 0), new Effect_1.default((unit, movementCost, movement) => Math.max(movement, movementCost * validateMove_1.shortfallFactor))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=expectedMovementCost.js.map