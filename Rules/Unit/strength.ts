import { Air, Naval } from '../../Types';
import { Artillery, Bomber } from '../../Units';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Forest,
  Hills,
  Jungle,
  Mountains,
  River,
  Swamp,
} from '@civ-clone/civ1-world/Terrains';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { CityWalls } from '@civ-clone/library-city/CityImprovements';
import Effect from '@civ-clone/core-rule/Effect';
import { Fortified } from '../../UnitImprovements';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';

// Civ1's defence multiplier for each terrain (v474.05's terrain table; Rome on 640K Table 7-2, p. 259). Every other
//  terrain is ×1.
export const terrainDefence: [typeof Terrain, number][] = [
  [Forest, 1.5],
  [Jungle, 1.5],
  [River, 1.5],
  [Swamp, 1.5],
  [Hills, 2],
  [Mountains, 3],
];

// The units City Walls don't help against: v474.05 skips the walls for an attacker with an attack of 12.
export const ignoreCityWalls: (typeof Unit)[] = [Artillery, Bomber];

/**
 * Civ1's defence bonuses in battle (v474.05, `F0_29f3_000e`). A defender gets its terrain's multiplier and then the
 * first of City Walls (×3) or being fortified (×1.5); they don't stack. A ship gets no terrain or fortification
 * bonus, but City Walls still cover it in a city; an aircraft gets nothing. The defender's own defence already has
 * Veteran's ×1.5, which v474.05 applies last: the product is the same.
 */
export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance
): Strength[] => [
  new Strength(
    new Effect(
      (
        attacker: Unit,
        defender: Unit,
        attack: Attack,
        defence: Defence
      ): void => {
        if (defender instanceof Air) {
          return;
        }

        const tile = defender.tile(),
          city = cityRegistry.getByTile(tile),
          cityWalls =
            city !== null &&
            !ignoreCityWalls.some(
              (UnitType: typeof Unit): boolean => attacker instanceof UnitType
            ) &&
            cityImprovementRegistry
              .getByCity(city)
              .some(
                (cityImprovement: CityImprovement): boolean =>
                  cityImprovement instanceof CityWalls
              );

        if (defender instanceof Naval && !cityWalls) {
          return;
        }

        const [TerrainType, terrainMultiplier] = terrainDefence.find(
            ([TerrainType]): boolean => tile.terrain() instanceof TerrainType
          ) ?? [null, 1],
          ownDefence = defence.value(),
          onTerrain = ownDefence * terrainMultiplier;

        if (TerrainType !== null) {
          defence.add(onTerrain - ownDefence, TerrainType.name);
        }

        if (cityWalls) {
          defence.add(onTerrain * 2, CityWalls.name);

          return;
        }

        if (
          unitImprovementRegistry
            .getByUnit(defender)
            .some(
              (unitImprovement: UnitImprovement): boolean =>
                unitImprovement instanceof Fortified
            )
        ) {
          defence.add(onTerrain / 2, Fortified.name);
        }
      }
    )
  ),
];

export default getRules;
