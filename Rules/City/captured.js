"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const InciteRevolt_1 = require("@civ-clone/base-unit-action-incite-revolt/InciteRevolt");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    // An incited (or subverted) city takes the old owner's units with it: those in the city and on the tiles around it
    //  that aren't cities, whatever their home, homed in the city now (v474.05 `F22_0000_0af5`). High priority, so they
    //  have changed sides before the city's other supported units are disbanded (civ-clone/web-renderer#58).
    // A captured city loses a citizen, so one of size 1 is destroyed, and everything homed in it with it. Its defectors
    //  are left with no home instead, and survive: v474.05 never destroys an incited city, as it doesn't shrink one of
    //  size 1, and the units it brings over are kept.
    new Captured_1.default('civ1-unit:city/captured/defecting-units', new Priorities_1.High(), new Criterion_1.default((city, capturingPlayer, originalPlayer, cause) => cause instanceof InciteRevolt_1.default), new Effect_1.default((city, capturingPlayer, originalPlayer) => [
        city.tile(),
        ...city
            .tile()
            .getNeighbours()
            .filter((tile) => cityRegistry.getByTile(tile) === null),
    ]
        .flatMap((tile) => unitRegistry.getByTile(tile))
        .filter((unit) => unit.player() === originalPlayer)
        .forEach((unit) => unit.transfer(capturingPlayer, cityGrowthRegistry.getByCity(city).size() > 1 ? city : null)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map