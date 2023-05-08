import { Action } from '@civ-clone/core-unit/Rules/Action';
import { CityNameRegistry } from '@civ-clone/core-civilization/CityNameRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PathFinderRegistry } from '@civ-clone/core-world-path/PathFinderRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
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
  strategyNoteRegistry?: StrategyNoteRegistry
) => Action[];
export default getRules;
