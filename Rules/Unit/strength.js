"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.ignoreCityWalls = exports.terrainDefence = void 0;
const Types_1 = require("../../Types");
const Units_1 = require("../../Units");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const CityImprovements_1 = require("@civ-clone/library-city/CityImprovements");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const UnitImprovements_1 = require("../../UnitImprovements");
const Strength_1 = require("@civ-clone/core-unit/Rules/Strength");
// Civ1's defence multiplier for each terrain (v474.05's terrain table; Rome on 640K Table 7-2, p. 259). Every other
//  terrain is ×1.
exports.terrainDefence = [
    [Terrains_1.Forest, 1.5],
    [Terrains_1.Jungle, 1.5],
    [Terrains_1.River, 1.5],
    [Terrains_1.Swamp, 1.5],
    [Terrains_1.Hills, 2],
    [Terrains_1.Mountains, 3],
];
// The units City Walls don't help against: v474.05 skips the walls for an attacker with an attack of 12.
exports.ignoreCityWalls = [Units_1.Artillery, Units_1.Bomber];
/**
 * Civ1's defence bonuses in battle (v474.05, `F0_29f3_000e`). A defender gets its terrain's multiplier and then the
 * first of City Walls (×3) or being fortified (×1.5); they don't stack. A ship gets no terrain or fortification
 * bonus, but City Walls still cover it in a city; an aircraft gets nothing. The defender's own defence already has
 * Veteran's ×1.5, which v474.05 applies last: the product is the same.
 */
const getRules = (cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance) => [
    new Strength_1.default(new Effect_1.default((attacker, defender, attack, defence) => {
        var _a;
        if (defender instanceof Types_1.Air) {
            return;
        }
        const tile = defender.tile(), city = cityRegistry.getByTile(tile), cityWalls = city !== null &&
            !exports.ignoreCityWalls.some((UnitType) => attacker instanceof UnitType) &&
            cityImprovementRegistry
                .getByCity(city)
                .some((cityImprovement) => cityImprovement instanceof CityImprovements_1.CityWalls);
        if (defender instanceof Types_1.Naval && !cityWalls) {
            return;
        }
        const [TerrainType, terrainMultiplier] = (_a = exports.terrainDefence.find(([TerrainType]) => tile.terrain() instanceof TerrainType)) !== null && _a !== void 0 ? _a : [null, 1], ownDefence = defence.value(), onTerrain = ownDefence * terrainMultiplier;
        if (TerrainType !== null) {
            defence.add(onTerrain - ownDefence, TerrainType.name);
        }
        if (cityWalls) {
            defence.add(onTerrain * 2, CityImprovements_1.CityWalls.name);
            return;
        }
        if (unitImprovementRegistry
            .getByUnit(defender)
            .some((unitImprovement) => unitImprovement instanceof UnitImprovements_1.Fortified)) {
            defence.add(onTerrain / 2, UnitImprovements_1.Fortified.name);
        }
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=strength.js.map