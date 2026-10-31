"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const Unit_1 = require("@civ-clone/core-unit/Unit");
const strength_1 = require("../Rules/Unit/strength");
/**
 * The defence bonus a unit has where it stands, from the same rule as battle (`Rules/Unit/strength.ts`), so a renderer
 * can show it without knowing the rule (civ-clone/web-renderer#743, #274). City Walls count, as they do against all but
 * Artillery and Bombers. `null` when it has none.
 */
const getAdditionalData = (cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance) => [
    new AdditionalData_1.default(Unit_1.default, 'defenceBonus', (unit) => {
        const multipliers = (0, strength_1.defenceMultipliers)(unit, null, cityRegistry, cityImprovementRegistry, unitImprovementRegistry);
        if (multipliers.length === 0) {
            return null;
        }
        return {
            multiplier: multipliers.reduce((total, [, multiplier]) => total * multiplier, 1),
            sources: multipliers.map(([name, multiplier]) => ({
                name,
                multiplier,
            })),
        };
    }),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=defenceBonus.js.map