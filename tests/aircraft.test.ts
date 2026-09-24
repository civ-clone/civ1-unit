import { Bomber, Fighter, Warrior } from '../Units';
import { Attack, Move } from '../Actions';
import turnEnd, { turnsAloftKey } from '../Rules/Player/turnEnd';
import unitYield from '../Rules/Unit/yield';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import StrategyNoteRegistry from '@civ-clone/core-strategy/StrategyNoteRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import TurnEnd from '@civ-clone/core-player/Rules/TurnEnd';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import defeated from '../Rules/Unit/defeated';
import destroyed from '../Rules/Unit/destroyed';
import { expect } from 'chai';
import lostAtSea from '../Rules/Unit/lostAtSea';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import validateMove from '../Rules/Unit/validateMove';

describe('aircraft', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      strategyNoteRegistry = new StrategyNoteRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      transportRegistry = new TransportRegistry(),
      unitRegistry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      world = new World(new FillGenerator(10, 10, Grassland), ruleRegistry);

    ruleRegistry.register(
      ...defeated(
        cityRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        unitRegistry
      ),
      ...destroyed(unitRegistry),
      ...lostAtSea(),
      ...moved(transportRegistry, ruleRegistry),
      ...movementCost(tileImprovementRegistry, transportRegistry),
      ...turnEnd(
        unitRegistry,
        cityRegistry,
        transportRegistry,
        strategyNoteRegistry,
        ruleRegistry
      ),
      ...unitYield(
        new UnitImprovementRegistry(),
        ruleRegistry,
        transportRegistry
      ),
      ...validateMove((): number => 1)
    );

    await world.build();

    const endTurn = (): void => {
      ruleRegistry.process(TurnEnd, player);

      unitRegistry
        .getByPlayer(player)
        .forEach((unit: Unit) => unit.moves().set(unit.movement()));
    };

    return {
      cityRegistry,
      endTurn,
      player,
      ruleRegistry,
      strategyNoteRegistry,
      unitRegistry,
      world,
    };
  };

  it('should let a Bomber stay out for one turn, but not two', async (): Promise<void> => {
    const { endTurn, player, ruleRegistry, unitRegistry, world } =
        await setUp(),
      bomber = new Bomber(null, player, world.get(5, 5), ruleRegistry);

    unitRegistry.register(bomber);

    endTurn();

    expect(bomber.destroyed()).false;

    endTurn();

    expect(bomber.destroyed()).true;
  });

  it("should crash a Bomber that doesn't move on its second turn", async (): Promise<void> => {
    const { endTurn, player, ruleRegistry, unitRegistry, world } =
        await setUp(),
      bomber = new Bomber(null, player, world.get(5, 5), ruleRegistry);

    unitRegistry.register(bomber);

    // Only part of its moves, so it never runs out.
    new Move(bomber.tile(), world.get(6, 5), bomber, ruleRegistry).perform();

    endTurn();

    expect(bomber.destroyed()).false;

    endTurn();

    expect(bomber.destroyed()).true;
  });

  it('should refuel a Bomber that lands in one of its cities', async (): Promise<void> => {
    const {
        cityRegistry,
        endTurn,
        player,
        ruleRegistry,
        strategyNoteRegistry,
        unitRegistry,
        world,
      } = await setUp(),
      city = new City(player, world.get(6, 5), '', ruleRegistry),
      bomber = new Bomber(null, player, world.get(5, 5), ruleRegistry);

    cityRegistry.register(city);
    unitRegistry.register(bomber);

    endTurn();

    expect(strategyNoteRegistry.getByKey(turnsAloftKey(bomber))?.value()).equal(
      1
    );

    // Landing with moves to spare still counts.
    new Move(bomber.tile(), city.tile(), bomber, ruleRegistry).perform();

    endTurn();

    expect(bomber.destroyed()).false;
    expect(strategyNoteRegistry.getByKey(turnsAloftKey(bomber))).undefined;

    new Move(bomber.tile(), world.get(5, 5), bomber, ruleRegistry).perform();

    endTurn();

    expect(bomber.destroyed()).false;
  });

  it("should crash a Fighter that ends its turn outside a city, even if it didn't use all its moves", async (): Promise<void> => {
    const { endTurn, player, ruleRegistry, unitRegistry, world } =
        await setUp(),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry);

    unitRegistry.register(fighter);

    endTurn();

    expect(fighter.destroyed()).true;
  });

  it('should end a Bomber’s turn after it attacks', async (): Promise<void> => {
    const { player, ruleRegistry, unitRegistry, world } = await setUp(),
      enemy = new Player(ruleRegistry),
      bomber = new Bomber(null, player, world.get(5, 5), ruleRegistry),
      target = new Warrior(null, enemy, world.get(6, 5), ruleRegistry);

    unitRegistry.register(bomber, target);

    bomber.moves().set(bomber.movement());

    new Attack(
      bomber.tile(),
      target.tile(),
      bomber,
      ruleRegistry,
      unitRegistry,
      (): number => 1
    ).perform();

    expect(target.destroyed()).true;
    expect(bomber.destroyed()).false;
    expect(bomber.moves().value()).equal(0);
    expect(bomber.active()).false;
  });

  it('should not end a Fighter’s turn after it attacks', async (): Promise<void> => {
    const { player, ruleRegistry, unitRegistry, world } = await setUp(),
      enemy = new Player(ruleRegistry),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry),
      target = new Warrior(null, enemy, world.get(6, 5), ruleRegistry);

    unitRegistry.register(fighter, target);

    fighter.moves().set(fighter.movement());

    new Attack(
      fighter.tile(),
      target.tile(),
      fighter,
      ruleRegistry,
      unitRegistry,
      (): number => 1
    ).perform();

    expect(fighter.moves().value()).greaterThan(0);
  });
});
