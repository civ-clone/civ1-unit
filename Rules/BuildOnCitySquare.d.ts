import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
/**
 * Whether `player` may build a tile improvement on `tile`, a city's square (civ-clone/web-renderer#1029), asked with
 * `Available`'s arguments. Any rule that answers `false` refuses it, and a rule answering `true` can't undo that: a rule
 * set allows what another refuses by superseding the refusal. With no rules, it may be built wherever it otherwise
 * could.
 */
export declare class BuildOnCitySquare extends Rule<
  [Tile, typeof TileImprovement, Player],
  boolean
> {}
export default BuildOnCitySquare;
