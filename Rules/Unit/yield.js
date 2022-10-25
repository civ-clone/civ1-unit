"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Yields_1 = require("@civ-clone/core-unit/Yields");
const Units_1 = require("../../Units");
const UnitImprovements_1 = require("../../UnitImprovements");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const Yield_1 = require("@civ-clone/core-unit/Rules/Yield");
const Yield_2 = require("@civ-clone/core-unit/Rules/Yield");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitImprovementRegistry = UnitImprovementRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    ...[
        [Units_1.Artillery, 12, 2, 2],
        [Units_1.Battleship, 18, 12, 4, 2],
        [Units_1.Bomber, 12, 1, 8, 2],
        [Units_1.Cannon, 8],
        [Units_1.Caravan, 0],
        [Units_1.Carrier, 1, 12, 5, 2],
        [Units_1.Catapult, 6],
        [Units_1.Chariot, 4, 1, 2],
        [Units_1.Cruiser, 6, 6, 6, 2],
        [Units_1.Diplomat, 0, 0, 2],
        [Units_1.Fighter, 4, 2, 10, 2],
        [Units_1.Frigate, 2, 2, 3],
        [Units_1.Horseman, 2, 1, 2],
        [Units_1.Ironclad, 4, 4, 4],
        [Units_1.Knight, 4, 2, 2],
        [Units_1.MechanizedInfantry, 6, 6, 3],
        [Units_1.Musketman, 3, 2],
        [Units_1.Nuclear, 99, 0, 16],
        [Units_1.Rifleman, 3, 5],
        [Units_1.Sail, 1, 1, 3],
        [Units_1.Settlers, 0],
        [Units_1.Spearman, 1, 2],
        [Units_1.Submarine, 8, 2, 3, 2],
        [Units_1.Swordman, 3],
        [Units_1.Tank, 10, 5, 3],
        [Units_1.Transport, 0, 3, 4],
        [Units_1.Trireme, 1, 0, 3],
        [Units_1.Warrior],
    ].flatMap(([UnitType, attack = 1, defence = 1, movement = 1, visibility = 1]) => (0, Yield_1.unitYield)(UnitType, attack, defence, movement, visibility)),
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