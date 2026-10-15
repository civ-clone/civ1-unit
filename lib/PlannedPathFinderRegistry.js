"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannedPathFinderRegistry = void 0;
const PathFinderRegistry_1 = require("@civ-clone/core-world-path/PathFinderRegistry");
const PathFinder_1 = require("@civ-clone/core-world-path/PathFinder");
/**
 * A search by `Finder`, unless `registry` has the route already.
 *
 * Not a subclass of `Finder`: a class made for each `GoTo` would give the
 * search's own methods a new kind of object to handle each time, and every
 * search after slows down for it (checking 157 GoTos took up to 40% longer).
 */
class PlannedPathFinder extends PathFinder_1.default {
    constructor(unit, start, end, Finder, registry) {
        super(unit, start, end);
        this._Finder = Finder;
        this._registry = registry;
    }
    generate() {
        var _a;
        return ((_a = this._registry.take(this.unit(), this.start(), this.end())) !== null && _a !== void 0 ? _a : new this._Finder(this.unit(), this.start(), this.end()).generate());
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
 *
 * It is also only used while the routing state it was found in still stands:
 * `revision` says what that is now, and a route found at a different revision
 * is dropped, so a unit that has since moved onto (or been created on, or
 * destroyed on) a tile of the route can't leave the `GoTo` with a route that a
 * search would no longer find.
 */
class PlannedPathFinderRegistry extends PathFinderRegistry_1.PathFinderRegistry {
    constructor(unit, from, to, path, pathFinderRegistry = PathFinderRegistry_1.instance, 
    // Changes whenever something that a route depends on does; the route is only good for the value it was found at.
    revision = () => 0, revisionOfPath = revision()) {
        super();
        this._from = from;
        this._path = path;
        this._pathFinderRegistry = pathFinderRegistry;
        this._revision = revision;
        this._revisionOfPath = revisionOfPath;
        this._to = to;
        this._unit = unit;
    }
    entries() {
        const registry = this;
        return this._pathFinderRegistry.entries().map((Finder) => 
        // `new` on a function that returns an object gives that object.
        function (unit, start, end) {
            return new PlannedPathFinder(unit, start, end, Finder, registry);
        });
    }
    /** The planned route, once, if it is the one being asked for. */
    take(unit, from, to) {
        const path = this._path;
        // Spent either way: a route that has gone stale is no use to a later search of the same GoTo either.
        this._path = null;
        if (path === null ||
            this._revision() !== this._revisionOfPath ||
            unit !== this._unit ||
            from !== this._from ||
            to !== this._to) {
            return null;
        }
        return path;
    }
}
exports.PlannedPathFinderRegistry = PlannedPathFinderRegistry;
exports.default = PlannedPathFinderRegistry;
//# sourceMappingURL=PlannedPathFinderRegistry.js.map