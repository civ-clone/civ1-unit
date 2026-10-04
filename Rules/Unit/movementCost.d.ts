import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Terrain from '@civ-clone/core-terrain/Terrain';
import UnitAction from '@civ-clone/core-unit/Action';
export declare const baseTerrainMovementCost: [typeof Terrain, number][];
export declare const terrainMovementCost: (terrain: Terrain) => number | null;
type TerrainJob = [
  typeof UnitAction,
  [typeof Terrain, number][] | ((terrain: Terrain) => number | null)
];
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
export declare const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  transportRegistry?: TransportRegistry
) => MovementCost[];
export default getRules;
