import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { SdiDefence } from '@civ-clone/library-city/CityImprovements';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Where `unit/detonated/halve-cities` runs among the `Detonated` rules: after the `Normal` ones (the units destroyed)
 * and before `Low` (the fallout). A rule that takes its place (`civ1-enhanced`'s) runs there too, whichever package
 * loads first.
 */
export const HALVE_CITIES_PRIORITY = 2500;

/** Whether `city` has SDI Defense. */
export const hasSdiDefence = (
  city: City,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): boolean =>
  cityImprovementRegistry
    .getByCity(city)
    .some(
      (cityImprovement: CityImprovement): boolean =>
        cityImprovement instanceof SdiDefence
    );

/**
 * `city` loses half its size, rounded down, to `unit`'s detonation (civd `BATTLE.C` `nuke_fallout()`:
 * `townbuf[c].size -= townbuf[c].size / 2;`), so a city is never destroyed by it.
 */
export const halveCity = (
  city: City,
  unit: Unit,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): void => {
  const cityGrowth = cityGrowthRegistry.getByCity(city),
    loss = Math.floor(cityGrowth.size() / 2);

  for (let i = 0; i < loss; i++) {
    cityGrowth.shrink(unit);
  }
};
