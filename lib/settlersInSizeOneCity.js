"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settlersInSizeOneCity = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const FoundsCities_1 = require("@civ-clone/base-unit-trait-founds-cities/FoundsCities");
const Units_1 = require("../Units");
const traits_1 = require("@civ-clone/core-unit/traits");
/**
 * Whether `cityBuild` is a size-1 city's and `BuildItem` is Settlers: what the `Hold` rules about Settlers have in
 * common, v474.05's on Chieftain (`Rules/City/hold`) and any ruleset's own (civ-clone/web-renderer#959).
 *
 * "Settlers" is a type that `FoundsCities` in `ruleRegistry`, the game's rules: a build item is a class, which has no
 * registry of its own. Without one, it is the `Settlers` class, as before: a caller that doesn't pass its game's rules
 * yet keeps the answer it had, rather than asking a registry that may hold no traits.
 */
const settlersInSizeOneCity = (cityGrowthRegistry = CityGrowthRegistry_1.instance, ruleRegistry) => (cityBuild, BuildItem) => (ruleRegistry === undefined
    ? BuildItem === Units_1.Settlers ||
        Object.prototype.isPrototypeOf.call(Units_1.Settlers, BuildItem)
    : (0, traits_1.hasTrait)(BuildItem, FoundsCities_1.default, ruleRegistry)) && cityGrowthRegistry.getByCity(cityBuild.city()).size() === 1;
exports.settlersInSizeOneCity = settlersInSizeOneCity;
exports.default = exports.settlersInSizeOneCity;
//# sourceMappingURL=settlersInSizeOneCity.js.map