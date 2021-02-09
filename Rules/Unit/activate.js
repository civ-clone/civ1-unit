"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const Activate_1 = require("@civ-clone/core-unit/Rules/Activate");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const UnitImprovements_1 = require("../../UnitImprovements");
const getRules = (unitImprovementRegistry = UnitImprovementRegistry_1.instance) => [
    new Activate_1.default(new Criterion_1.default((unit) => unit.moves().value() > 0), new Effect_1.default((unit) => unit.setActive())),
    new Activate_1.default(new Criterion_1.default((unit) => unit.busy() !== null), new Effect_1.default((unit) => unit.setBusy())),
    ...[UnitImprovements_1.Fortified].map((UnitImprovementType) => new Activate_1.default(new Criterion_1.default((unit) => unitImprovementRegistry
        .getByUnit(unit)
        .some((unitImprovement) => unitImprovement instanceof UnitImprovementType)), new Effect_1.default((unit) => unitImprovementRegistry.unregister(...unitImprovementRegistry
        .getByUnit(unit)
        .filter((unitImprovement) => unitImprovement instanceof UnitImprovementType))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=activate.js.map