import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import Impassable from '@civ-clone/core-world-path/Rules/Impassable';
export declare const getRules: (
  interactionRegistry?: InteractionRegistry,
  tileImprovementRegistry?: TileImprovementRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => Impassable[];
export default getRules;
