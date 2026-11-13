import { BuildPreferencesRegistry } from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { Caravan } from '../../Units';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
/**
 * The units a player who keeps building military units is still asked about (civ-clone/web-renderer#690).
 *
 * @deprecated The rule asks for `NonCombatant` or `FoundsCities` (`Rules/Unit/traits`), which these are in Civ1. Kept
 *  for one release.
 */
export declare const notRepeated: (typeof Caravan)[];
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  buildPreferencesRegistry?: BuildPreferencesRegistry,
  cityRegistry?: CityRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine
) => BuildingComplete[];
export default getRules;
