"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.halveCity = exports.hasSdiDefence = exports.HALVE_CITIES_PRIORITY = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityImprovements_1 = require("@civ-clone/library-city/CityImprovements");
/**
 * Where `unit/detonated/halve-cities` runs among the `Detonated` rules: after the `Normal` ones (the units destroyed)
 * and before `Low` (the fallout). A rule that takes its place (`civ1-enhanced`'s) runs there too, whichever package
 * loads first.
 */
exports.HALVE_CITIES_PRIORITY = 2500;
/** Whether `city` has SDI Defense. */
const hasSdiDefence = (city, cityImprovementRegistry = CityImprovementRegistry_1.instance) => cityImprovementRegistry
    .getByCity(city)
    .some((cityImprovement) => cityImprovement instanceof CityImprovements_1.SdiDefence);
exports.hasSdiDefence = hasSdiDefence;
/**
 * `city` loses half its size, rounded down, to `unit`'s detonation (civd `BATTLE.C` `nuke_fallout()`:
 * `townbuf[c].size -= townbuf[c].size / 2;`), so a city is never destroyed by it.
 */
const halveCity = (city, unit, cityGrowthRegistry = CityGrowthRegistry_1.instance) => {
    const cityGrowth = cityGrowthRegistry.getByCity(city), loss = Math.floor(cityGrowth.size() / 2);
    for (let i = 0; i < loss; i++) {
        cityGrowth.shrink(unit);
    }
};
exports.halveCity = halveCity;
//# sourceMappingURL=nuclear.js.map