import { Air, Land, Naval } from '../../Types';
import * as Units from '../../Units';
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
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { CityWalls } from '@civ-clone/library-city/CityImprovements';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import IgnoresFortifications from '@civ-clone/base-unit-trait-ignores-fortifications/IgnoresFortifications';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { hasTrait } from '@civ-clone/core-unit/traits';
import traits from './traits';
import { Fortified } from '../../UnitImprovements';
import { Fortress } from '@civ-clone/civ1-world/TileImprovements';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import { terrainRow } from '@civ-clone/base-terrain-properties/lib/terrainTable';

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

/**
 * The units City Walls don't help against: v474.05 skips the walls for an attacker with an attack of 12.
 *
 * @deprecated The rules ask the attacker for `IgnoresFortifications` (`Rules/Unit/traits`), which a ruleset can change.
 *  This is what civ1-unit's own declarations give, in `Units` order, kept for one release.
 */
export const ignoreCityWalls: (typeof Unit)[] = ((): (typeof Unit)[] => {
  const declarations = new RuleRegistry();

  declarations.register(...traits());

  return (Object.values(Units) as (typeof Unit)[]).filter(
    (UnitType: typeof Unit): boolean =>
      hasTrait(UnitType, IgnoresFortifications, declarations)
  );
})();

/** City Walls' multiplier, a Fortress's, and a fortified unit's, outside walls and off a Fortress. */
export const cityWallsMultiplier: number = 3,
  fortressMultiplier: number = 2,
  fortifiedMultiplier: number = 1.5;

/**
 * Civ1's defence bonuses for `defender` (v474.05, `F0_29f3_000e`), as the multipliers that apply in order, each named
 * after what gives it. A defender gets its terrain's multiplier and then the first of City Walls (×3), a Fortress (×2,
 * against any attacker: `BATTLE.C`, map flag 0x20, civ-clone/web-renderer#388) or being fortified (×1.5); they don't
 * stack. A ship gets no terrain or fortification bonus, except in a city with City Walls,
 * where it defends like a land unit: v474.05's walls branch sets the defence to terrain × defence × 3 for any defender
 * but an aircraft, replacing the ship's flat value. An aircraft gets nothing. The defender's own defence already has
 * Veteran's ×1.5, which v474.05 applies last: the product is the same.
 *
 * With no `attacker` (a renderer asking what the unit has where it stands), City Walls count, as they do against any
 * attacker but one that `IgnoresFortifications` (Artillery, Bomber).
 */
export const defenceMultipliers = (
  defender: Unit,
  attacker: Unit | null,
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance
): [string, number][] => {
  if (defender instanceof Air) {
    return [];
  }

  const tile = defender.tile(),
    city = cityRegistry.getByTile(tile),
    cityWalls =
      city !== null &&
      !(attacker !== null && attacker.hasTrait(IgnoresFortifications)) &&
      cityImprovementRegistry
        .getByCity(city)
        .some(
          (cityImprovement: CityImprovement): boolean =>
            cityImprovement instanceof CityWalls
        );

  // A ship outside a walled city fights at its own defence. Inside one, it falls through to terrain × walls.
  if (defender instanceof Naval && !cityWalls) {
    return [];
  }

  const multipliers: [string, number][] = [],
    terrain = terrainRow(terrainDefence, tile.terrain());

  if (terrain) {
    const [TerrainType, multiplier] = terrain;

    multipliers.push([TerrainType.name, multiplier]);
  }

  if (cityWalls) {
    multipliers.push([CityWalls.name, cityWallsMultiplier]);
  } else if (
    tileImprovementRegistry
      .getByTile(tile)
      .some(
        (tileImprovement: TileImprovement): boolean =>
          tileImprovement instanceof Fortress
      )
  ) {
    // A ship is never here: off a walled city it returned above. In place of being fortified.
    multipliers.push([Fortress.name, fortressMultiplier]);
  } else if (
    unitImprovementRegistry
      .getByUnit(defender)
      .some(
        (unitImprovement: UnitImprovement): boolean =>
          unitImprovement instanceof Fortified
      )
  ) {
    multipliers.push([Fortified.name, fortifiedMultiplier]);
  }

  return multipliers;
};

/**
 * Civ1's defence bonuses in battle: `defenceMultipliers`, each added to the defence under its own name.
 */
export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance
): Strength[] => [
  new Strength(
    new Effect(
      (
        attacker: Unit,
        defender: Unit,
        attack: Attack,
        defence: Defence
      ): void => {
        let current = defence.value();

        defenceMultipliers(
          defender,
          attacker,
          cityRegistry,
          cityImprovementRegistry,
          unitImprovementRegistry,
          tileImprovementRegistry
        ).forEach(([name, multiplier]): void => {
          defence.add(current * (multiplier - 1), name);

          current *= multiplier;
        });
      }
    ),
    // What it does, for the Civilopedia (civ-clone/web-renderer#1196): City Walls' multiplier, and each terrain's
    //  (civ-clone/web-renderer#620), which a land unit, or a ship in a walled city, gets.
    new Description(
      {
        type: 'defence_multiplier',
        subject: CityWalls,
        value: cityWallsMultiplier,
        except: IgnoresFortifications,
      },
      // What a Fortress does for a land unit (civ-clone/web-renderer#388), in place of being fortified.
      {
        type: 'square_defence_multiplier',
        subject: Fortress,
        value: fortressMultiplier,
        unit: Land,
      },
      ...terrainDefence.map(
        ([TerrainType, value]: [typeof Terrain, number]) => ({
          type: 'defence_bonus',
          subject: TerrainType,
          value,
        })
      )
    )
  ),
];

export default getRules;
