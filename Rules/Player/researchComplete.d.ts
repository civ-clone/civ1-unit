import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Complete from '@civ-clone/core-science/Rules/Complete';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  cityBuildRegistry?: CityBuildRegistry
) => Complete[];
export default getRules;
