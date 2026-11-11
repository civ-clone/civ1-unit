"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settlersInSizeOneCity = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Units_1 = require("../Units");
/**
 * Whether `cityBuild` is a size-1 city's and `BuildItem` is Settlers: what the `Hold` rules about Settlers have in
 * common, v474.05's on Chieftain (`Rules/City/hold`) and any ruleset's own (civ-clone/web-renderer#959).
 */
const settlersInSizeOneCity = (cityGrowthRegistry = CityGrowthRegistry_1.instance) => (cityBuild, BuildItem) => (BuildItem === Units_1.Settlers ||
    Object.prototype.isPrototypeOf.call(Units_1.Settlers, BuildItem)) &&
    cityGrowthRegistry.getByCity(cityBuild.city()).size() === 1;
exports.settlersInSizeOneCity = settlersInSizeOneCity;
exports.default = exports.settlersInSizeOneCity;
//# sourceMappingURL=settlersInSizeOneCity.js.map