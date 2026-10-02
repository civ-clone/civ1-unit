import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CanJoinCity from '@civ-clone/base-unit-action-join-city/Rules/CanJoinCity';
export declare const joinCitySizeLimit = 10;
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry
) => CanJoinCity[];
export default getRules;
