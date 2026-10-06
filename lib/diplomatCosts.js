"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bribeCost = exports.inciteCost = exports.distanceFromPalace = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BuildItem_1 = require("@civ-clone/core-city-build/BuildItem");
const CivilDisorder_1 = require("@civ-clone/core-city-happiness/Rules/CivilDisorder");
const Yields_1 = require("@civ-clone/library-city/Yields");
const CityImprovements_1 = require("@civ-clone/library-city/CityImprovements");
const Units_1 = require("../Units");
const civ1Distance_1 = require("@civ-clone/civ1-world/lib/civ1Distance");
// The distance v474.05 prices a Diplomat's work by: to the nearest city of `player`'s with a Palace, capped at 16, and
//  16 when it has none (`DiplomatActions`; Rome on 640K a Day says 32 for no Palace, the code says 16).
const distanceFromPalace = (player, tile, cityImprovementRegistry = CityImprovementRegistry_1.instance) => Math.min(16, ...cityImprovementRegistry
    .filter((cityImprovement) => cityImprovement instanceof CityImprovements_1.Palace &&
    !cityImprovement.destroyed() &&
    cityImprovement.city().player() === player)
    .map((palace) => (0, civ1Distance_1.default)(palace.city().tile(), tile)));
exports.distanceFromPalace = distanceFromPalace;
// A player with no gold treasury (one a test made, say) has no gold, rather than making listing the actions throw.
const goldOf = (player, playerTreasuryRegistry) => {
    try {
        return playerTreasuryRegistry.getByPlayerAndType(player, Yields_1.Gold).value();
    }
    catch (e) {
        return 0;
    }
};
/**
 * What a revolt in `city` costs to incite (v474.05 `F22_0000_0af5`; Rome on 640K a Day, p275):
 * `(owner's gold + 1000) / (distance + 3) × size`, halved while the city is in civil disorder. Subverting costs
 * double.
 */
const inciteCost = (city, cityGrowthRegistry = CityGrowthRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => {
    const owner = city.player(), cost = Math.floor((goldOf(owner, playerTreasuryRegistry) + 1000) /
        ((0, exports.distanceFromPalace)(owner, city.tile(), cityImprovementRegistry) + 3)) * cityGrowthRegistry.getByCity(city).size();
    return ruleRegistry
        .process(CivilDisorder_1.default, city)
        .some((inDisorder) => inDisorder)
        ? Math.floor(cost / 2)
        : cost;
};
exports.inciteCost = inciteCost;
/**
 * What `unit` costs to bribe (v474.05 `F22_0000_0639`; Rome on 640K a Day, p273):
 * `(owner's gold + 750) / (distance + 2) × build cost / 10`, halved unless it's Settlers.
 */
const bribeCost = (unit, cityImprovementRegistry = CityImprovementRegistry_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => {
    const owner = unit.player(), buildCost = new BuildItem_1.default(unit.constructor, null, ruleRegistry)
        .cost()
        .value(), cost = Math.floor((goldOf(owner, playerTreasuryRegistry) + 750) /
        ((0, exports.distanceFromPalace)(owner, unit.tile(), cityImprovementRegistry) + 2)) * Math.floor(buildCost / 10);
    return unit instanceof Units_1.Settlers ? cost : Math.floor(cost / 2);
};
exports.bribeCost = bribeCost;
//# sourceMappingURL=diplomatCosts.js.map