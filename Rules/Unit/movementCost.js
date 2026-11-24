"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.terrainJobDescriptions = exports.roadAdvancesOn = exports.terrainJobUnit = exports.terrainJobTurns = exports.civ1TerrainJobTurns = exports.terrainJobImprovement = exports.ROAD_SQUARES_PER_MOVE = exports.terrainJobRemovals = exports.terrainJobImprovements = exports.RAILROAD_JOB_FACTOR = exports.ROAD_JOB_FACTOR = exports.terrainMovementCost = exports.baseTerrainMovementCost = void 0;
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const Types_1 = require("../../Types");
const Actions_1 = require("../../Actions");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const RuleIds_1 = require("../../RuleIds");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const MovementCost_1 = require("@civ-clone/core-unit/Rules/MovementCost");
const Units_1 = require("../../Units");
const Requirements_1 = require("@civ-clone/civ1-world/Requirements");
const terrainTable_1 = require("@civ-clone/base-terrain-properties/lib/terrainTable");
const jobTurns_1 = require("@civ-clone/base-terrain-properties/lib/jobTurns");
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
 * The table above, as a lookup, cached by the terrain's own constructor (see
 * `base-terrain-properties`' `cachedTerrainLookup`).
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
exports.terrainMovementCost = (0, terrainTable_1.cachedTerrainLookup)(exports.baseTerrainMovementCost);
/** A road takes this many times the terrain's movement cost in turns, and a railroad `RAILROAD_JOB_FACTOR` times. */
exports.ROAD_JOB_FACTOR = 2, exports.RAILROAD_JOB_FACTOR = 4;
/**
 * The tile improvement each terrain job builds, or whose order it is: in Civ1 clearing a Forest, a Jungle or a Swamp
 * is the irrigate order on it, and planting a Forest the mine order. For the Civilopedia (civ-clone/web-renderer#620).
 */
