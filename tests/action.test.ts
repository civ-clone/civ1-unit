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
import {
  Attack,
  BuildIrrigation,
  BuildMine,
  BuildRailroad,
  BuildRoad,
  CaptureCity,
  ClearForest,
  ClearJungle,
  ClearSwamp,
  Fortify,
  FoundCity,
  Move,
  Pillage,
  PlantForest,
  SneakAttack,
  SneakCaptureCity,
} from '../Actions';
import { Caravan, Diplomat, Sail, Settlers, Warrior } from '../Units';
import {
  Irrigation,
  Mine,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import Action from '@civ-clone/core-unit/Action';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import BridgeBuilding from '@civ-clone/base-science-advance-bridgebuilding/BridgeBuilding';
import City from '@civ-clone/core-city/City';
import CityNameRegistry from '@civ-clone/core-civilization/CityNameRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RailroadAdvance from '@civ-clone/base-science-advance-railroad/Railroad';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TerrainFeatureRegistry from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import TerrainRegistry from '@civ-clone/core-terrain/TerrainRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
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

describe('Action', (): void => {
  const ruleRegistry = new RuleRegistry(),
    advanceRegistry = new AdvanceRegistry(),
    cityNameRegistry = new CityNameRegistry(),
    cityRegistry = new CityRegistry(),
    interactionRegistry = new InteractionRegistry(),
    terrainRegistry = new TerrainRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    playerResearchRegistry = new PlayerResearchRegistry(),
    terrainFeatureRegistry = new TerrainFeatureRegistry(),
    transportRegistry = new TransportRegistry(),
    unitRegistry = new UnitRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry(),
    getUnit = async (
      player: Player | null = null,
      tile: Tile | null = null,
      UnitType: typeof Unit = Warrior,
      city: City | null = null,
      world: World | null = null
    ): Promise<Unit> => {
      if (player === null) {
        player = getPlayer();
      }

      if (world === null) {
        world = await generateFixedWorld();
      }

      if (tile === null) {
        tile = world.get(0, 0);
      }

      return new UnitType(city, player, tile, ruleRegistry);
    },
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
        world = new World(generator, rulesRegistry);

      await world.build();

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
      transportRegistry,
      undefined,
      interactionRegistry
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

  it('should be able to `Attack` enemy `Unit` next to it', async (): Promise<void> => {
    const unit = await getUnit(),
      enemyUnit = await getUnit(getPlayer(), unit.tile().getNeighbour('e'));

    const actions = unit.actions(enemyUnit.tile());

    expect(actions.some((action) => action instanceof Attack)).to.true;

    unitRegistry.unregister(unit, enemyUnit);
  });

  it('should not be able to `Attack` enemy `Unit` next to it, if there is an `active` `Peace` `Declaration`', async (): Promise<void> => {
    const unit = await getUnit(),
      enemyUnit = await getUnit(getPlayer(), unit.tile().getNeighbour('e')),
      actions = unit.actions(enemyUnit.tile());

    expect(actions.some((action) => action instanceof Attack)).to.true;
    expect(actions.some((action) => action instanceof SneakAttack)).to.false;

    const peaceTreaty = new Peace(
      unit.player(),
      enemyUnit.player(),
      ruleRegistry
    );

    interactionRegistry.register(peaceTreaty);

    const peaceActions = unit.actions(enemyUnit.tile());

    expect(peaceActions.some((action) => action instanceof SneakAttack)).to
      .true;
    expect(peaceActions.some((action) => action.constructor === Attack)).to
      .false;

    peaceTreaty.expire();

    const postPeaceActions = unit.actions(enemyUnit.tile());

    expect(postPeaceActions.some((action) => action instanceof Attack)).to.true;
    expect(postPeaceActions.some((action) => action instanceof SneakAttack)).to
      .false;

    const secondPeaceTreaty = new Peace(
      unit.player(),
      enemyUnit.player(),
      ruleRegistry
    );

    interactionRegistry.register(secondPeaceTreaty);

    const secondPeaceActions = unit.actions(enemyUnit.tile());

    expect(secondPeaceActions.some((action) => action instanceof SneakAttack))
      .to.true;
    expect(secondPeaceActions.some((action) => action.constructor === Attack))
      .to.false;

    unitRegistry.unregister(unit, enemyUnit);
    interactionRegistry.unregister(peaceTreaty, secondPeaceTreaty);
  });

  it('should be able to `Fortify`', async (): Promise<void> => {
    const unit = await getUnit();

    expect(unit.actions().some((action) => action instanceof Fortify)).to.true;

    unitRegistry.unregister(unit);
  });

  it('should not be able to move adjacent to an enemy `Unit`', async (): Promise<void> => {
    const unit = await getUnit(),
      enemyUnit = await getUnit(getPlayer(), unit.tile().getNeighbour('e'));

    (
      [
        [unit.tile().getNeighbour('nw'), true],
        [unit.tile().getNeighbour('n'), false],
        [unit.tile().getNeighbour('ne'), false],
        [unit.tile().getNeighbour('w'), true],
        [unit.tile().getNeighbour('e'), false],
        [unit.tile().getNeighbour('sw'), true],
        [unit.tile().getNeighbour('s'), false],
        [unit.tile().getNeighbour('se'), false],
      ] as [Tile, boolean][]
    ).forEach(([destination, expectedResult], i) => {
      expect(
        unit.actions(destination).some((action) => action instanceof Move),
        `Moving from ${unit.tile().x()}, ${unit
          .tile()
          .y()} to ${destination.x()}, ${destination.y()} (${i}) should ${
          expectedResult ? 'succeed' : 'fail'
        }.`
      ).equal(expectedResult);
    });

    unitRegistry.unregister(unit, enemyUnit);
  });

  it('should be possible to capture an unprotected enemy `City`', async (): Promise<void> => {
    const unit = await getUnit(),
      city = new City(getPlayer(), unit.tile().getNeighbour('se'), '');

    cityRegistry.register(city);

    const [captureCity] = unit
      .actions(city.tile())
      .filter((action) => action instanceof CaptureCity);

    expect(captureCity).instanceof(CaptureCity);

    expect(city.player()).not.equal(unit.player());

    unit.action(captureCity, cityRegistry);

    expect(city.player()).equal(unit.player());

    cityRegistry.unregister(city);
    unitRegistry.unregister(unit);
  });

  it('should not be able to capture an unprotected enemy `City`, if there is an `active` `Peace` `Declaration`', async (): Promise<void> => {
    const unit = await getUnit(),
      city = new City(getPlayer(), unit.tile().getNeighbour('se'), '');

    cityRegistry.register(city);

    const actions = unit.actions(city.tile());

    expect(actions.some((action) => action instanceof CaptureCity)).to.true;
    expect(actions.some((action) => action instanceof SneakCaptureCity)).to
      .false;

    const peaceTreaty = new Peace(unit.player(), city.player(), ruleRegistry);

    interactionRegistry.register(peaceTreaty);

    const peaceActions = unit.actions(city.tile());

    expect(peaceActions.some((action) => action instanceof SneakCaptureCity)).to
      .true;
    expect(peaceActions.some((action) => action.constructor === CaptureCity)).to
      .false;

    peaceTreaty.expire();

    const postPeaceActions = unit.actions(city.tile());

    expect(postPeaceActions.some((action) => action instanceof CaptureCity)).to
      .true;
    expect(
      postPeaceActions.some((action) => action instanceof SneakCaptureCity)
    ).to.false;

    const secondPeaceTreaty = new Peace(
      unit.player(),
      city.player(),
      ruleRegistry
    );

    interactionRegistry.register(secondPeaceTreaty);

    const secondPeaceActions = unit.actions(city.tile());

    expect(
      secondPeaceActions.some((action) => action instanceof SneakCaptureCity)
    ).to.true;
    expect(
      secondPeaceActions.some((action) => action.constructor === CaptureCity)
    ).to.false;

    unitRegistry.unregister(unit);
    cityRegistry.unregister(city);
    interactionRegistry.unregister(peaceTreaty, secondPeaceTreaty);
  });

  it('should be possible to move into your own `City` or with another of your own `Unit` even if adjacency rules would normally block that', async (): Promise<void> => {
    const unit = await getUnit(),
      friendlyUnit = await getUnit(
        unit.player(),
        unit.tile().getNeighbour('ne')
      ),
      enemyUnit = await getUnit(getPlayer(), unit.tile().getNeighbour('e')),
      city = new City(unit.player(), unit.tile().getNeighbour('s'), '');

    cityRegistry.register(city);

    const cityActions = unit.actions(city.tile()),
      unitActions = unit.actions(friendlyUnit.tile());

    expect(cityActions).length(1);
    expect(cityActions[0]).instanceof(Move);
    expect(unitActions).length(1);
    expect(unitActions[0]).instanceof(Move);

    cityRegistry.unregister(city);
    unitRegistry.unregister(unit, friendlyUnit, enemyUnit);
  });

  it('should not be possible to capture a protected enemy `City`', async (): Promise<void> => {
    const unit = await getUnit(),
      city = new City(
        getPlayer(),
        unit.tile().getNeighbour('se'),
        '',
        ruleRegistry
      ),
      enemyUnit = await getUnit(city.player(), city.tile());

    cityRegistry.register(city);

    const [captureCity] = unit
      .actions(city.tile())
      .filter((action) => action instanceof CaptureCity);

    expect(captureCity).to.undefined;

    cityRegistry.unregister(city);
    unitRegistry.unregister(unit, enemyUnit);
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

          const unit = await getUnit(getPlayer(), world.get(4, 4), Settlers),
            [action] = unit
              .actions()
              .filter(
                (action: UnitAction): boolean => action instanceof ActionType
              );

          expect(action).to.instanceof(ActionType);

          unitRegistry.unregister(unit);
        });
      });

      terrainRegistry
        .filter((Terrain) => !validTerrains.includes(Terrain))
        .forEach((Terrain) => {
          it(`should not be possible for Settlers to ${ActionType.name} on ${Terrain.name}`, async (): Promise<void> => {
            const world = await generateFixedWorld({
                TerrainType: Terrain,
              }),
              unit = await getUnit(getPlayer(), world.get(4, 4), Settlers),
              [action] = unit
                .actions()
                .filter((action) => action instanceof ActionType);

            expect(action).to.undefined;

            unitRegistry.unregister(unit);
          });
        });
    }
  );

  [Desert, Grassland, Hills, Plains].forEach((Terrain) => {
    it(`should not be possible for Settlers to BuildIrrigation on ${Terrain.name} without access to water`, async (): Promise<void> => {
      const world = await generateFixedWorld({
          TerrainType: Terrain,
        }),
        unit = await getUnit(getPlayer(), world.get(4, 4), Settlers);

      expect(unit.actions().some((action) => action instanceof BuildIrrigation))
        .false;

      const neighbouringIrrigation = new Irrigation(
        unit.tile().getNeighbour('e')
      );

      tileImprovementRegistry.register(neighbouringIrrigation);

      expect(unit.actions().some((action) => action instanceof BuildIrrigation))
        .true;

      tileImprovementRegistry.unregister(neighbouringIrrigation);
      unitRegistry.unregister(unit);
    });
  });

  (
    [[BuildRoad, BridgeBuilding, River]] as [
      typeof UnitAction,
      typeof Advance,
      typeof Terrain
    ][]
  ).forEach(([Action, Advance, Terrain]) =>
    it(`should be possible for Settlers to ${Action.name} on ${Terrain.name} only after discovering ${Advance.name}`, async (): Promise<void> => {
      const world = await generateFixedWorld({
          TerrainType: Terrain,
        }),
        unit = await getUnit(getPlayer(), world.get(4, 4), Settlers),
        playerResearch = playerResearchRegistry.getByPlayer(unit.player());

      expect(unit.actions().some((action) => action instanceof Action)).false;

      playerResearch.complete().push(new BridgeBuilding());

      expect(unit.actions().some((action) => action instanceof Action)).true;

      unitRegistry.unregister(unit);
    })
  );

  (
    [[BuildRailroad, Grassland, [RailroadAdvance], [Road]]] as [
      typeof Action,
      typeof Terrain,
      typeof Advance[],
      typeof TileImprovement[]
    ][]
  ).forEach(
    ([
      ActionType,
      TerrainType,
      requiredAdvances,
      requiredExistingImprovements,
    ]) =>
      it(`should be possible to ${ActionType.name} on ${
        TerrainType.name
      } only when it contains ${requiredExistingImprovements
        .map((Improvement) => Improvement.name)
        .join(', ')}`, async (): Promise<void> => {
        const world = await generateFixedWorld({
            TerrainType,
          }),
          unit = await getUnit(getPlayer(), world.get(4, 4), Settlers),
          playerResearch = playerResearchRegistry.getByPlayer(unit.player());

        requiredAdvances.forEach((RequiredAdvance: typeof Advance) =>
          playerResearch.addAdvance(RequiredAdvance)
        );

        expect(unit.actions().some((action) => action instanceof ActionType))
          .false;

        const improvements = requiredExistingImprovements.map(
          (Improvement: typeof TileImprovement) => new Improvement(unit.tile())
        );

        tileImprovementRegistry.register(...improvements);

        expect(unit.actions().some((action) => action instanceof ActionType))
          .true;

        tileImprovementRegistry.unregister(...improvements);
        unitRegistry.unregister(unit);
      })
  );

  (
    [
      [Irrigation, Warrior, true],
      [Mine, Warrior, true],
      [Road, Warrior, true],
      [Railroad, Warrior, true],
      [Irrigation, Settlers, true],
      [Mine, Settlers, true],
      [Road, Settlers, true],
      [Railroad, Settlers, true],
      [Irrigation, Sail, false],
      [Mine, Sail, false],
      [Road, Sail, false],
      [Railroad, Sail, false],
      [Irrigation, Caravan, false],
      [Mine, Caravan, false],
      [Road, Caravan, false],
      [Railroad, Caravan, false],
      [Irrigation, Diplomat, false],
      [Mine, Diplomat, false],
      [Road, Diplomat, false],
      [Railroad, Diplomat, false],
    ] as [typeof TileImprovement, typeof Unit, boolean][]
  ).forEach(([Improvement, UnitType, expectedResult]) =>
    it(`should${expectedResult ? '' : ' not'} be possible for ${
      UnitType.name
    } to Pillage ${Improvement.name}`, async (): Promise<void> => {
      const unit = await getUnit(getPlayer(), null, UnitType);

      tileImprovementRegistry.register(new Improvement(unit.tile()));

      expect(unit.actions().some((action) => action instanceof Pillage));
    })
  );
});
