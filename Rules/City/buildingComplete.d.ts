import { BuildPreferencesRegistry } from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Caravan } from '../../Units';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
export declare const notRepeated: (typeof Caravan)[];
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  buildPreferencesRegistry?: BuildPreferencesRegistry,
  cityRegistry?: CityRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry
) => BuildingComplete[];
export default getRules;
