import { GoTo, Move } from '../Actions';
import BasePathFinder from '@civ-clone/simple-world-path/BasePathFinder';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Engine from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Path from '@civ-clone/core-world-path/Path';
import { PathFinderRegistry } from '@civ-clone/core-world-path/PathFinderRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import StrategyNoteRegistry from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { Warrior } from '../Units';
import World from '@civ-clone/core-world/World';
import action from '../Rules/Unit/action';
import { expect } from 'chai';
import { generateKey } from '@civ-clone/base-unit-action-goto/GoTo';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import unitYield from '../Rules/Unit/yield';
import validateMove from '../Rules/Unit/validateMove';

describe('GoTo', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      engine = new Engine(),
      pathFinderRegistry = new PathFinderRegistry(),
      strategyNoteRegistry = new StrategyNoteRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      transportRegistry = new TransportRegistry(),
      unitRegistry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      world = new World(new FillGenerator(10, 10, Grassland), ruleRegistry),
      searches: Tile[][] = [];

    // Every route searched for, from where to where.
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
        undefined,
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

    const unit = new Warrior(null, player, world.get(0, 0), ruleRegistry),
      // The route a search of its own finds, to compare the GoTo's with.
      routeFrom = (from: Tile, to: Tile): Tile[] =>
        new BasePathFinder(
          unit,
          from,
          to,
          ruleRegistry,
          cityRegistry,
          unitRegistry
        )
          .generate()
          .entries();

    unitRegistry.register(unit);
    unit.moves().set(unit.movement());

    return {
      engine,
      player,
      routeFrom,
      ruleRegistry,
      searches,
      strategyNoteRegistry,
      unit,
      unitRegistry,
      world,
    };
  };

  const goToFor = (unit: Unit, to: Tile): UnitAction =>
    unit.actions(to).find((action) => action instanceof GoTo)!;

  // Objects are compared with `===` and `.true`, not `.equal`: a failing `.equal` on a `Tile` or `Unit` makes mocha
  // diff the whole object graph, which runs out of memory.

  it('should follow the route it was offered for, without searching for it again', async (): Promise<void> => {
    const { routeFrom, searches, strategyNoteRegistry, unit, world } =
        await setUp(),
      to = world.get(6, 4),
      route = routeFrom(unit.tile(), to),
      goTo = goToFor(unit, to);

    expect(searches.length).equal(1);

    goTo.perform();

    expect(searches.length).equal(1);
    expect(unit.tile() === route[1]).true;

    const remaining = strategyNoteRegistry
      .getByKey<Tile[]>(generateKey(unit))!
      .value();

    expect(remaining.length).equal(route.length - 2);
    expect(remaining.every((tile, index) => tile === route[index + 2])).true;
  });

  it('should search again when it is performed from somewhere else', async (): Promise<void> => {
    const { routeFrom, searches, strategyNoteRegistry, unit, world } =
        await setUp(),
      to = world.get(6, 4),
      goTo = goToFor(unit, to);

    unit
      .actions(world.get(0, 1))
      .find((action) => action instanceof Move)!
      .perform();
    unit.moves().set(unit.movement());

    const route = routeFrom(unit.tile(), to);

    goTo.perform();

    expect(searches.length).equal(2);
    expect(searches[1][0] === world.get(0, 1)).true;
    expect(unit.tile() === route[1]).true;
    expect(
      strategyNoteRegistry
        .getByKey<Tile[]>(generateKey(unit))!
        .value()
        .every((tile, index) => tile === route[index + 2])
    ).true;
  });

  it('should search once for each time its availability is asked for', async (): Promise<void> => {
    const { searches, unit, world } = await setUp(),
      to = world.get(6, 4);

    goToFor(unit, to);
    goToFor(unit, to).perform();

    expect(searches.length).equal(2);
  });

  it('should search again when a unit has moved onto its route since it was offered', async (): Promise<void> => {
    const {
        player,
        routeFrom,
        ruleRegistry,
        searches,
        strategyNoteRegistry,
        unit,
        unitRegistry,
        world,
      } = await setUp(),
      to = world.get(6, 4),
      oldRoute = routeFrom(unit.tile(), to),
      // An intermediate tile, beyond the first step, so the GoTo's own unit doesn't move.
      blocked = oldRoute[3],
      beside = blocked
        .getNeighbours()
        .find(
          (tile: Tile): boolean =>
            !oldRoute.includes(tile) && tile !== unit.tile()
        )!,
      other = new Warrior(null, new Player(ruleRegistry), beside, ruleRegistry),
      goTo = goToFor(unit, to);

    unitRegistry.register(other);
    other.moves().set(other.movement());

    expect(searches.length).equal(1);

    other
      .actions(blocked)
      .find((action) => action instanceof Move)!
      .perform();

    expect(other.tile() === blocked).true;
    expect(unit.tile() === world.get(0, 0)).true;

    // What a fresh search finds now, with `blocked` occupied.
    const newRoute = routeFrom(unit.tile(), to);

    expect(newRoute.includes(blocked)).false;

    searches.length = 0;

    goTo.perform();

    expect(searches.length).equal(1);
    expect(unit.tile() === newRoute[1]).true;

    const remaining = strategyNoteRegistry
      .getByKey<Tile[]>(generateKey(unit))!
      .value();

    expect(remaining.includes(blocked)).false;
    expect(remaining.every((tile, index) => tile === newRoute[index + 2])).true;
  });

  ['unit:created', 'unit:destroyed', 'unit:moved', 'unit:transferred'].forEach(
    (event: string): void => {
      it(`should search again when ${event} has been announced since it was offered`, async (): Promise<void> => {
        const { engine, searches, unit, world } = await setUp(),
          goTo = goToFor(unit, world.get(6, 4));

        engine.emit(event, unit);
        goTo.perform();

        expect(searches.length).equal(2);
      });
    }
  );

  it('should not be offered next to the unit, without a search', async (): Promise<void> => {
    const { searches, unit, world } = await setUp();

    expect(
      unit.actions(world.get(1, 1)).some((action) => action instanceof GoTo)
    ).false;
    expect(searches.length).equal(0);
  });
});
