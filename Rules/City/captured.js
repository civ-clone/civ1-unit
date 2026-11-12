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
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, 
// No longer read: kept so that callers passing it still compile.
cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    // An incited (or subverted) city takes the old owner's units with it: those in the city and on the tiles around it
    //  that aren't cities, whatever their home, homed in the city now, at any size (civ-clone/web-renderer#58,
    //  civ-clone/web-renderer#969). v474.05 `city_revolt` (`DIPLOMAT.C`) walks all the old owner's units, and re-makes
    //  for the new owner each one on the city's square or next to it on a square that isn't a city, homed in the city:
    //
    //  ```c
    //  d = map_dist(cx, armydata[civ][m].x, cy, armydata[civ][m].y);
    //  if (armydata[civ][m].type != -1 && d <= 1 && (d == 0 || !(map_flags(armydata[civ][m].x, armydata[civ][m].y) & 1))) {
    //      ...
    //      new_unit = create_unit(new_owner, type, armydata[civ][m].x, armydata[civ][m].y);
    //      if (new_unit != -1) {
    //          armydata[new_owner][new_unit].visibility |= (1 << civ);
    //          armydata[new_owner][new_unit].home_city = city_id;
    //  ```
    //
    //  and never destroys the city it then captures (`capunit(new_owner, city_id, 1L)`, `CAPTURE.C`: one of size 1 isn't
    //  shrunk), which `civ1-city`'s `city/captured/shrink` follows since civ-clone/civ1-city#23. With a civ1-city from before it, an incited
    //  city of size 1 is destroyed, and its defectors, homed there, with it. High priority, so they have changed sides
    //  before the city's other supported units are disbanded (`civ1-city`'s `city/captured/destroy-supported-units`).
    new Captured_1.default('civ1-unit:city/captured/defecting-units', new Priorities_1.High(), new Criterion_1.default((city, capturingPlayer, originalPlayer, cause) => cause instanceof InciteRevolt_1.default), new Effect_1.default((city, capturingPlayer, originalPlayer) => [
        city.tile(),
        ...city
            .tile()
            .getNeighbours()
            .filter((tile) => cityRegistry.getByTile(tile) === null),
    ]
        .flatMap((tile) => unitRegistry.getByTile(tile))
        .filter((unit) => unit.player() === originalPlayer)
        .forEach((unit) => unit.transfer(capturingPlayer, city)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map