"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.joinCitySizeLimit = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CanJoinCity_1 = require("@civ-clone/base-unit-action-join-city/Rules/CanJoinCity");
const Effect_1 = require("@civ-clone/core-rule/Effect");
// Settlers can join a city only while it is under size 10. In v474.05 a larger city shows the `*ADDCITY` warning
// instead (OpenCivOne `PlayerTurn.cs`, `ActualSize < 10`).
exports.joinCitySizeLimit = 10;
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    new CanJoinCity_1.default('civ1-unit:unit/can-join-city/size-limit', new Effect_1.default((unit, city) => cityGrowthRegistry.getByCity(city).size() < exports.joinCitySizeLimit)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=canJoinCity.js.map