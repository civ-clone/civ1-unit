import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
export type DefenceBonus = {
  multiplier: number;
  sources: {
    name: string;
    multiplier: number;
  }[];
};
/**
 * The defence bonus a unit has where it stands, from the same rule as battle (`Rules/Unit/strength.ts`), so a renderer
 * can show it without knowing the rule (civ-clone/web-renderer#743, #274). City Walls count, as they do against all but
 * Artillery and Bombers. `null` when it has none.
 */
export declare const getAdditionalData: (
  cityRegistry?: CityRegistry,
  cityImprovementRegistry?: CityImprovementRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry
) => AdditionalData[];
export default getAdditionalData;
