"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const activate_1 = require("@civ-clone/base-unit-lifecycle/lib/activate");
const Activate_1 = require("@civ-clone/core-unit/Rules/Activate");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const UnitImprovements_1 = require("../../UnitImprovements");
const getRules = (unitImprovementRegistry = UnitImprovementRegistry_1.instance) => [
    new Activate_1.default('civ1-unit:unit/activate/has-moves', new Criterion_1.default(activate_1.hasMoves), new Effect_1.default(activate_1.setActive)),
    new Activate_1.default('civ1-unit:unit/activate/clear-busy', new Criterion_1.default(activate_1.isBusy), new Effect_1.default(activate_1.clearBusy)),
    ...[UnitImprovements_1.Fortified].map((UnitImprovementType) => new Activate_1.default(`civ1-unit:unit/activate/remove-improvement/${UnitImprovementType.name}`, new Criterion_1.default((0, activate_1.hasImprovement)(unitImprovementRegistry, UnitImprovementType)), new Effect_1.default((0, activate_1.removeImprovement)(unitImprovementRegistry, UnitImprovementType)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=activate.js.map