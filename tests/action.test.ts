import {
  Arctic,
  Desert,
  Forest,
  Grassland,
  Hills,
  Jungle,
  Mountains,
  Ocean,
  Plains,
  River,
  Swamp,
  Tundra,
} from '@civ-clone/civ1-world/Terrains';
import { Attack, CaptureCity, Fortify, Move } from '../Actions';
import {
  BuildIrrigation,
  BuildMine,
  BuildRoad,
  ClearForest,
  ClearJungle,
  ClearSwamp,
  PlantForest,
} from '../Actions';
import { Settlers, Warrior } from '../Units';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import { BridgeBuilding } from '@civ-clone/civ1-science/Advances';
import City from '@civ-clone/core-city/City';
import CityNameRegistry from '@civ-clone/core-civilization/CityNameRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { FoundCity } from '../Actions';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TerrainRegistry from '@civ-clone/core-terrain/TerrainRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import action from '../Rules/Unit/action';
import available from '@civ-clone/civ1-world/Rules/TileImprovement/available';
import built from '@civ-clone/civ1-world/Rules/TileImprovement/built';
import { expect } from 'chai';
import movementCost from '../Rules/Unit/movementCost';
import unitCreated from '../Rules/Unit/created';
import unitYield from '../Rules/Unit/yield';
import validateMove from '../Rules/Unit/validateMove';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';

