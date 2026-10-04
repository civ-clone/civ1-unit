import {
  Arctic,
  Desert,
  Forest,
  Grassland,
  Hills,
  Jungle,
  Mountains,
  Plains,
  River,
  Swamp,
  Tundra,
} from '@civ-clone/civ1-world/Terrains';
import {
  BuildIrrigation,
  BuildMine,
  BuildRailroad,
  BuildRoad,
  ClearForest,
  ClearJungle,
  ClearSwamp,
  PlantForest,
} from '../Actions';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/civ1-world/TerrainFeatures';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { Settlers } from '../Units';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainFeatureRegistry from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitAction from '@civ-clone/core-unit/Action';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { feature } from '@civ-clone/core-terrain-feature/Rules/Feature';
import movementCost from '../Rules/Unit/movementCost';

describe('unit:movementCost:terrain-jobs', (): void => {
  const ruleRegistry = new RuleRegistry(),
    player = new Player(ruleRegistry);

  ruleRegistry.register(...movementCost(new TileImprovementRegistry()));

  const settlersOn = async (TerrainType: typeof Terrain): Promise<Settlers> => {
    const world = new World(new FillGenerator(1, 1, TerrainType), ruleRegistry);

    await world.build();

    return new Settlers(null, player, world.get(0, 0), ruleRegistry);
  };

  // Civ1's Terrain Time Management table (v474.05; Rome on 640K, Table 3-2), in
  // turns including the one the order is given on. The engine's figure is one
  // fewer: a job started on turn T finishes at the start of turn T + turns.
  (
    [
      [BuildIrrigation, Desert, 5],
      [BuildIrrigation, Grassland, 5],
      [BuildIrrigation, Hills, 10],
      [BuildIrrigation, Plains, 5],
      [BuildIrrigation, River, 5],
      [BuildMine, Desert, 5],
      [BuildMine, Hills, 10],
      [BuildMine, Mountains, 10],
      [BuildRoad, Arctic, 4],
      [BuildRoad, Desert, 2],
      [BuildRoad, Forest, 4],
      [BuildRoad, Grassland, 2],
      [BuildRoad, Hills, 4],
      [BuildRoad, Jungle, 4],
      [BuildRoad, Mountains, 6],
      [BuildRoad, Plains, 2],
      [BuildRoad, River, 2],
      [BuildRoad, Swamp, 4],
      [BuildRoad, Tundra, 2],
      [BuildRailroad, Arctic, 8],
      [BuildRailroad, Desert, 4],
      [BuildRailroad, Forest, 8],
      [BuildRailroad, Grassland, 4],
      [BuildRailroad, Hills, 8],
      [BuildRailroad, Jungle, 8],
      [BuildRailroad, Mountains, 12],
      [BuildRailroad, Plains, 4],
      [BuildRailroad, River, 4],
      [BuildRailroad, Swamp, 8],
      [BuildRailroad, Tundra, 4],
      [ClearForest, Forest, 5],
      [ClearJungle, Jungle, 15],
      [ClearSwamp, Swamp, 15],
      [PlantForest, Grassland, 10],
      [PlantForest, Jungle, 15],
      [PlantForest, Plains, 15],
      [PlantForest, Swamp, 15],
    ] as [typeof UnitAction, typeof Terrain, number][]
  ).forEach(([ActionType, TerrainType, civ1Turns]) => {
    it(`should take Settlers ${civ1Turns} turns in Civ1 terms to ${ActionType.name} on ${TerrainType.name}`, async (): Promise<void> => {
      const unit = await settlersOn(TerrainType),
        action = new ActionType(unit.tile(), unit.tile(), unit, ruleRegistry);

      expect(ruleRegistry.process(MovementCost, unit, action)).to.deep.equal([
        civ1Turns - 1,
      ]);
    });
  });

  it('should be able to give a planted Forest Game', async (): Promise<void> => {
    const terrainFeatureRegistry = new TerrainFeatureRegistry(),
      featureRuleRegistry = new RuleRegistry();

    featureRuleRegistry.register(
      ...feature(Forest, Game, 1, terrainFeatureRegistry)
    );

    const unit = await settlersOn(Plains),
      action = new PlantForest(
        unit.tile(),
        unit.tile(),
        unit,
        featureRuleRegistry,
        terrainFeatureRegistry
      );

    PlantForest.complete(action);

    expect(unit.tile().terrain()).to.instanceof(Forest);
    expect(
      terrainFeatureRegistry
        .getByTerrain(unit.tile().terrain())
        .some((terrainFeature) => terrainFeature instanceof Game)
    ).to.true;
  });
});
