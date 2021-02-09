import { BuildingComplete } from '@civ-clone/core-city-build/Rules/BulidingComplete';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry
) => BuildingComplete[];
export default getRules;
