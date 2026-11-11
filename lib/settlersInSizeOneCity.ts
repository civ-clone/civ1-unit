import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { Settlers } from '../Units';

/**
 * Whether `cityBuild` is a size-1 city's and `BuildItem` is Settlers: what the `Hold` rules about Settlers have in
 * common, v474.05's on Chieftain (`Rules/City/hold`) and any ruleset's own (civ-clone/web-renderer#959).
 */
export const settlersInSizeOneCity =
  (cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance) =>
  (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
    (BuildItem === (Settlers as unknown as Buildable) ||
      Object.prototype.isPrototypeOf.call(Settlers, BuildItem)) &&
    cityGrowthRegistry.getByCity(cityBuild.city()).size() === 1;

export default settlersInSizeOneCity;
