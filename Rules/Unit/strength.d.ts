import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
export declare const terrainDefence: [typeof Terrain, number][];
export declare const ignoreCityWalls: (typeof Unit)[];
/**
 * Civ1's defence bonuses in battle (v474.05, `F0_29f3_000e`). A defender gets its terrain's multiplier and then the
 * first of City Walls (×3) or being fortified (×1.5); they don't stack. A ship gets no terrain or fortification
 * bonus, but City Walls still cover it in a city; an aircraft gets nothing. The defender's own defence already has
 * Veteran's ×1.5, which v474.05 applies last: the product is the same.
 */
export declare const getRules: (
  cityRegistry?: CityRegistry,
  cityImprovementRegistry?: CityImprovementRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry
) => Strength[];
export default getRules;
