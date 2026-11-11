import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export declare const distanceFromPalace: (
  player: Player,
  tile: Tile,
  cityImprovementRegistry?: CityImprovementRegistry
) => number;
/**
 * What a revolt in `city` costs to incite (v474.05 `F22_0000_0af5`; Rome on 640K a Day, p275):
 * `(owner's gold + 1000) / (distance + 3) × size`, halved while the city is in civil disorder. Subverting costs
 * double.
 */
export declare const inciteCost: (
  city: City,
  cityGrowthRegistry?: CityGrowthRegistry,
  cityImprovementRegistry?: CityImprovementRegistry,
  playerTreasuryRegistry?: PlayerTreasuryRegistry,
  ruleRegistry?: RuleRegistry
) => number;
/**
 * What `unit` costs to bribe (v474.05 `F22_0000_0639`; Rome on 640K a Day, p273):
 * `(owner's gold + 750) / (distance + 2) × build cost / 10`, halved unless it's Settlers.
 */
export declare const bribeCost: (
  unit: Unit,
  cityImprovementRegistry?: CityImprovementRegistry,
  playerTreasuryRegistry?: PlayerTreasuryRegistry,
  ruleRegistry?: RuleRegistry
) => number;
