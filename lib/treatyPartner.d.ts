import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
/**
 * The player `unit` has a peace treaty with whose land `tile` is, or `null`:
 * an improved tile (irrigation, a mine, a road or a railroad) one of that
 * player's cities is working, and a land unit that isn't a Diplomat or a
 * Caravan. Moving onto or pillaging such a tile breaks the treaty
 * (civ-clone/web-renderer#287).
 *
 * v474.05 keeps a map of who owns each tile (a city's radius when it's
 * founded, and every tile a city works, until a foreign unit steps on it):
 * here a tile counts while it's worked.
 */
export declare const treatyPartner: (
  unit: Unit,
  tile: Tile,
  interactionRegistry: InteractionRegistry,
  tileImprovementRegistry: TileImprovementRegistry,
  workedTileRegistry: WorkedTileRegistry
) => Player | null;
export default treatyPartner;
