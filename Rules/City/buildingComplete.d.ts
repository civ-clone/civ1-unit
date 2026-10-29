import { BuildPreferencesRegistry } from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Caravan } from '../../Units';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
export declare const notRepeated: (typeof Caravan)[];
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  buildPreferencesRegistry?: BuildPreferencesRegistry
) => BuildingComplete[];
export default getRules;
