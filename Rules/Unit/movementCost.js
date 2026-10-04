"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.terrainJobTurns = exports.civ1TerrainJobTurns = exports.terrainMovementCost = exports.baseTerrainMovementCost = void 0;
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const Types_1 = require("../../Types");
const Actions_1 = require("../../Actions");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const MovementCost_1 = require("@civ-clone/core-unit/Rules/MovementCost");
// I wonder if this would be easier to manage as a `Yield` on the `Terrain`?
exports.baseTerrainMovementCost = [
    [Terrains_1.Arctic, 2],
    [Terrains_1.Desert, 1],
    [Terrains_1.Forest, 2],
    [Terrains_1.Grassland, 1],
    [Terrains_1.Hills, 2],
    [Terrains_1.Jungle, 2],
    [Terrains_1.Mountains, 3],
    [Terrains_1.Ocean, 1],
    [Terrains_1.Plains, 1],
    [Terrains_1.River, 1],
    [Terrains_1.Swamp, 2],
    [Terrains_1.Tundra, 1],
];
/**
 * The table above, as a lookup, cached by the terrain's own constructor.
 *
 * This used to be expressed as one `MovementCost` rule per cell — one per
 * terrain for moving, and one per (action, terrain) pair for everything else,
 * 132 of those. That reads well and is how rules are meant to compose, but it
 * put a 12-way and a 132-way linear scan on the hottest path in the engine:
 * `RuleRegistry.process(MovementCost, …)` is 98.5% of every rule validation a
 * game performs, the path finder calls it once per neighbouring tile it
 * considers, and it walked 148 rules to find the one that applied. The other
 * 147 were answering "no" — most of them on `action instanceof Action`, before
 * terrain was ever consulted.
 *
 * A lookup is the same answer without the scan, because the twelve terrains
 * are siblings: `Arctic`…`Tundra` all extend `Land` or `Water` and none
 * extends another, so at most one row can ever match a given terrain and
 * "which rows match" was never a meaningful question.
 *
 * `instanceof` rather than an identity check on the constructor, so a mod's
 * `class Steppe extends Plains` still costs what `Plains` costs, as it did
 * when this was 132 rules. Where such a subclass could match two rows the
 * first row wins, whereas 132 rules would have matched twice and left the
 * caller to choose; nothing in the table can do that today, and a terrain that
 * wants its own cost should have its own row.
 */
const cachedTerrainMovementCost = new Map();
const terrainMovementCost = (terrain) => {
    const cached = cachedTerrainMovementCost.get(terrain.constructor);
    if (cached !== undefined) {
        return cached;
    }
    const match = exports.baseTerrainMovementCost.find(([TerrainType]) => terrain instanceof TerrainType), cost = match === undefined ? null : match[1];
    cachedTerrainMovementCost.set(terrain.constructor, cost);
    return cost;
};
exports.terrainMovementCost = terrainMovementCost;
/**
 * How many turns each of a Settlers' terrain jobs takes in Civ1, per terrain:
 * v474.05's terrain modification table for irrigating and mining (OpenCivOne
 * `GameData.cs`), and twice (a road) or four times (a railroad) the terrain's
 * movement cost. *Rome on 640K a Day*, Table 3-2, agrees.
 *
 * A job converting the terrain (`ClearForest`, `PlantForest` and so on) is the
 * irrigate or mine order on that terrain, so it takes that order's time.
 */
exports.civ1TerrainJobTurns = [
    [
        Actions_1.BuildIrrigation,
        [
            [Terrains_1.Desert, 5],
            [Terrains_1.Grassland, 5],
            [Terrains_1.Hills, 10],
            [Terrains_1.Plains, 5],
            [Terrains_1.River, 5],
        ],
    ],
    [
        Actions_1.BuildMine,
        [
            [Terrains_1.Desert, 5],
            [Terrains_1.Hills, 10],
            [Terrains_1.Mountains, 10],
        ],
    ],
    [
        Actions_1.BuildRoad,
        (terrain) => {
            const cost = (0, exports.terrainMovementCost)(terrain);
            return cost === null ? null : 2 * cost;
        },
    ],
    [
        Actions_1.BuildRailroad,
        (terrain) => {
            const cost = (0, exports.terrainMovementCost)(terrain);
            return cost === null ? null : 4 * cost;
        },
    ],
    [Actions_1.ClearForest, [[Terrains_1.Forest, 5]]],
    [Actions_1.ClearJungle, [[Terrains_1.Jungle, 15]]],
    [Actions_1.ClearSwamp, [[Terrains_1.Swamp, 15]]],
    [
        Actions_1.PlantForest,
        [
            [Terrains_1.Grassland, 10],
            [Terrains_1.Jungle, 15],
            [Terrains_1.Plains, 15],
            [Terrains_1.Swamp, 15],
        ],
    ],
];
/**
 * The turns a unit is busy with `Action` on `terrain`, or `null` if the job
 * has no time there.
 *
 * One fewer than Civ1's figure: Civ1 counts the turn the order is given on,
 * and a `DelayedAction` started on turn T finishes at the start of turn
 * T + turns. So a road on Grassland (2 in Civ1) is there at the start of the
 * next turn, as it is in Civ1.
 */
