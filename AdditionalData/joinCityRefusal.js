"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const canJoinCity_1 = require("../Rules/Unit/canJoinCity");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const Units_1 = require("../Units");
const Unit_1 = require("@civ-clone/core-unit/Unit");
/**
 * Why a unit standing in one of its player's cities isn't offered `JoinCity`, so a renderer can say so (as v474.05's
 * `*ADDCITY` warning does) without knowing the rule (civ-clone/web-renderer#279). `null` when there is nothing to
 * explain: the unit can join, isn't a kind that joins, or isn't in one of its player's cities.
 */
const getAdditionalData = (cityRegistry = CityRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    new AdditionalData_1.default(Unit_1.default, 'joinCityRefusal', (unit) => {
        if (!(unit instanceof Units_1.Settlers)) {
            return null;
        }
        const city = cityRegistry.getByTile(unit.tile());
        if (city === null ||
            city.player() !== unit.player() ||
            !(0, canJoinCity_1.tooLargeToJoin)(city, cityGrowthRegistry)) {
            return null;
        }
        return { reason: 'too-large', size: canJoinCity_1.joinCitySizeLimit };
    }),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=joinCityRefusal.js.map