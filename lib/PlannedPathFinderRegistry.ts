import {
  PathFinderRegistry,
  instance as pathFinderRegistryInstance,
} from '@civ-clone/core-world-path/PathFinderRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Path from '@civ-clone/core-world-path/Path';
import PathFinder from '@civ-clone/core-world-path/PathFinder';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * A search by `Finder`, unless `registry` has the route already.
 *
 * Not a subclass of `Finder`: a class made for each `GoTo` would give the
 * search's own methods a new kind of object to handle each time, and every
 * search after slows down for it (checking 157 GoTos took up to 40% longer).
 */
class PlannedPathFinder extends PathFinder {
  private _Finder: IConstructor<PathFinder>;
  private _registry: PlannedPathFinderRegistry;

  constructor(
    unit: Unit,
    start: Tile,
    end: Tile,
    Finder: IConstructor<PathFinder>,
    registry: PlannedPathFinderRegistry
  ) {
    super(unit, start, end);

    this._Finder = Finder;
    this._registry = registry;
  }

  generate(): Path {
    return (
      this._registry.take(this.unit(), this.start(), this.end()) ??
      new this._Finder(this.unit(), this.start(), this.end()).generate()
    );
  }
}

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
 * Like the rest of the action that offered it, it describes the world as it was
 * when the actions were asked for.
 */
export class PlannedPathFinderRegistry extends PathFinderRegistry {
  private _from: Tile;
  private _path: Path | null;
  private _pathFinderRegistry: PathFinderRegistry;
  private _to: Tile;
  private _unit: Unit;

  constructor(
    unit: Unit,
    from: Tile,
    to: Tile,
    path: Path,
    pathFinderRegistry: PathFinderRegistry = pathFinderRegistryInstance
  ) {
    super();

    this._from = from;
    this._path = path;
    this._pathFinderRegistry = pathFinderRegistry;
    this._to = to;
    this._unit = unit;
  }

  entries(): IConstructor<PathFinder>[] {
    const registry = this;

    return this._pathFinderRegistry.entries().map(
      (Finder: IConstructor<PathFinder>): IConstructor<PathFinder> =>
        // `new` on a function that returns an object gives that object.
        function (unit: Unit, start: Tile, end: Tile): PathFinder {
          return new PlannedPathFinder(unit, start, end, Finder, registry);
        } as unknown as IConstructor<PathFinder>
    );
  }

  /** The planned route, once, if it is the one being asked for. */
  take(unit: Unit, from: Tile, to: Tile): Path | null {
    const path = this._path;

    if (
      path === null ||
      unit !== this._unit ||
      from !== this._from ||
      to !== this._to
    ) {
      return null;
    }

    this._path = null;

    return path;
  }
}

export default PlannedPathFinderRegistry;
