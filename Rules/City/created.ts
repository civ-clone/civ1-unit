import {
  BuildPreferencesRegistry,
  instance as buildPreferencesRegistryInstance,
} from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  MechanizedInfantry,
  Musketman,
  Rifleman,
  Spearman,
  Warrior,
} from '../../Units';
import City from '@civ-clone/core-city/City';
import Created from '@civ-clone/core-city/Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Low } from '@civ-clone/core-rule/Priorities';
import Unit from '@civ-clone/core-unit/Unit';

// What a new city builds first for a player who asks it to build a defender, best first (civ-clone/web-renderer#691).
export const defenders: (typeof Unit)[] = [
  MechanizedInfantry,
  Rifleman,
  Musketman,
  Spearman,
  Warrior,
];

export const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  buildPreferencesRegistry?: BuildPreferencesRegistry
) => Created[] = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  buildPreferencesRegistry: BuildPreferencesRegistry = buildPreferencesRegistryInstance
): Created[] => [
  new Created(
    // A new city starts on the best defender it can build, even with a unit already in it, as Civ1's first build would
    //  be, rather than asking (civ-clone/web-renderer#691). Low, so after the ruleset has given the city its build.
    'civ1-unit:city/created/first-build-defender',
    new Low(),
    new Criterion(
      (city: City): boolean =>
        buildPreferencesRegistry.get(city.player()).firstBuild
    ),
    new Effect((city: City): void => {
      const cityBuild = cityBuildRegistry.getByCity(city),
        available = cityBuild.available().map((buildItem) => buildItem.item()),
        defender = defenders.find((UnitType) => available.includes(UnitType));

      if (cityBuild.building() !== null || !defender) {
        return;
      }

      cityBuild.build(defender);
    })
  ),
];

export default getRules;
