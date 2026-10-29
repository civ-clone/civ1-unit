"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.notRepeated = void 0;
const BuildPreferencesRegistry_1 = require("@civ-clone/core-city-build/BuildPreferencesRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Units_1 = require("../../Units");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const Unit_1 = require("@civ-clone/core-unit/Unit");
// The units a player who keeps building military units is still asked about (civ-clone/web-renderer#690).
exports.notRepeated = [Units_1.Caravan, Units_1.Diplomat, Units_1.Settlers];
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, buildPreferencesRegistry = BuildPreferencesRegistry_1.instance) => [
    new BulidingComplete_1.default(
    // A player who keeps building military units gets another of the same, without being asked (civ-clone/web-renderer#690),
    //  unless the city can no longer build it, when it is left to them, as in Civ1. Not Civ1's: it asks after every
    //  unit. Before the completion is announced, so the announcement can tell the city carried on.
    'civ1-unit:city/building-complete/repeat-military-unit', new Priorities_1.High(), new Criterion_1.default((cityBuild, buildItem) => buildItem instanceof Unit_1.default &&
        !exports.notRepeated.some((UnitType) => buildItem instanceof UnitType) &&
        !cityBuild.auto() &&
        buildPreferencesRegistry.get(cityBuild.city().player()).repeat), new Effect_1.default((cityBuild, buildItem) => {
        const UnitType = buildItem.constructor;
        if (cityBuild.building() !== null || !cityBuild.getAvailable(UnitType)) {
            return;
        }
        cityBuild.build(UnitType);
    })),
    new BulidingComplete_1.default('civ1-unit:city/building-complete/settlers-shrink-city', new Criterion_1.default((cityBuild, buildItem) => buildItem instanceof Units_1.Settlers), 
    // The Settlers are what shrank it (civ-clone/web-renderer#400).
    new Effect_1.default((cityBuild, buildItem) => cityGrowthRegistry.getByCity(cityBuild.city()).shrink(buildItem))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=buildingComplete.js.map