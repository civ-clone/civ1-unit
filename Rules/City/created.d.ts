import { BuildPreferencesRegistry } from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import Created from '@civ-clone/core-city/Rules/Created';
import Unit from '@civ-clone/core-unit/Unit';
export declare const defenders: (typeof Unit)[];
export declare const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  buildPreferencesRegistry?: BuildPreferencesRegistry
) => Created[];
export default getRules;
