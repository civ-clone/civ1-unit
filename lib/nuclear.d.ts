import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import City from '@civ-clone/core-city/City';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Where `unit/detonated/halve-cities` runs among the `Detonated` rules: after the `Normal` ones (the units destroyed)
 * and before `Low` (the fallout). A rule that takes its place (`civ1-enhanced`'s) runs there too, whichever package
 * loads first.
 */
export declare const HALVE_CITIES_PRIORITY = 2500;
/** Whether `city` has SDI Defense. */
export declare const hasSdiDefence: (city: City, cityImprovementRegistry?: CityImprovementRegistry) => boolean;
/**
 * `city` loses half its size, rounded down, to `unit`'s detonation (civd `BATTLE.C` `nuke_fallout()`:
 * `townbuf[c].size -= townbuf[c].size / 2;`), so a city is never destroyed by it.
 */
export declare const halveCity: (city: City, unit: Unit, cityGrowthRegistry?: CityGrowthRegistry) => void;
