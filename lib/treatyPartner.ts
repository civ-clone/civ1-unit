import {
  Irrigation,
  Mine,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import { Diplomatic, Land as LandUnit } from '../Types';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
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
export const treatyPartner = (
  unit: Unit,
  tile: Tile,
  interactionRegistry: InteractionRegistry,
  tileImprovementRegistry: TileImprovementRegistry,
  workedTileRegistry: WorkedTileRegistry
): Player | null => {
  if (!(unit instanceof LandUnit) || unit instanceof Diplomatic) {
    return null;
  }

  const workedTile = workedTileRegistry.getByTile(tile);

  if (workedTile === null) {
    return null;
  }

  const partner = workedTile.city().player();

  if (
    partner === unit.player() ||
    !interactionRegistry
      .getByPlayers(unit.player(), partner)
      .some(
        (interaction): interaction is Peace =>
          interaction instanceof Peace && interaction.active()
      ) ||
    !tileImprovementRegistry
      .getByTile(tile)
      .some((improvement: TileImprovement): boolean =>
        [Irrigation, Mine, Railroad, Road].some(
          (Improvement: typeof TileImprovement): boolean =>
            improvement instanceof Improvement
        )
      )
  ) {
    return null;
  }

  return partner;
};

export default treatyPartner;
