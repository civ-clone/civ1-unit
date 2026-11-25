import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { EffectDescription } from '@civ-clone/core-rule/Description';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import availableRequirements from '@civ-clone/civ1-world/Requirements';
import { TerrainJob as BaseTerrainJob } from '@civ-clone/base-terrain-properties/lib/jobTurns';
export declare const baseTerrainMovementCost: [typeof Terrain, number][];
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
export declare const terrainMovementCost: (terrain: Terrain) => number | null;
type TerrainJob = BaseTerrainJob<typeof UnitAction>;
/** A road takes this many times the terrain's movement cost in turns, and a railroad `RAILROAD_JOB_FACTOR` times. */
export declare const ROAD_JOB_FACTOR: number, RAILROAD_JOB_FACTOR: number;
/** A Fortress takes the terrain's movement cost plus this many turns (v474.05 `CONTROL.C`, the 'f' order). */
export declare const FORTRESS_JOB_TURNS: number;
/**
 * The tile improvement each terrain job builds, or whose order it is: in Civ1 clearing a Forest, a Jungle or a Swamp
 * is the irrigate order on it, and planting a Forest the mine order. For the Civilopedia (civ-clone/web-renderer#620).
 */
export declare const terrainJobImprovements: [
  typeof UnitAction,
  typeof TileImprovement
][];
/** The tile improvement each terrain job takes away, for the Civilopedia (civ-clone/web-renderer#621). */
export declare const terrainJobRemovals: [
  typeof UnitAction,
  typeof TileImprovement
][];
/** A land unit moves this many squares along a road for each of its moves. */
export declare const ROAD_SQUARES_PER_MOVE: number;
/** The tile improvement `Action` builds, or whose order it is (`terrainJobImprovements`), or `null`. */
export declare const terrainJobImprovement: (
  Action: typeof UnitAction
) => typeof TileImprovement | null;
/**
 * How many turns each of a Settlers' terrain jobs takes in Civ1, per terrain:
 * v474.05's terrain modification table for irrigating and mining (OpenCivOne
 * `GameData.cs`), and twice (a road) or four times (a railroad) the terrain's
 * movement cost. *Rome on 640K a Day*, Table 3-2, agrees.
 *
 * A job converting the terrain (`ClearForest`, `PlantForest` and so on) is the
 * irrigate or mine order on that terrain, so it takes that order's time.
 */
export declare const civ1TerrainJobTurns: TerrainJob[];
/**
 * The turns a unit is busy with `Action` on `terrain`, or `null` if the job
 * has no time there.
 *
 * One fewer than Civ1's figure: Civ1 counts the turn the order is given on,
 * and a `DelayedAction` started on turn T finishes at the start of turn
 * T + turns. So a road on Grassland (2 in Civ1) is there at the start of the
 * next turn, as it is in Civ1.
 */
export declare const terrainJobTurns: (
  Action: typeof UnitAction,
  terrain: Terrain
) => number | null;
/** The unit whose work the terrain jobs are, as the Civilopedia says it. */
export declare const terrainJobUnit: typeof Unit;
/**
 * The advances a Road on `TerrainType` needs, from civ1-world's requirements (Bridge Building on a River), which a
 *  Railroad, built on a Road, needs too.
 */
export declare const roadAdvancesOn: (
  TerrainType: typeof Terrain,
  requirements?: typeof availableRequirements
) => Function[];
/**
 * What each terrain job says it takes, for the Civilopedia (civ-clone/web-renderer#620): Civ1's turns (the table's
 * figure, which counts the turn the order is given on, as Civ1 does) to build the job's improvement on each terrain it
 * has a time for. A time worked out from the terrain (a road, a railroad) is given for each terrain civ1-world lets
 * the improvement be built on. A job that builds no improvement but takes one away (cleaning up pollution) says its
 * own turns (`removalDescriptions`), and any other says nothing. A job converting the terrain (clearing or planting a forest) is named as itself, not as the order it is, as it builds no improvement.
 */
export declare const terrainJobDescriptions: (
  [Action, time]: TerrainJob,
  requirements?: typeof availableRequirements
) => EffectDescription[];
export declare const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  transportRegistry?: TransportRegistry
) => MovementCost[];
export default getRules;
