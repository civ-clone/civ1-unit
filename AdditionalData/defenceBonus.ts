import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import Unit from '@civ-clone/core-unit/Unit';
import { defenceMultipliers } from '../Rules/Unit/strength';

export type DefenceBonus = {
  // All of them together: 3 for a fortified unit on Hills (×2 × ×1.5).
  multiplier: number;
  // What gives each, in the order they apply: a terrain, `CityWalls` or `Fortified`.
  sources: { name: string; multiplier: number }[];
};

/**
 * The defence bonus a unit has where it stands, from the same rule as battle (`Rules/Unit/strength.ts`), so a renderer
 * can show it without knowing the rule (civ-clone/web-renderer#743, #274). City Walls count, as they do against all but
 * Artillery and Bombers. `null` when it has none.
 */
export const getAdditionalData = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance
): AdditionalData[] => [
  new AdditionalData(
    Unit,
    'defenceBonus',
    (unit: Unit): DefenceBonus | null => {
      const multipliers = defenceMultipliers(
        unit,
        null,
        cityRegistry,
        cityImprovementRegistry,
        unitImprovementRegistry
      );

      if (multipliers.length === 0) {
        return null;
      }

      return {
        multiplier: multipliers.reduce(
          (total, [, multiplier]): number => total * multiplier,
          1
        ),
        sources: multipliers.map(([name, multiplier]) => ({
          name,
          multiplier,
        })),
      };
    }
  ),
];

export default getAdditionalData;
