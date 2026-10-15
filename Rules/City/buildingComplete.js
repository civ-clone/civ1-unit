"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Units_1 = require("../../Units");
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    new BulidingComplete_1.default('civ1-unit:city/building-complete/settlers-shrink-city', new Criterion_1.default((cityBuild, buildItem) => buildItem instanceof Units_1.Settlers), 
    // The Settlers are what shrank it (civ-clone/web-renderer#400).
    new Effect_1.default((cityBuild, buildItem) => cityGrowthRegistry.getByCity(cityBuild.city()).shrink(buildItem))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=buildingComplete.js.map