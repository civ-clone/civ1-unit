"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.tooLargeToJoin = exports.joinCitySizeLimit = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CanJoinCity_1 = require("@civ-clone/base-unit-action-join-city/Rules/CanJoinCity");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const sizeLimit_1 = require("@civ-clone/base-unit-action-join-city/lib/sizeLimit");
// Settlers can join a city only while it is under size 10. In v474.05 a larger city shows the `*ADDCITY` warning
// instead (OpenCivOne `PlayerTurn.cs`, `ActualSize < 10`).
exports.joinCitySizeLimit = 10;
const tooLargeAtLimit = (0, sizeLimit_1.tooLargeToJoin)(exports.joinCitySizeLimit);
const tooLargeToJoin = (city, cityGrowthRegistry = CityGrowthRegistry_1.instance) => tooLargeAtLimit(city, cityGrowthRegistry);
exports.tooLargeToJoin = tooLargeToJoin;
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    new CanJoinCity_1.default('civ1-unit:unit/can-join-city/size-limit', new Effect_1.default((unit, city) => !(0, exports.tooLargeToJoin)(city, cityGrowthRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=canJoinCity.js.map