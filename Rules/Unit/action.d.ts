import { Action } from '@civ-clone/core-unit/Rules/Action';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityNameRegistry } from '@civ-clone/core-civilization/CityNameRegistry';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { LandMassRegistry } from '@civ-clone/core-world/LandMassRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PathFinderRegistry } from '@civ-clone/core-world-path/PathFinderRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import { StrategyRegistry } from '@civ-clone/core-strategy/StrategyRegistry';
import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import SenateIntervenes from '@civ-clone/base-government-senate/Rules/SenateIntervenes';
import BuildOnCitySquare from '../BuildOnCitySquare';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
/**
 * What a pillage takes, in the order v474.05 takes it (`CONTROL.C`, the 'P' command, civ-clone/web-renderer#1061):
 *  Irrigation or a Mine, else the Railroad, else the Road. Nothing else on a square, such as Pollution, is pillaged.
 */
export declare const pillageOrder: (typeof TileImprovement)[];
/** Whether `improvement` can be pillaged: pillage is offered for it, and takes it. */
export declare const pillageable: (improvement: TileImprovement) => boolean;
export declare const getRules: (
  cityNameRegistry?: CityNameRegistry,
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry,
  tileImprovementRegistry?: TileImprovementRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry,
  unitRegistry?: UnitRegistry,
  terrainFeatureRegistry?: TerrainFeatureRegistry,
  transportRegistry?: TransportRegistry,
  turn?: Turn,
  interactionRegistry?: InteractionRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  pathFinderRegistry?: PathFinderRegistry,
  strategyNoteRegistry?: StrategyNoteRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  landMassRegistry?: LandMassRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  cityImprovementRegistry?: CityImprovementRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  playerTreasuryRegistry?: PlayerTreasuryRegistry,
  strategyRegistry?: StrategyRegistry,
  engine?: Engine,
  playerGovernmentRegistry?: PlayerGovernmentRegistry
) => (Action | SenateIntervenes | BuildOnCitySquare)[];
export default getRules;
