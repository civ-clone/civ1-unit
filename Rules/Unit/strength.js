"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.defenceMultipliers = exports.ignoreCityWalls = exports.terrainDefence = void 0;
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
 * Civ1's defence bonuses for `defender` (v474.05, `F0_29f3_000e`), as the multipliers that apply in order, each named
 * after what gives it. A defender gets its terrain's multiplier and then the first of City Walls (×3) or being
 * fortified (×1.5); they don't stack. A ship gets no terrain or fortification bonus, except in a city with City Walls,
 * where it defends like a land unit: v474.05's walls branch sets the defence to terrain × defence × 3 for any defender
 * but an aircraft, replacing the ship's flat value. An aircraft gets nothing. The defender's own defence already has
 * Veteran's ×1.5, which v474.05 applies last: the product is the same.
 *
 * With no `attacker` (a renderer asking what the unit has where it stands), City Walls count, as they do against any
 * attacker but those in `ignoreCityWalls`.
 */
const defenceMultipliers = (defender, attacker, cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance) => {
    if (defender instanceof Types_1.Air) {
        return [];
    }
    const tile = defender.tile(), city = cityRegistry.getByTile(tile), cityWalls = city !== null &&
        !exports.ignoreCityWalls.some((UnitType) => attacker instanceof UnitType) &&
        cityImprovementRegistry
            .getByCity(city)
            .some((cityImprovement) => cityImprovement instanceof CityImprovements_1.CityWalls);
    // A ship outside a walled city fights at its own defence. Inside one, it falls through to terrain × walls.
    if (defender instanceof Types_1.Naval && !cityWalls) {
        return [];
    }
    const multipliers = [], terrain = exports.terrainDefence.find(([TerrainType]) => tile.terrain() instanceof TerrainType);
    if (terrain) {
        const [TerrainType, multiplier] = terrain;
        multipliers.push([TerrainType.name, multiplier]);
    }
    if (cityWalls) {
        multipliers.push([CityImprovements_1.CityWalls.name, 3]);
    }
    else if (unitImprovementRegistry
        .getByUnit(defender)
        .some((unitImprovement) => unitImprovement instanceof UnitImprovements_1.Fortified)) {
        multipliers.push([UnitImprovements_1.Fortified.name, 1.5]);
    }
    return multipliers;
};
exports.defenceMultipliers = defenceMultipliers;
/**
 * Civ1's defence bonuses in battle: `defenceMultipliers`, each added to the defence under its own name.
 */
const getRules = (cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance) => [
    new Strength_1.default(new Effect_1.default((attacker, defender, attack, defence) => {
        let current = defence.value();
        (0, exports.defenceMultipliers)(defender, attacker, cityRegistry, cityImprovementRegistry, unitImprovementRegistry).forEach(([name, multiplier]) => {
            defence.add(current * (multiplier - 1), name);
            current *= multiplier;
        });
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=strength.js.map