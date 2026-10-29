import {
  BuildPreferencesRegistry,
  instance as buildPreferencesRegistryInstance,
} from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Caravan, Diplomat, Settlers } from '../../Units';
import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Criterion from '@civ-clone/core-rule/Criterion';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import { High } from '@civ-clone/core-rule/Priorities';
import Unit from '@civ-clone/core-unit/Unit';

// The units a player who keeps building military units is still asked about (civ-clone/web-renderer#690).
export const notRepeated = [Caravan, Diplomat, Settlers];

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  buildPreferencesRegistry?: BuildPreferencesRegistry
) => BuildingComplete[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  buildPreferencesRegistry: BuildPreferencesRegistry = buildPreferencesRegistryInstance
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
  new BuildingComplete(
    'civ1-unit:city/building-complete/settlers-shrink-city',
    new Criterion(
      (cityBuild: CityBuild, buildItem: BuildableInstance) =>
        buildItem instanceof Settlers
    ),
    // The Settlers are what shrank it (civ-clone/web-renderer#400).
    new Effect((cityBuild: CityBuild, buildItem: BuildableInstance) =>
      cityGrowthRegistry.getByCity(cityBuild.city()).shrink(buildItem)
    )
  ),
];

export default getRules;