const terrainJobTurns = (Action, terrain) => {
    var _a, _b;
    const job = exports.civ1TerrainJobTurns.find(([JobAction]) => JobAction === Action);
    if (job === undefined) {
        return null;
    }
    const [, turns] = job, civ1Turns = typeof turns === 'function'
        ? turns(terrain)
        : (_b = (_a = turns.find(([TerrainType]) => terrain instanceof TerrainType)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
    return civ1Turns === null ? null : civ1Turns - 1;
};
exports.terrainJobTurns = terrainJobTurns;
const getRules = (tileImprovementRegistry = TileImprovementRegistry_1.instance, transportRegistry = TransportRegistry_1.instance) => [
    // One rule, not one per terrain: see `terrainMovementCost`. Was
    // `civ1-unit:unit/movement-cost/move/<Terrain>`.
    new MovementCost_1.default('civ1-unit:unit/movement-cost/move', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, action) => (0, exports.terrainMovementCost)(action.to().terrain()) !== null), new Effect_1.default((unit, action) => (0, exports.terrainMovementCost)(action.to().terrain()))),
    new MovementCost_1.default('civ1-unit:unit/movement-cost/air-and-naval', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Air || unit instanceof Types_1.Naval), new Effect_1.default(() => 1)),
    new MovementCost_1.default('civ1-unit:unit/movement-cost/road', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.from())
        .some((improvement) => improvement instanceof TileImprovements_1.Road)), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.to())
        .some((improvement) => improvement instanceof TileImprovements_1.Road)), new Effect_1.default(() => 1 / 3)),
    new MovementCost_1.default('civ1-unit:unit/movement-cost/railroad', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.from())
        .some((improvement) => improvement instanceof TileImprovements_1.Railroad)), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.to())
        .some((improvement) => improvement instanceof TileImprovements_1.Railroad)), 
    // TODO: need to also protect against goto etc, like classic Civ does, although I'd rather that was done by evaluating
    //  the moves and if a loop is detected auto-cancelling - this is pretty primitive.
    // new Criterion((unit) => ! (unit.player() instanceof AIPlayer)),
    new Effect_1.default(() => 0)),
    new MovementCost_1.default('civ1-unit:unit/movement-cost/transported', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), 
    // `hasUnit`, not `getByUnit` in a `try`: the latter answers "no" by
    // throwing, and this criterion is evaluated for every land unit on every
    // move. A 150-turn game spent 23% of its time in `getByUnit`, nearly all
    // of it scanning every manifest and then constructing a `TypeError` to say
    // the unit was not aboard anything.
    new Criterion_1.default((unit) => transportRegistry.hasUnit(unit)), new Criterion_1.default((unit) => transportRegistry.getByUnit(unit).transport() instanceof Types_1.NavalTransport), new Effect_1.default(() => 0)),
    new MovementCost_1.default(
    // An aircraft aboard a Carrier moves with it for free, even after landing has used up its moves. Taking off (a
    // `Move` away from the Carrier's tile) costs as normal.
    'civ1-unit:unit/movement-cost/transported/air', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Air), new Criterion_1.default((unit) => transportRegistry.hasUnit(unit)), new Criterion_1.default((unit, action) => transportRegistry.getByUnit(unit).transport().tile() === action.to()), new Effect_1.default(() => 0)),
    // One rule per action, not one per (action, terrain) pair: 11 rules where
    // there were 132, all but one of which used to be rejected on the
    // `instanceof` below. Was
    // `civ1-unit:unit/movement-cost/action/<Action>/<Terrain>`.
    ...[
        [Actions_1.Fortify, 1],
        [Actions_1.Pillage, 1],
        [Actions_1.Sleep, 0],
    ].map(([Action, moveCost]) => new MovementCost_1.default(`civ1-unit:unit/movement-cost/action/${Action.name}`, new Criterion_1.default((unit, action) => action instanceof Action), new Criterion_1.default((unit) => (0, exports.terrainMovementCost)(unit.tile().terrain()) !== null), new Effect_1.default((unit) => moveCost * (0, exports.terrainMovementCost)(unit.tile().terrain())))),
    // Terrain jobs take the turns in `civ1TerrainJobTurns`, less the turn the
    // order is given on: see `terrainJobTurns`.
    ...exports.civ1TerrainJobTurns.map(([Action]) => new MovementCost_1.default(`civ1-unit:unit/movement-cost/action/${Action.name}`, new Criterion_1.default((unit, action) => action instanceof Action), new Criterion_1.default((unit) => (0, exports.terrainJobTurns)(Action, unit.tile().terrain()) !== null), new Effect_1.default((unit) => (0, exports.terrainJobTurns)(Action, unit.tile().terrain())))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=movementCost.js.map