describe('Action', (): void => {
  const ruleRegistry = new RuleRegistry(),
    advanceRegistry = new AdvanceRegistry(),
    cityNameRegistry = new CityNameRegistry(),
    cityRegistry = new CityRegistry(),
    terrainRegistry = new TerrainRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    playerResearchRegistry = new PlayerResearchRegistry(),
    terrainFeatureRegistry = new TerrainFeatureRegistry(),
    transportRegistry = new TransportRegistry(),
    unitRegistry = new UnitRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry(),
    getUnit = (
      player: Player,
      tile: Tile,
      UnitType: typeof Unit = Warrior,
      city: City | null = null
    ): Unit => new UnitType(city, player, tile, ruleRegistry),
    getPlayer = () => {
      const player = new Player();

      // TODO: player created events do this automatically
      playerResearchRegistry.register(
        new PlayerResearch(player, advanceRegistry, ruleRegistry)
      );

      return player;
    },
    generateFixedWorld = async ({
      TerrainType = Grassland,
      height = 5,
      rulesRegistry = ruleRegistry,
      width = 5,
    }: {
      TerrainType?: typeof Terrain;
      height?: number;
      rulesRegistry?: RuleRegistry;
      width?: number;
    } = {}): Promise<World> => {
      const generator = new FillGenerator(height, width, TerrainType),
        world = new World(generator);

      await world.build(rulesRegistry);

      return world;
    };

  ruleRegistry.register(
    ...action(
      cityNameRegistry,
      cityRegistry,
      ruleRegistry,
      tileImprovementRegistry,
      unitImprovementRegistry,
      unitRegistry,
      terrainFeatureRegistry,
      transportRegistry
    ),
    ...available(playerResearchRegistry, tileImprovementRegistry),
    ...built(tileImprovementRegistry),
    ...movementCost(tileImprovementRegistry),
    ...unitYield(),
    ...unitCreated(unitRegistry),
    ...validateMove()
  );

  terrainRegistry.register(
    Arctic,
    Desert,
    Forest,
    Grassland,
    Hills,
    Jungle,
    Mountains,
    Ocean,
    Plains,
    River,
    Swamp,
    Tundra
  );

  it('should be able to attack enemy unit next to it', async (): Promise<void> => {
    const world = await generateFixedWorld(),
      player = getPlayer(),
      enemy = getPlayer(),
      unit = getUnit(player, world.get(0, 0)),
      enemyUnit = getUnit(enemy, world.get(1, 0));

    const actions = unit.actions(enemyUnit.tile());

    expect(actions.some((action) => action instanceof Attack)).to.true;
  });

  it('should be able to fortify', async (): Promise<void> => {
    const world = await generateFixedWorld(),
      player = getPlayer(),
      unit = getUnit(player, world.get(0, 0));

    expect(unit.actions().some((action) => action instanceof Fortify)).to.true;
  });

  it('should not be able to move adjacent to an enemy unit', async (): Promise<void> => {
    const world = await generateFixedWorld(),
      player = getPlayer(),
      enemy = getPlayer(),
      unit = getUnit(player, world.get(0, 0));

    getUnit(enemy, world.get(1, 0));

    [
      world.get(0, 1),
      world.get(0, 4),
      world.get(1, 0),
      world.get(1, 4),
    ].forEach((destination) => {
      expect(
        unit.actions(destination).every((action) => !(action instanceof Move))
      ).to.true;
    });
  });

  it('should be able to move away from enemy unit', async (): Promise<void> => {
    const world = await generateFixedWorld(),
      player = getPlayer(),
      enemy = getPlayer(),
      unit = getUnit(player, world.get(0, 0));

    getUnit(enemy, world.get(1, 0));

    [world.get(4, 4), world.get(4, 0), world.get(4, 1)].forEach(
      (destination) => {
        expect(
          unit.actions(destination).some((action) => action instanceof Move)
        ).to.true;
      }
    );
  });

  it('should be possible to capture an unprotected enemy city', async (): Promise<void> => {
    const world = await generateFixedWorld(),
      player = getPlayer(),
      enemy = getPlayer(),
      unit = getUnit(player, world.get(1, 1)),
      city = new City(enemy, world.get(2, 2), '');

    cityRegistry.register(city);

    const [captureCity] = unit
      .actions(city.tile())
      .filter((action) => action instanceof CaptureCity);

    expect(captureCity).to.instanceof(CaptureCity);

    expect(city.player()).to.equal(enemy);

    unit.action(captureCity, cityRegistry);

    expect(city.player()).to.equal(player);

    cityRegistry.unregister(city);
  });

  it('should not be possible to capture a protected enemy city', async (): Promise<void> => {
    const world = await generateFixedWorld(),
      player = getPlayer(),
      enemy = getPlayer(),
      unit = getUnit(player, world.get(1, 1)),
      city = new City(enemy, world.get(2, 2), '');

    cityRegistry.register(city);

    getUnit(enemy, world.get(2, 2));

    const [captureCity] = unit
      .actions(city.tile())
      .filter((action) => action instanceof CaptureCity);

    expect(captureCity).to.undefined;

    cityRegistry.unregister(city);
  });

  (
    [
      [BuildIrrigation, Desert, Grassland, Hills, Plains, River],
      [BuildMine, Desert, Hills, Mountains],
      [
        BuildRoad,
        Arctic,
        Desert,
        Forest,
        Grassland,
        Hills,
        Jungle,
        Mountains,
        Plains,
        Swamp,
        Tundra,
      ],
      [ClearForest, Forest],
      [ClearJungle, Jungle],
      [ClearSwamp, Swamp],
      [
        FoundCity,
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
      ],
      [PlantForest, Plains],
    ] as [typeof UnitAction, ...typeof Terrain[]][]
  ).forEach(
    ([ActionType, ...validTerrains]: [
      typeof UnitAction,
      ...typeof Terrain[]
    ]) => {
      validTerrains.forEach((TerrainType: typeof Terrain): void => {
        it(`should be possible for Settlers to ${ActionType.name} on ${TerrainType.name}`, async (): Promise<void> => {
          const world = await generateFixedWorld({
            TerrainType: TerrainType,
          });

          world.get(3, 4).setTerrain(new Ocean());

          const player = getPlayer(),
            unit = getUnit(player, world.get(4, 4), Settlers),
            [action] = unit
              .actions()
              .filter(
                (action: UnitAction): boolean => action instanceof ActionType
              );
          expect(action).to.instanceof(ActionType);
        });
      });

      terrainRegistry
        .filter((Terrain) => !validTerrains.includes(Terrain))
        .forEach((Terrain) => {
          it(`should not be possible for Settlers to ${ActionType.name} on ${Terrain.name}`, async (): Promise<void> => {
            const world = await generateFixedWorld({
                TerrainType: Terrain,
              }),
              player = getPlayer(),
              unit = getUnit(player, world.get(4, 4), Settlers),
              [action] = unit
                .actions()
                .filter((action) => action instanceof ActionType);

            expect(action).to.undefined;
          });
        });
    }
  );

  [Desert, Grassland, Hills, Plains].forEach((Terrain) => {
    it(`should not be possible for Settlers to BuildIrrigation on ${Terrain.name} without access to water`, async (): Promise<void> => {
      const world = await generateFixedWorld({
          TerrainType: Terrain,
        }),
        player = getPlayer(),
        unit = getUnit(player, world.get(4, 4), Settlers);

      expect(unit.actions().some((action) => action instanceof BuildIrrigation))
        .to.false;
    });
  });

  (
    [[BuildRoad, BridgeBuilding, River]] as [
      typeof UnitAction,
      typeof Advance,
      typeof Terrain
    ][]
  ).forEach(([Action, Advance, Terrain]) => {
    it(`should not be possible for Settlers to ${Action.name} on ${Terrain.name} before discovering ${Advance.name}`, async (): Promise<void> => {
      const world = await generateFixedWorld({
          TerrainType: Terrain,
        }),
        player = getPlayer(),
        unit = getUnit(player, world.get(4, 4), Settlers);

      expect(unit.actions().some((action) => action instanceof Action)).to
        .false;
    });

    it(`should be possible for Settlers to ${Action.name} on ${Terrain.name} after discovering ${Advance.name}`, async (): Promise<void> => {
      const world = await generateFixedWorld({
          TerrainType: Terrain,
        }),
        player = getPlayer(),
        unit = getUnit(player, world.get(4, 4), Settlers),
        playerResearch = playerResearchRegistry.getByPlayer(player);

      playerResearch.complete().push(new BridgeBuilding());

      expect(unit.actions().some((action) => action instanceof Action)).to.true;
    });
  });
});
