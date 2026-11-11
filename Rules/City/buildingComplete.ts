import {
  BuildPreferencesRegistry,
  instance as buildPreferencesRegistryInstance,
} from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import { Caravan, Diplomat, Settlers } from '../../Units';
import { Veteran } from '../../UnitImprovements';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import { High } from '@civ-clone/core-rule/Priorities';
import { SETTLERS_SHRINK_CITY_RULE } from '../../RuleIds';
import Unit from '@civ-clone/core-unit/Unit';
import civ1Distance from '@civ-clone/civ1-world/lib/civ1Distance';

// The units a player who keeps building military units is still asked about (civ-clone/web-renderer#690).
export const notRepeated = [Caravan, Diplomat, Settlers];

// The nearest to `city` of its player's other cities, by v474.05's measure (`civ1Distance`), the first in
//  `cityRegistry`'s order of two as near, or `null` when it has no other.
const nearestOtherCity = (
  city: City,
  cityRegistry: CityRegistry
): City | null =>
  cityRegistry
    .getByPlayer(city.player())
    .filter((other: City): boolean => other !== city)
    .reduce(
      (nearest: City | null, other: City): City | null =>
        nearest === null ||
        civ1Distance(city.tile(), other.tile()) <
          civ1Distance(city.tile(), nearest.tile())
          ? other
          : nearest,
      null
    );

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  buildPreferencesRegistry?: BuildPreferencesRegistry,
  cityRegistry?: CityRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry
) => BuildingComplete[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  buildPreferencesRegistry: BuildPreferencesRegistry = buildPreferencesRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance
): BuildingComplete[] => [
  new BuildingComplete(
    // A player who keeps building military units gets another of the same, without being asked (civ-clone/web-renderer#690),
    //  unless the city can no longer build it, when it is left to them, as in Civ1. Not Civ1's: it asks after every
    //  unit. Before the completion is announced, so the announcement can tell the city carried on.
    'civ1-unit:city/building-complete/repeat-military-unit',
    new High(),
    new Criterion(
      (cityBuild: CityBuild, buildItem: BuildableInstance): boolean =>
        buildItem instanceof Unit &&
        !notRepeated.some((UnitType) => buildItem instanceof UnitType) &&
        !cityBuild.auto() &&
        buildPreferencesRegistry.get(cityBuild.city().player()).repeat
    ),
    new Effect((cityBuild: CityBuild, buildItem: BuildableInstance): void => {
      const UnitType = buildItem.constructor as typeof Unit;

      if (cityBuild.building() !== null || !cityBuild.getAvailable(UnitType)) {
        return;
      }

      cityBuild.build(UnitType);
    })
  ),
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
  //  another player's nearer than any of its own doesn't leave it with no home, as `Unit#setCity` can't give it none
  //  (civ-clone/web-renderer#969). The unit made again starts afresh (`UNITS.C`, `create_unit`):
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
  new BuildingComplete(
    SETTLERS_SHRINK_CITY_RULE,
    new Criterion(
      (cityBuild: CityBuild, buildItem: BuildableInstance) =>
        buildItem instanceof Settlers
    ),
    new Criterion(
      (cityBuild: CityBuild): boolean =>
        cityGrowthRegistry.getByCity(cityBuild.city()).size() > 1 ||
        cityRegistry.getByPlayer(cityBuild.city().player()).length > 1
    ),
    new Effect((cityBuild: CityBuild, buildItem: BuildableInstance): void => {
      const city = cityBuild.city(),
        cityGrowth = cityGrowthRegistry.getByCity(city);

      if (cityGrowth.size() === 1) {
        const home = nearestOtherCity(city, cityRegistry);

        if (home !== null) {
          (buildItem as Unit).setCity(home);
        }

        unitImprovementRegistry
          .getByUnit(buildItem as Unit)
          .filter((improvement) => improvement instanceof Veteran)
          .forEach((improvement) =>
            unitImprovementRegistry.unregister(improvement)
          );
      }

      cityGrowth.shrink(buildItem);
    })
  ),
];

export default getRules;
