"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.notRepeated = void 0;
const BuildPreferencesRegistry_1 = require("@civ-clone/core-city-build/BuildPreferencesRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Units_1 = require("../../Units");
const FoundsCities_1 = require("@civ-clone/base-unit-trait-founds-cities/FoundsCities");
const NonCombatant_1 = require("@civ-clone/base-unit-trait-non-combatant/NonCombatant");
const UnitImprovements_1 = require("../../UnitImprovements");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const RuleIds_1 = require("../../RuleIds");
const Unit_1 = require("@civ-clone/core-unit/Unit");
const homeCity_1 = require("../../lib/homeCity");
/**
 * The units a player who keeps building military units is still asked about (civ-clone/web-renderer#690).
 *
 * @deprecated The rule asks for `NonCombatant` or `FoundsCities` (`Rules/Unit/traits`), which these are in Civ1. Kept
 *  for one release.
 */
exports.notRepeated = [Units_1.Caravan, Units_1.Diplomat, Units_1.Settlers];
// A unit made in a city that `FoundsCities` (Settlers): it costs the city a citizen.
const foundsCities = (buildItem) => buildItem instanceof Unit_1.default && buildItem.hasTrait(FoundsCities_1.default);
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, buildPreferencesRegistry = BuildPreferencesRegistry_1.instance, cityRegistry = CityRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance, engine = Engine_1.instance) => {
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
    //  `vanish` (`ECONOMY.C`) takes every unit homed in the city, the Settlers too, and marks the city's slot empty; so
    //  the Settlers are made again, and `create_unit` (`UNITS.C`) homes them in the nearest city left, or in none when
    //  that is another player's (`lib/homeCity`). Here the same unit is given that home, or none, before the city goes
    //  (civ-clone/web-renderer#969), so `civ1-city`'s `city/destroyed/destroy-supported-units` leaves it be and nothing
    //  is made twice. With no home, no city supports it. The unit made again starts afresh (`create_unit`):
    //
    //  ```c
    //  armydata[owner][index].status = 0;
    //  ```
    //
    //  which clears the Veteran the city's Barracks gave the first (`CITYMGT.C`:
    //  `if ((townbuf[city].buildings & HAS_BARRACKS) && unit != -1) armydata[selected_owner][unit].status |=
    //  UNIT_VETERAN;`), and the sentry, fortifying, fortified, assigned and terrain-work orders, none of which a unit
    //  just built has here: only the `Created` rules have run on it, and the only improvement they give is Barracks'
    //  Veteran (`civ1-city-improvement`'s `Rules/Unit/created`). So the same unit loses its Veteran. It was given as the
    //  unit was made, inside `CityBuild#check`, before any `BuildingComplete` rule runs, so this always comes after it.
    //  `kill_civ` (`NEWGAME.C`) does nothing here, as the player has another city. A size-1 city that holds its Settlers
    //  (`Rules/City/hold` on Chieftain, or a ruleset's own `Hold` rule) never gets here. The Settlers are what shrank it
    //  (civ-clone/web-renderer#400).
    const shrinkCity = new BulidingComplete_1.default(RuleIds_1.SETTLERS_SHRINK_CITY_RULE, new Criterion_1.default((cityBuild, buildItem) => foundsCities(buildItem)), new Criterion_1.default((cityBuild) => cityGrowthRegistry.getByCity(cityBuild.city()).size() > 1 ||
        cityRegistry.getByPlayer(cityBuild.city().player()).length > 1), new Effect_1.default((cityBuild, buildItem) => {
        const city = cityBuild.city(), cityGrowth = cityGrowthRegistry.getByCity(city);
        if (cityGrowth.size() === 1) {
            buildItem.setCity((0, homeCity_1.default)(city.player(), city.tile(), cityRegistry, city));
            unitImprovementRegistry
                .getByUnit(buildItem)
                .filter((improvement) => improvement instanceof UnitImprovements_1.Veteran)
                .forEach((improvement) => unitImprovementRegistry.unregister(improvement));
        }
        cityGrowth.shrink(buildItem);
    }));
    return [
        new BulidingComplete_1.default(
        // A player who keeps building military units gets another of the same, without being asked (civ-clone/web-renderer#690),
        //  unless the city can no longer build it, when it is left to them, as in Civ1. Not Civ1's: it asks after every
        //  unit. Before the completion is announced, so the announcement can tell the city carried on.
        'civ1-unit:city/building-complete/repeat-military-unit', new Priorities_1.High(), new Criterion_1.default((cityBuild, buildItem) => buildItem instanceof Unit_1.default &&
            !buildItem.hasTrait(NonCombatant_1.default) &&
            !buildItem.hasTrait(FoundsCities_1.default) &&
            !cityBuild.auto() &&
            buildPreferencesRegistry.get(cityBuild.city().player()).repeat), new Effect_1.default((cityBuild, buildItem) => {
            const UnitType = buildItem.constructor;
            if (cityBuild.building() !== null ||
                !cityBuild.getAvailable(UnitType)) {
                return;
            }
            cityBuild.build(UnitType);
        })),
        new BulidingComplete_1.default(
        // A city its Settlers are about to remove (`settlers-shrink-city`, below) is abandoned: said before the completion
        //  is announced (`civ1-city`'s `city/building-complete/emit`), so a client can tell the player once that the city
        //  was abandoned, rather than that it built Settlers and then that it was destroyed. v474.05 says nothing: it
        //  leaves `city_process` straight after `vanish` (`goto label_exit;`, `CITYMGT.C`), before the message for a
        //  unit built (civ-clone/web-renderer#969). Not while a ruleset has switched that rule off.
        'civ1-unit:city/building-complete/abandoned', new Priorities_1.High(), new Criterion_1.default((cityBuild, buildItem) => shrinkCity.enabled() &&
            foundsCities(buildItem) &&
            cityGrowthRegistry.getByCity(cityBuild.city()).size() === 1 &&
            cityRegistry.getByPlayer(cityBuild.city().player()).length > 1), new Effect_1.default((cityBuild, buildItem) => {
            engine.emit('city:abandoned', cityBuild.city(), buildItem);
        })),
        shrinkCity,
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=buildingComplete.js.map