exports.terrainJobImprovements = [
    [Actions_1.BuildIrrigation, TileImprovements_1.Irrigation],
    [Actions_1.BuildMine, TileImprovements_1.Mine],
    [Actions_1.BuildRoad, TileImprovements_1.Road],
    [Actions_1.BuildRailroad, TileImprovements_1.Railroad],
    [Actions_1.ClearForest, TileImprovements_1.Irrigation],
    [Actions_1.ClearJungle, TileImprovements_1.Irrigation],
    [Actions_1.ClearSwamp, TileImprovements_1.Irrigation],
    [Actions_1.PlantForest, TileImprovements_1.Mine],
];
/** The tile improvement each terrain job takes away, for the Civilopedia (civ-clone/web-renderer#621). */
exports.terrainJobRemovals = [[Actions_1.CleanPollution, TileImprovements_1.Pollution]];
/** A land unit moves this many squares along a road for each of its moves. */
exports.ROAD_SQUARES_PER_MOVE = 3;
/** The tile improvement `Action` builds, or whose order it is (`terrainJobImprovements`), or `null`. */
const terrainJobImprovement = (Action) => {
    var _a, _b;
    return (_b = (_a = exports.terrainJobImprovements.find(([JobAction]) => JobAction === Action)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
};
exports.terrainJobImprovement = terrainJobImprovement;
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
    [Actions_1.BuildRoad, (0, jobTurns_1.multipleOf)(exports.terrainMovementCost, exports.ROAD_JOB_FACTOR)],
    [Actions_1.BuildRailroad, (0, jobTurns_1.multipleOf)(exports.terrainMovementCost, exports.RAILROAD_JOB_FACTOR)],
    // Cleaning up pollution takes 4 turns on any terrain (Table 3-2; v474.05 `CheckPlayerTurn.cs` ~L1050,
    //  civ-clone/web-renderer#32).
    [Actions_1.CleanPollution, () => 4],
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
const terrainJobTurns = (Action, terrain) => (0, jobTurns_1.terrainJobTurns)(exports.civ1TerrainJobTurns, Action, terrain);
exports.terrainJobTurns = terrainJobTurns;
/** The unit whose work the terrain jobs are, as the Civilopedia says it. */
exports.terrainJobUnit = Units_1.Settlers;
/**
 * The advances a Road on `TerrainType` needs, from civ1-world's requirements (Bridge Building on a River), which a
 *  Railroad, built on a Road, needs too.
 */
const roadAdvancesOn = (TerrainType, requirements = Requirements_1.default) => requirements
    .filter((requirement) => {
    var _a;
    return requirement.subject === TileImprovements_1.Road &&
        ((_a = requirement.where) !== null && _a !== void 0 ? _a : []).includes(TerrainType);
})
    .flatMap((requirement) => requirement.targets.filter((target) => typeof target === 'function'));
exports.roadAdvancesOn = roadAdvancesOn;
/**
 * What each terrain job says it takes, for the Civilopedia (civ-clone/web-renderer#620): Civ1's turns (the table's
 * figure, which counts the turn the order is given on, as Civ1 does) to build the job's improvement on each terrain it
 * has a time for. A time worked out from the terrain (a road, a railroad) is given for each terrain civ1-world lets
 * the improvement be built on. A job that builds no improvement but takes one away (cleaning up pollution) says its
 * own turns (`removalDescriptions`), and any other says nothing. A job converting the terrain (clearing or planting a forest) is named as itself, not as the order it is, as it builds no improvement.
 */
const terrainJobDescriptions = ([Action, time], requirements = Requirements_1.default) => {
    const Improvement = (0, exports.terrainJobImprovement)(Action);
    if (Improvement === null) {
        return removalDescriptions([Action, time]);
    }
    const rows = Array.isArray(time)
        ? time
        : requirements
            .filter((requirement) => requirement.subject === Improvement)
            .flatMap((requirement) => { var _a; return ((_a = requirement.where) !== null && _a !== void 0 ? _a : []); })
            .filter((TerrainType, i, terrains) => terrains.indexOf(TerrainType) === i)
            .map((TerrainType) => [
            TerrainType,
            // Made without its constructor, which would run the game's `Created` rules: the lookup only needs its class.
            time(Object.create(TerrainType.prototype)),
        ]);
    return rows
        .filter(([, turns]) => turns !== null)
        .map(([TerrainType, turns]) => {
        const needs = Improvement === TileImprovements_1.Road || Improvement === TileImprovements_1.Railroad
            ? (0, exports.roadAdvancesOn)(TerrainType, requirements)
            : [];
        return {
            type: 'improvement_turns',
            subject: TerrainType,
            // A conversion declares the terrain it leaves (`result`); a job that builds an improvement doesn't.
            improvement: 'result' in Action ? Action : Improvement,
            value: turns,
            unit: exports.terrainJobUnit,
            with: needs.length > 0 ? needs : undefined,
        };
    });
};
exports.terrainJobDescriptions = terrainJobDescriptions;
/**
 * What a job that takes a tile improvement away says it takes (civ-clone/web-renderer#621): Civ1's turns, as the table
 *  gives them, to clean up Pollution. Said once for each time the land terrains give, which is one in Civ1, as it
 *  takes the same on any terrain. A job that takes nothing away says nothing.
 */
const removalDescriptions = ([Action, time,]) => {
    var _a, _b;
    const Removed = (_b = (_a = exports.terrainJobRemovals.find(([JobAction]) => JobAction === Action)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
    if (Removed === null) {
        return [];
    }
    const turns = (Array.isArray(time)
        ? time.map(([, turns]) => turns)
        : exports.baseTerrainMovementCost
            .filter(([TerrainType]) => TerrainType !== Terrains_1.Ocean)
            .map(([TerrainType]) => 
        // Made without its constructor, as `terrainJobDescriptions` does: the lookup only needs its class.
        time(Object.create(TerrainType.prototype)))).filter((value, i, values) => value !== null && values.indexOf(value) === i);
    return turns.map((value) => ({
        type: 'removal_turns',
        subject: Removed,
        value,
        unit: exports.terrainJobUnit,
    }));
};
const getRules = (tileImprovementRegistry = TileImprovementRegistry_1.instance, transportRegistry = TransportRegistry_1.instance) => [
    // One rule, not one per terrain: see `terrainMovementCost`. Was
    // `civ1-unit:unit/movement-cost/move/<Terrain>`.
    new MovementCost_1.default('civ1-unit:unit/movement-cost/move', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, action) => (0, exports.terrainMovementCost)(action.to().terrain()) !== null), new Effect_1.default((unit, action) => (0, exports.terrainMovementCost)(action.to().terrain())), 
    // What each terrain costs to move onto, for the Civilopedia (civ-clone/web-renderer#620).
    new Description_1.default(...exports.baseTerrainMovementCost.map(([TerrainType, value]) => ({
        type: 'movement_cost',
        subject: TerrainType,
        value,
    })))),
    new MovementCost_1.default('civ1-unit:unit/movement-cost/air-and-naval', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Air || unit instanceof Types_1.Naval), new Effect_1.default(() => 1)),
    new MovementCost_1.default('civ1-unit:unit/movement-cost/road', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.from())
        .some((improvement) => improvement instanceof TileImprovements_1.Road)), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.to())
        .some((improvement) => improvement instanceof TileImprovements_1.Road)), new Effect_1.default(() => 1 / exports.ROAD_SQUARES_PER_MOVE), 
    // What a road gives, for the Civilopedia (civ-clone/web-renderer#1272).
    new Description_1.default({
        type: 'route_squares',
        subject: TileImprovements_1.Road,
        value: exports.ROAD_SQUARES_PER_MOVE,
    })),
    // v474.05's railroad (`CONTROL.C`, the move): free from a square with a Railroad to one with a Road, so a train runs
    //  on into a city, which has no Railroad of its own (civ-clone/web-renderer#1029), and off the end of the line onto a
    //  road. Leaving a city onto the railroad costs a road move. v474.05 gives this only to the human's units moving by
    //  hand, not to the computer players' or to a goto: not followed here.
    new MovementCost_1.default(RuleIds_1.RAILROAD_MOVEMENT_RULE, new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), 
    // A Railroad and a Road on the square left (a Railroad is built on a Road, but a save or a rule set might part them),
    //  and a Road on the square entered.
    new Criterion_1.default((unit, action) => {
        const left = tileImprovementRegistry.getByTile(action.from());
        return (left.some((improvement) => improvement instanceof TileImprovements_1.Railroad) &&
            left.some((improvement) => improvement instanceof TileImprovements_1.Road));
    }), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.to())
        .some((improvement) => improvement instanceof TileImprovements_1.Road)), new Effect_1.default(() => 0), 
    // What a railroad gives, for the Civilopedia (civ-clone/web-renderer#1272).
    new Description_1.default({
        type: 'route_free',
        subject: TileImprovements_1.Railroad,
    })),
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
    ...exports.civ1TerrainJobTurns.map(([Action, time]) => {
        const descriptions = (0, exports.terrainJobDescriptions)([Action, time]);
        return new MovementCost_1.default(`civ1-unit:unit/movement-cost/action/${Action.name}`, new Criterion_1.default((unit, action) => action instanceof Action), new Criterion_1.default((unit) => (0, exports.terrainJobTurns)(Action, unit.tile().terrain()) !== null), new Effect_1.default((unit) => (0, exports.terrainJobTurns)(Action, unit.tile().terrain())), 
        // The turns each terrain takes, for the Civilopedia (civ-clone/web-renderer#620).
        ...(descriptions.length > 0 ? [new Description_1.default(...descriptions)] : []));
    }),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=movementCost.js.map