"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Yields_1 = require("@civ-clone/core-unit/Yields");
const Units_1 = require("../../Units");
const UnitImprovements_1 = require("../../UnitImprovements");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const Yield_1 = require("@civ-clone/core-unit/Rules/Yield");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Yield_2 = require("@civ-clone/core-unit/Rules/Yield");
const getRules = (unitImprovementRegistry = UnitImprovementRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    ...[
        [Units_1.Catapult, 6],
        [Units_1.Chariot, 4, 1, 2],
        [Units_1.Horseman, 2, 1, 2],
        [Units_1.Knight, 4, 2, 2],
        [Units_1.Musketman, 3, 2],
        [Units_1.Sail, 1, 1, 3],
        [Units_1.Settlers, 0],
        [Units_1.Spearman, 1, 2],
        [Units_1.Swordman, 3],
        [Units_1.Trireme, 1, 0, 3],
        [Units_1.Warrior],
    ].flatMap(([UnitType, attack = 1, defence = 1, movement = 1, visibility = 1]) => Yield_1.unitYield(UnitType, attack, defence, movement, visibility)),
    ...[
        [UnitImprovements_1.Fortified, 1, Yields_1.Defence],
        [UnitImprovements_1.Veteran, 0.5, Yields_1.Attack, Yields_1.Defence],
    ].flatMap(([UnitImprovementType, yieldModifier, ...YieldTypes]) => YieldTypes.map((YieldType) => new Yield_1.Yield(new Criterion_1.default((unit, unitYield) => unitYield instanceof YieldType), new Criterion_1.default((unit) => unitImprovementRegistry
        .getByUnit(unit)
        .some((unitImprovement) => unitImprovement instanceof UnitImprovementType)), new Effect_1.default((unit, unitYield) => {
        const baseYield = new YieldType();
        ruleRegistry.process(Yield_2.BaseYield, unit.constructor, baseYield);
        unitYield.add(baseYield.value() * yieldModifier, UnitImprovementType.name);
    })))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map