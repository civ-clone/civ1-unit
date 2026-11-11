import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  HALVE_CITIES_PRIORITY,
  halveCity,
  hasSdiDefence,
} from '../../lib/nuclear';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Detonated from '@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated';
import Effect from '@civ-clone/core-rule/Effect';
import { HALVE_CITIES_RULE } from '../../RuleIds';
import High from '@civ-clone/core-rule/Priorities/High';
import Low from '@civ-clone/core-rule/Priorities/Low';
import { Pollution } from '@civ-clone/civ1-world/TileImprovements';
import Priority from '@civ-clone/core-rule/Priority';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import { instance as rngInstance } from '@civ-clone/core-random';

// What a nuclear weapon does, from v474.05 (`Segment_29f3.cs` `F0_29f3_0d4d` and `F0_29f3_0ec3`,
//  civ-clone/web-renderer#129), to the `Tile` it detonates over and the 8 around it.
export const getRules: (
  cityRegistry?: CityRegistry,
  cityImprovementRegistry?: CityImprovementRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  ruleRegistry?: RuleRegistry,
  unitRegistry?: UnitRegistry,
  engine?: Engine,
  randomNumberGenerator?: () => number,
  tileImprovementRegistry?: TileImprovementRegistry
) => Detonated[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  engine: Engine = engineInstance,
  randomNumberGenerator: () => number = rngInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance
): Detonated[] => {
  const area = (tile: Tile): Tile[] => [tile, ...tile.getNeighbours()];

  return [
    new Detonated(
      // Before anything changes, as v474.05 announces it, so a client can see what's there to be hit.
      'civ1-unit:unit/detonated/emit',
      new High(),
      new Effect((unit: Unit, tile: Tile): void => {
        engine.emit('unit:nuclear-detonation', unit, tile);
      })
    ),

    new Detonated(
      // Every unit in the area is destroyed, whoever it belongs to and the attacker's own too, except the units in a
      //  city with SDI Defense.
      'civ1-unit:unit/detonated/destroy-units',
      new Effect((unit: Unit, tile: Tile): void =>
        area(tile).forEach((areaTile: Tile): void => {
          const city = cityRegistry.getByTile(areaTile);

          if (city !== null && hasSdiDefence(city, cityImprovementRegistry)) {
            engine.emit('city:sdi-protected', city, unit);

            return;
          }

          unitRegistry.getByTile(areaTile).forEach((areaUnit: Unit): void => {
            // Cargo is destroyed with its transport, earlier in this loop, if the transport is lost at sea.
            if (areaUnit.destroyed()) {
              return;
            }

            ruleRegistry.process(Destroyed, areaUnit, unit.player());
          });
        })
      )
    ),

    new Detonated(
      // Every city in the area loses half its size, rounded down. SDI Defense doesn't stop this: in v474.05 it only
      //  spares the units in the city (civd `BATTLE.C`: `atom()` skips the stack of a city with `HAS_SDI`, then
      //  `nuke_fallout()` halves every city in the area, `townbuf[c].size -= townbuf[c].size / 2;`), though players
      //  commonly believe (and Civ2 has it) that it stops the whole attack (Dom's decision on
      //  civ-clone/web-renderer#129). `civ1-enhanced` can have it spare the city too (civ-clone/web-renderer#960).
      //  `HALVE_CITIES_PRIORITY`, after the units and before the fallout, as before, whichever rule is in force.
      HALVE_CITIES_RULE,
      new Priority(HALVE_CITIES_PRIORITY),
      new Effect((unit: Unit, tile: Tile): void =>
        area(tile).forEach((areaTile: Tile): void => {
          const city = cityRegistry.getByTile(areaTile);

          if (city === null) {
            return;
          }

          halveCity(city, unit, cityGrowthRegistry);
        })
      )
    ),

    new Detonated(
      // Fallout: each land `Tile` in the area without a city or pollution is polluted, with a 2 in 3 chance. `Low`,
      //  last, as before, after the cities are halved.
      'civ1-unit:unit/detonated/fallout',
      new Low(),
      new Effect((unit: Unit, tile: Tile): void =>
        area(tile)
          .filter(
            (areaTile: Tile): boolean =>
              areaTile.isLand() &&
              cityRegistry.getByTile(areaTile) === null &&
              !tileImprovementRegistry
                .getByTile(areaTile)
                .some(
                  (improvement: TileImprovement): boolean =>
                    improvement instanceof Pollution
                )
          )
          .forEach((areaTile: Tile): void => {
            if (randomNumberGenerator() >= 2 / 3) {
              return;
            }

            // Building it processes `Built`, which puts it on the tile.
            new Pollution(areaTile, ruleRegistry);
          })
      )
    ),
  ];
};

export default getRules;
