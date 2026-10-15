import { PathFinderRegistry } from '@civ-clone/core-world-path/PathFinderRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Path from '@civ-clone/core-world-path/Path';
import PathFinder from '@civ-clone/core-world-path/PathFinder';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * The path finders of `pathFinderRegistry`, except that the first search for
 * `unit` from `from` to `to` returns `path` instead of searching again.
 *
 * The `goto` criterion has to find a route to say whether `GoTo` is on offer,
 * and `GoTo#perform` then looked for the same route again. Handing the `GoTo`
 * this registry lets it follow the route that was offered, so a GoTo that is
 * performed costs one search, not two (civ-clone/web-renderer#307).
 *
 * The route is used once, and only by a search from the same tile to the same
 * tile for the same unit; any other search, or a second one, runs as before.
 *
 * It is also only used while the routing state it was found in still stands:
 * `revision` says what that is now, and a route found at a different revision
 * is dropped, so a unit that has since moved onto (or been created on, or
 * destroyed on) a tile of the route can't leave the `GoTo` with a route that a
 * search would no longer find.
 */
export declare class PlannedPathFinderRegistry extends PathFinderRegistry {
  private _from;
  private _path;
  private _pathFinderRegistry;
  private _revision;
  private _revisionOfPath;
  private _to;
  private _unit;
  constructor(
    unit: Unit,
    from: Tile,
    to: Tile,
    path: Path,
    pathFinderRegistry?: PathFinderRegistry,
    revision?: () => number,
    revisionOfPath?: number
  );
  entries(): IConstructor<PathFinder>[];
  /** The planned route, once, if it is the one being asked for. */
  take(unit: Unit, from: Tile, to: Tile): Path | null;
}
export default PlannedPathFinderRegistry;
