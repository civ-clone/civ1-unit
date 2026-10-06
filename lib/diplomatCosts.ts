import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  PlayerTreasuryRegistry,
  instance as playerTreasuryRegistryInstance,
} from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CivilDisorder from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import { Gold } from '@civ-clone/library-city/Yields';
import { Palace } from '@civ-clone/library-city/CityImprovements';
import Player from '@civ-clone/core-player/Player';
import { Settlers } from '../Units';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import civ1Distance from '@civ-clone/civ1-world/lib/civ1Distance';

// The distance v474.05 prices a Diplomat's work by: to the nearest city of `player`'s with a Palace, capped at 16, and
//  16 when it has none (`DiplomatActions`; Rome on 640K a Day says 32 for no Palace, the code says 16).
export const distanceFromPalace = (
  player: Player,
  tile: Tile,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): number =>
  Math.min(
    16,
    ...cityImprovementRegistry
      .filter(
        (cityImprovement) =>
          cityImprovement instanceof Palace &&
          !cityImprovement.destroyed() &&
          cityImprovement.city().player() === player
      )
      .map((palace) => civ1Distance(palace.city().tile(), tile))
  );

// A player with no gold treasury (one a test made, say) has no gold, rather than making listing the actions throw.
const goldOf = (
  player: Player,
  playerTreasuryRegistry: PlayerTreasuryRegistry
): number => {
  try {
    return playerTreasuryRegistry.getByPlayerAndType(player, Gold).value();
  } catch (e) {
    return 0;
  }
};

/**
 * What a revolt in `city` costs to incite (v474.05 `F22_0000_0af5`; Rome on 640K a Day, p275):
 * `(owner's gold + 1000) / (distance + 3) × size`, halved while the city is in civil disorder. Subverting costs
 * double.
 */
export const inciteCost = (
  city: City,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  playerTreasuryRegistry: PlayerTreasuryRegistry = playerTreasuryRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): number => {
  const owner = city.player(),
    cost =
      Math.floor(
        (goldOf(owner, playerTreasuryRegistry) + 1000) /
          (distanceFromPalace(owner, city.tile(), cityImprovementRegistry) + 3)
      ) * cityGrowthRegistry.getByCity(city).size();

  return ruleRegistry
    .process(CivilDisorder, city)
    .some((inDisorder: boolean): boolean => inDisorder)
    ? Math.floor(cost / 2)
    : cost;
};

/**
 * What `unit` costs to bribe (v474.05 `F22_0000_0639`; Rome on 640K a Day, p273):
 * `(owner's gold + 750) / (distance + 2) × build cost / 10`, halved unless it's Settlers.
 */
export const bribeCost = (
  unit: Unit,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  playerTreasuryRegistry: PlayerTreasuryRegistry = playerTreasuryRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): number => {
  const owner = unit.player(),
    buildCost = new BuildItem(
      unit.constructor as unknown as typeof Buildable,
      null,
      ruleRegistry
    )
      .cost()
      .value(),
    cost =
      Math.floor(
        (goldOf(owner, playerTreasuryRegistry) + 750) /
          (distanceFromPalace(owner, unit.tile(), cityImprovementRegistry) + 2)
      ) * Math.floor(buildCost / 10);

  return unit instanceof Settlers ? cost : Math.floor(cost / 2);
};
