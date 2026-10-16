import { GoTo, RailroadTo, RoadTo } from '../Actions';
import { Settlers, Warrior } from '../Units';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import BasePathFinder from '@civ-clone/simple-world-path/BasePathFinder';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Engine from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Path from '@civ-clone/core-world-path/Path';
import { PathFinderRegistry } from '@civ-clone/core-world-path/PathFinderRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import { Railroad as RailroadAdvance } from '@civ-clone/library-science/Advances';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import StrategyNoteRegistry from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import action from '../Rules/Unit/action';
import routeOrders from '../AdditionalData/routeOrders';
import { expect } from 'chai';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import unitYield from '../Rules/Unit/yield';
import validateMove from '../Rules/Unit/validateMove';

describe('RoadTo and RailroadTo', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      engine = new Engine(),
      pathFinderRegistry = new PathFinderRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      strategyNoteRegistry = new StrategyNoteRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      transportRegistry = new TransportRegistry(),
      unitRegistry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      world = new World(new FillGenerator(10, 10, Grassland), ruleRegistry),
      searches: Tile[][] = [];

    // Every route searched for.
    class CountingPathFinder extends BasePathFinder {
      constructor(unit: Unit, start: Tile, end: Tile) {
        super(unit, start, end, ruleRegistry, cityRegistry, unitRegistry);
      }

      generate(): Path {
        searches.push([this.start(), this.end()]);

        return super.generate();
      }
    }

    pathFinderRegistry.register(CountingPathFinder);
    playerResearchRegistry.register(
      new PlayerResearch(player, new AdvanceRegistry(), ruleRegistry)
    );

    ruleRegistry.register(
      ...action(
        undefined,
        cityRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        undefined,
        unitRegistry,
        undefined,
        transportRegistry,
        undefined,
        undefined,
        undefined,
        pathFinderRegistry,
        strategyNoteRegistry,
        undefined,
        undefined,
        undefined,
        undefined,
        playerResearchRegistry,
        undefined,
        undefined,
        engine
      ),
      ...moved(transportRegistry, ruleRegistry, undefined, engine),
      ...movementCost(tileImprovementRegistry, transportRegistry),
      ...unitYield(
        new UnitImprovementRegistry(),
        ruleRegistry,
        transportRegistry
      ),
      ...validateMove((): number => 1)
    );

    await world.build();

    const add = <T extends Unit>(UnitType: new (...args: any[]) => T): T => {
      const unit = new UnitType(null, player, world.get(0, 0), ruleRegistry);

      unitRegistry.register(unit);
      unit.moves().set(unit.movement());

      return unit;
    };

    return { add, player, playerResearchRegistry, searches, world };
  };

  const names = (unit: Unit, to: Tile): string[] =>
    unit
      .actions(to)
      .filter(
        (action) =>
          action instanceof GoTo ||
          action instanceof RoadTo ||
          action instanceof RailroadTo
      )
      .map((action) => action.constructor.name);

  it('should offer a worker Road to a distant square, finding the route once with GoTo', async (): Promise<void> => {
    const { add, searches, world } = await setUp(),
      settlers = add(Settlers);

    expect(names(settlers, world.get(6, 4))).to.deep.equal(['GoTo', 'RoadTo']);
    expect(searches.length).equal(1);
  });

  it('should not offer it next to the worker, or to a unit that is not a worker', async (): Promise<void> => {
    const { add, world } = await setUp();

    expect(names(add(Settlers), world.get(1, 1))).to.deep.equal([]);
    expect(names(add(Warrior), world.get(6, 4))).to.deep.equal(['GoTo']);
  });

  it('should offer Railroad to once the player knows Railroad', async (): Promise<void> => {
    const { add, player, playerResearchRegistry, world } = await setUp(),
      settlers = add(Settlers);

    playerResearchRegistry.getByPlayer(player).addAdvance(RailroadAdvance);

    expect(names(settlers, world.get(6, 4))).to.deep.equal([
      'GoTo',
      'RoadTo',
      'RailroadTo',
    ]);
  });

  it('should tell a renderer which route orders a unit may be given', async (): Promise<void> => {
    const { add, player, playerResearchRegistry } = await setUp(),
      [data] = routeOrders(playerResearchRegistry),
      settlers = add(Settlers),
      warrior = add(Warrior);

    expect(data.data(settlers)).to.deep.equal(['RoadTo']);
    expect(data.data(warrior)).to.deep.equal([]);

    playerResearchRegistry.getByPlayer(player).addAdvance(RailroadAdvance);

    expect(data.data(settlers)).to.deep.equal(['RoadTo', 'RailroadTo']);
  });
});
