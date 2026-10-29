"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.defenders = void 0;
const BuildPreferencesRegistry_1 = require("@civ-clone/core-city-build/BuildPreferencesRegistry");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const Units_1 = require("../../Units");
const Created_1 = require("@civ-clone/core-city/Rules/Created");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
// What a new city builds first for a player who asks it to build a defender, best first (civ-clone/web-renderer#691).
exports.defenders = [
    Units_1.MechanizedInfantry,
    Units_1.Rifleman,
    Units_1.Musketman,
    Units_1.Spearman,
    Units_1.Warrior,
];
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, buildPreferencesRegistry = BuildPreferencesRegistry_1.instance) => [
    new Created_1.default(
    // A new city starts on the best defender it can build, even with a unit already in it, as Civ1's first build would
    //  be, rather than asking (civ-clone/web-renderer#691). Low, so after the ruleset has given the city its build.
    'civ1-unit:city/created/first-build-defender', new Priorities_1.Low(), new Criterion_1.default((city) => buildPreferencesRegistry.get(city.player()).firstBuild), new Effect_1.default((city) => {
        const cityBuild = cityBuildRegistry.getByCity(city), available = cityBuild.available().map((buildItem) => buildItem.item()), defender = exports.defenders.find((UnitType) => available.includes(UnitType));
        if (cityBuild.building() !== null || !defender) {
            return;
        }
        cityBuild.build(defender);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map