"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Destroyed_1 = require("@civ-clone/core-unit/Rules/Destroyed");
const Detonated_1 = require("@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const CityImprovements_1 = require("@civ-clone/library-city/CityImprovements");
const core_random_1 = require("@civ-clone/core-random");
// What a nuclear weapon does, from v474.05 (`Segment_29f3.cs` `F0_29f3_0d4d` and `F0_29f3_0ec3`,
//  civ-clone/web-renderer#129), to the `Tile` it detonates over and the 8 around it.
const getRules = (cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, engine = Engine_1.instance, randomNumberGenerator = core_random_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance) => {
    const area = (tile) => [tile, ...tile.getNeighbours()], hasSdiDefence = (city) => cityImprovementRegistry
        .getByCity(city)
        .some((cityImprovement) => cityImprovement instanceof CityImprovements_1.SdiDefence);
    return [
        new Detonated_1.default(
        // Before anything changes, as v474.05 announces it, so a client can see what's there to be hit.
        'civ1-unit:unit/detonated/emit', new High_1.default(), new Effect_1.default((unit, tile) => {
            engine.emit('unit:nuclear-detonation', unit, tile);
        })),
        new Detonated_1.default(
        // Every unit in the area is destroyed, whoever it belongs to and the attacker's own too, except the units in a
        //  city with SDI Defense.
        'civ1-unit:unit/detonated/destroy-units', new Effect_1.default((unit, tile) => area(tile).forEach((areaTile) => {
            const city = cityRegistry.getByTile(areaTile);
            if (city !== null && hasSdiDefence(city)) {
                engine.emit('city:sdi-protected', city, unit);
                return;
            }
            unitRegistry.getByTile(areaTile).forEach((areaUnit) => {
                // Cargo is destroyed with its transport, earlier in this loop, if the transport is lost at sea.
                if (areaUnit.destroyed()) {
                    return;
                }
                ruleRegistry.process(Destroyed_1.default, areaUnit, unit.player());
            });
        }))),
        new Detonated_1.default(
        // Every city in the area loses half its size, rounded down. SDI Defense doesn't stop this: in v474.05 it only
        //  spares the units in the city, though players commonly believe (and Civ2 has it) that it stops the whole
        //  attack (Dom's decision on civ-clone/web-renderer#129).
        'civ1-unit:unit/detonated/halve-cities', new Effect_1.default((unit, tile) => area(tile).forEach((areaTile) => {
            const city = cityRegistry.getByTile(areaTile);
            if (city === null) {
                return;
            }
            const cityGrowth = cityGrowthRegistry.getByCity(city), loss = Math.floor(cityGrowth.size() / 2);
            for (let i = 0; i < loss; i++) {
                cityGrowth.shrink();
            }
        }))),
        new Detonated_1.default(
        // Fallout: each land `Tile` in the area without a city or pollution is polluted, with a 2 in 3 chance.
        'civ1-unit:unit/detonated/fallout', new Effect_1.default((unit, tile) => area(tile)
            .filter((areaTile) => areaTile.isLand() &&
            cityRegistry.getByTile(areaTile) === null &&
            !tileImprovementRegistry
                .getByTile(areaTile)
                .some((improvement) => improvement instanceof TileImprovements_1.Pollution))
            .forEach((areaTile) => {
            if (randomNumberGenerator() >= 2 / 3) {
                return;
            }
            // Building it processes `Built`, which puts it on the tile.
            new TileImprovements_1.Pollution(areaTile, ruleRegistry);
        }))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=detonated.js.map