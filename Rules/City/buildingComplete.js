"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.notRepeated = void 0;
const BuildPreferencesRegistry_1 = require("@civ-clone/core-city-build/BuildPreferencesRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Units_1 = require("../../Units");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const RuleIds_1 = require("../../RuleIds");
const Unit_1 = require("@civ-clone/core-unit/Unit");
const civ1Distance_1 = require("@civ-clone/civ1-world/lib/civ1Distance");
// The units a player who keeps building military units is still asked about (civ-clone/web-renderer#690).
exports.notRepeated = [Units_1.Caravan, Units_1.Diplomat, Units_1.Settlers];
// The nearest to `city` of its player's other cities, by v474.05's measure (`civ1Distance`), the first in
//  `cityRegistry`'s order of two as near, or `null` when it has no other.
const nearestOtherCity = (city, cityRegistry) => cityRegistry
    .getByPlayer(city.player())
    .filter((other) => other !== city)
    .reduce((nearest, other) => nearest === null ||
    (0, civ1Distance_1.default)(city.tile(), other.tile()) <
        (0, civ1Distance_1.default)(city.tile(), nearest.tile())
    ? other
    : nearest, null);
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, buildPreferencesRegistry = BuildPreferencesRegistry_1.instance, cityRegistry = CityRegistry_1.instance) => [
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
    // Settlers cost their city a citizen, unless it is a size-1 city that is its player's only one, which keeps it. A
    //  size-1 city with others is removed, and the Settlers stay on its square (civ-clone/web-renderer#959). v474.05
    //  `CITYMGT.C`, once the unit is made:
    //
    //  ```c
    //  if (unit != -1 && townbuf[city].production == UTYPE_SETTLERS) {
    //      if (townbuf[city].size > 1 || city_count[selected_owner] > 1) {
    //          if (--townbuf[city].size == 0) {
    //              vanish(city, townbuf[city].x, townbuf[city].y);
    //              unit = create_unit(selected_owner, townbuf[city].production, townbuf[city].x, townbuf[city].y);
    //              kill_civ(selected_owner, 0);
    //  ```
    //
    //  `vanish` (`ECONOMY.C`) takes every unit homed in the city, the Settlers too, as `create_unit` homes a unit in the
    //  nearest city (`near_city`, `CORE.C`); so the Settlers are made again, homed in the nearest city left (none when
    //  that is another player's). Here the same unit is homed in its player's nearest other city before the city goes,
    //  so `civ1-city`'s `city/destroyed/destroy-supported-units` leaves it be: nothing is made twice, and a city of
    //  another player's nearer than any of its own doesn't leave it with no home, as `Unit#setCity` can't give it none.
    //  `kill_civ` (`NEWGAME.C`) does nothing here, as the player has another city. A size-1 city that holds its Settlers
    //  (`Rules/City/hold` on Chieftain, or a ruleset's own `Hold` rule) never gets here. The Settlers are what shrank it
    //  (civ-clone/web-renderer#400).
    new BulidingComplete_1.default(RuleIds_1.SETTLERS_SHRINK_CITY_RULE, new Criterion_1.default((cityBuild, buildItem) => buildItem instanceof Units_1.Settlers), new Criterion_1.default((cityBuild) => cityGrowthRegistry.getByCity(cityBuild.city()).size() > 1 ||
        cityRegistry.getByPlayer(cityBuild.city().player()).length > 1), new Effect_1.default((cityBuild, buildItem) => {
        const city = cityBuild.city(), cityGrowth = cityGrowthRegistry.getByCity(city);
        if (cityGrowth.size() === 1) {
            const home = nearestOtherCity(city, cityRegistry);
            if (home !== null) {
                buildItem.setCity(home);
            }
        }
        cityGrowth.shrink(buildItem);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=buildingComplete.js.map