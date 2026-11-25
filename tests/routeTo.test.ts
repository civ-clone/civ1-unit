import { GoTo, RailroadTo, RoadTo } from '../Actions';
import { Railroad, Road } from '@civ-clone/civ1-world/TileImprovements';
import buildRouteUnit, {
  BuildRouteNote,
  generateKey,
} from '@civ-clone/base-unit-action-build-route/lib/buildRoute';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import { Game } from '@civ-clone/core-game/Game';
import available from '@civ-clone/civ1-world/Rules/TileImprovement/available';
import built from '@civ-clone/civ1-world/Rules/TileImprovement/built';
import { createRng } from '@civ-clone/core-random/Rng';
import { instance as pendingEffectRegistryInstance } from '@civ-clone/core-pending-effect';
import register from '../registerRules';
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
import RuleRegistry, {
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
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
import traits from '../Rules/Unit/traits';

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
      // The Civ1 unit traits, which the rules below ask units about.
      ...traits(),
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

// v474.05 refuses a Railroad on a city's square (civ-clone/web-renderer#1029), so a Railroad to through one of the
//  player's cities builds on each side of it and walks on through it.
describe('RailroadTo through a city', (): void => {
  it('should build a Railroad on each square of the way but the city', async (): Promise<void> => {
    const game = new Game({ rng: createRng(1029) });

    register(game);

    // Which tile improvements can be built where, as civ1-world registers them in a game.
    game.rules.register(
      ...available(game.playerResearch, game.tileImprovements)
    );
    game.pathFinders.register(
      class extends BasePathFinder {
        constructor(unit: Unit, start: Tile, end: Tile) {
          super(unit, start, end, game.rules, game.cities, game.units);
        }
      }
    );

    const world = new World(new FillGenerator(10, 10, Grassland), game.rules);

    await world.build();

    const player = new Player(game.rules),
      research = new PlayerResearch(player, new AdvanceRegistry(), game.rules),
      squares = [1, 2, 3, 4].map((x: number): Tile => world.get(x, 3)),
      [start, cityTile, , end] = squares;

    research.addAdvance(RailroadAdvance);
    game.playerResearch.register(research);
    squares.forEach((tile: Tile): void =>
      game.tileImprovements.register(new Road(tile))
    );

    const city = new City(player, cityTile, 'Railway', game.rules);

    game.cities.register(city);
    game.cityGrowth.register(new CityGrowth(city, game.rules));

    const settlers = new Settlers(city, player, start, game.rules);

    game.units.register(settlers);
    settlers.moves().set(settlers.movement());

    const [railroadTo] = settlers
      .actions(end)
      .filter((action): boolean => action instanceof RailroadTo);

    expect(railroadTo).instanceOf(RailroadTo);

    railroadTo.perform();

    const note = (): BuildRouteNote | undefined =>
      game.strategyNotes
        .getByKey<BuildRouteNote>(generateKey(settlers))
        ?.value();

    // The way runs through the city.
    expect(note()!.path).to.include(cityTile);

    // civ1-world's `Built` rules, so a finished Railroad lands in this game's registry. Older
    //  `base-unit-action-build-railroad` builds it with the default rule registry, and newer with the registry the action
    //  was made with (this game's), so they go in both.
    const builtRules = built(game.tileImprovements, game.engine);

    ruleRegistryInstance.register(...builtRules);
    game.rules.register(...builtRules);

    try {
      for (let turn = 0; turn < 30 && note(); turn++) {
        game.turn.increment();
        settlers.moves().set(settlers.movement());

        const busy = settlers.busy();

        if (busy && busy.validate()) {
          busy.process();
        }

        buildRouteUnit(settlers, {
          pendingEffectRegistry: pendingEffectRegistryInstance,
          strategyNoteRegistry: game.strategyNotes,
        });
      }
    } finally {
      ruleRegistryInstance.unregister(...builtRules);
      game.rules.unregister(...builtRules);
    }

    const hasRailroad = (tile: Tile): boolean =>
      game.tileImprovements
        .getByTile(tile)
        .some((improvement) => improvement instanceof Railroad);

    expect(note()).undefined;
    expect(settlers.tile()).to.equal(end);
    expect(squares.map(hasRailroad)).to.deep.equal([true, false, true, true]);
  });
});
