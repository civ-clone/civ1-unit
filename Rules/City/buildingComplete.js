"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Units_1 = require("../../Units");
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    new BulidingComplete_1.BuildingComplete(new Criterion_1.default((cityBuild, buildItem) => buildItem instanceof Units_1.Settlers), new Effect_1.default((cityBuild) => cityGrowthRegistry.getByCity(cityBuild.city()).shrink())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=buildingComplete.js.map