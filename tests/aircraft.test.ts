import { Attack, LandAircraft, Move } from '../Actions';
import { Bomber, Carrier, Fighter, Warrior } from '../Units';
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
import action from '../Rules/Unit/action';
import canStow from '../Rules/Unit/canStow';
import defeated from '../Rules/Unit/defeated';
import destroyed from '../Rules/Unit/destroyed';
import { expect } from 'chai';
import lostAtSea from '../Rules/Unit/lostAtSea';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import stowed from '../Rules/Unit/stowed';
import Tile from '@civ-clone/core-world/Tile';
import UnitAction from '@civ-clone/core-unit/Action';
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
      ...action(
        undefined,
        cityRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        undefined,
        unitRegistry,
        undefined,
        transportRegistry
      ),
      ...canStow(),
      ...defeated(
        cityRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        unitRegistry
      ),
      ...destroyed(unitRegistry),
      ...stowed(),
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
      transportRegistry,
      unitRegistry,
      world,
    };
  };

  // Objects are compared with `===` and `.true`, not `.equal`: a failing `.equal` on a `Tile` or `Unit` makes mocha
  // diff the whole object graph, which runs out of memory.

  // The action a player gets by moving `unit` onto `to`: the first one, as the frontend and `SimpleAIClient` pick.
  const actionFor = (unit: Unit, to: Tile): UnitAction | undefined => {
    const [firstAction] = unit.actions(to);

    return firstAction;
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
  it('should land a Fighter on a friendly Carrier, stowing it and ending its turn', async (): Promise<void> => {
    const {
        endTurn,
        player,
        ruleRegistry,
        transportRegistry,
        unitRegistry,
        world,
      } = await setUp(),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry),
      carrier = new Carrier(
        null,
        player,
        world.get(6, 5),
        ruleRegistry,
        transportRegistry
      );

    unitRegistry.register(fighter, carrier);

    fighter.moves().set(fighter.movement());

    const landAircraft = actionFor(fighter, carrier.tile());

    expect(landAircraft).instanceof(LandAircraft);
    expect((landAircraft as LandAircraft).transport() === carrier).true;
    expect(
      fighter
        .actions(carrier.tile())
        .some((action) => action.constructor === Move)
    ).false;

    landAircraft!.perform();

    expect(fighter.tile() === carrier.tile()).true;
    expect(fighter.moves().value()).equal(0);
    expect(fighter.active()).false;
    expect(fighter.busy()).instanceof(Stowed);
    expect(transportRegistry.hasUnit(fighter)).true;
    expect(carrier.cargo().includes(fighter)).true;

    endTurn();

    expect(fighter.destroyed()).false;
  });

  it('should refuel a Bomber that lands on a Carrier on its second turn', async (): Promise<void> => {
    const {
        endTurn,
        player,
        ruleRegistry,
        strategyNoteRegistry,
        transportRegistry,
        unitRegistry,
        world,
      } = await setUp(),
      bomber = new Bomber(null, player, world.get(5, 5), ruleRegistry),
      carrier = new Carrier(
        null,
        player,
        world.get(6, 5),
        ruleRegistry,
        transportRegistry
      );

    unitRegistry.register(bomber, carrier);

    endTurn();

    expect(strategyNoteRegistry.getByKey(turnsAloftKey(bomber))?.value()).equal(
      1
    );

    const landAircraft = actionFor(bomber, carrier.tile());

    expect(landAircraft).instanceof(LandAircraft);

    landAircraft!.perform();

    expect(bomber.moves().value()).equal(0);

    endTurn();

    expect(bomber.destroyed()).false;
    expect(strategyNoteRegistry.getByKey(turnsAloftKey(bomber))).undefined;

    // It can stay aboard.
    endTurn();

    expect(bomber.destroyed()).false;
  });

  it('should land a Fighter in one of its cities, ending its turn', async (): Promise<void> => {
    const { cityRegistry, endTurn, player, ruleRegistry, unitRegistry, world } =
        await setUp(),
      city = new City(player, world.get(6, 5), '', ruleRegistry),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry);

    cityRegistry.register(city);
    unitRegistry.register(fighter);

    fighter.moves().set(fighter.movement());

    const landAircraft = actionFor(fighter, city.tile());

    expect(landAircraft).instanceof(LandAircraft);
    expect((landAircraft as LandAircraft).transport()).null;
    expect(
      fighter.actions(city.tile()).some((action) => action.constructor === Move)
    ).false;

    landAircraft!.perform();

    expect(fighter.tile() === city.tile()).true;
    expect(fighter.moves().value()).equal(0);
    expect(fighter.active()).false;

    endTurn();

    expect(fighter.destroyed()).false;
  });

  it('should land in the city, not on the Carrier, when a Carrier is in the city', async (): Promise<void> => {
    const {
        cityRegistry,
        player,
        ruleRegistry,
        transportRegistry,
        unitRegistry,
        world,
      } = await setUp(),
      city = new City(player, world.get(6, 5), '', ruleRegistry),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry),
      carrier = new Carrier(
        null,
        player,
        city.tile(),
        ruleRegistry,
        transportRegistry
      );

    cityRegistry.register(city);
    unitRegistry.register(fighter, carrier);

    fighter.moves().set(fighter.movement());

    const landAircraft = actionFor(fighter, city.tile());

    expect(landAircraft).instanceof(LandAircraft);
    expect((landAircraft as LandAircraft).transport()).null;
  });

  it('should not land on a full Carrier', async (): Promise<void> => {
    const { player, ruleRegistry, transportRegistry, unitRegistry, world } =
        await setUp(),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry),
      carrier = new Carrier(
        null,
        player,
        world.get(6, 5),
        ruleRegistry,
        transportRegistry
      ),
      aboard = new Array(8)
        .fill(0)
        .map(() => new Fighter(null, player, carrier.tile(), ruleRegistry));

    unitRegistry.register(fighter, carrier, ...aboard);
    aboard.forEach((unit) => expect(carrier.stow(unit)).true);

    fighter.moves().set(fighter.movement());

    expect(carrier.hasCapacity()).false;
    expect(
      fighter
        .actions(carrier.tile())
        .some((action) => action instanceof LandAircraft)
    ).false;
    expect(actionFor(fighter, carrier.tile())?.constructor === Move).true;
  });

  it('should not land on an enemy Carrier', async (): Promise<void> => {
    const { player, ruleRegistry, transportRegistry, unitRegistry, world } =
        await setUp(),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry),
      carrier = new Carrier(
        null,
        new Player(ruleRegistry),
        world.get(6, 5),
        ruleRegistry,
        transportRegistry
      );

    unitRegistry.register(fighter, carrier);

    fighter.moves().set(fighter.movement());

    expect(
      fighter
        .actions(carrier.tile())
        .some((action) => action instanceof LandAircraft)
    ).false;
  });

  it('should carry a landed aircraft with the Carrier, and let it take off next turn with full moves', async (): Promise<void> => {
    const {
        endTurn,
        player,
        ruleRegistry,
        transportRegistry,
        unitRegistry,
        world,
      } = await setUp(),
      fighter = new Fighter(null, player, world.get(5, 5), ruleRegistry),
      carrier = new Carrier(
        null,
        player,
        world.get(6, 5),
        ruleRegistry,
        transportRegistry
      );

    unitRegistry.register(fighter, carrier);

    fighter.moves().set(fighter.movement());
    carrier.moves().set(carrier.movement());

    actionFor(fighter, carrier.tile())!.perform();

    expect(fighter.moves().value()).equal(0);

    new Move(carrier.tile(), world.get(7, 5), carrier, ruleRegistry).perform();

    expect(carrier.tile() === world.get(7, 5)).true;
    expect(fighter.tile() === carrier.tile()).true;
    expect(transportRegistry.hasUnit(fighter)).true;

    endTurn();

    expect(fighter.destroyed()).false;
    expect(fighter.moves().value()).equal(fighter.movement().value());

    const takeOff = actionFor(fighter, world.get(8, 5));

    expect(takeOff?.constructor === Move).true;
    expect(
      fighter.actions(world.get(8, 5)).map((action) => action.constructor.name)
    ).not.include('Disembark');

    takeOff!.perform();

    expect(fighter.tile() === world.get(8, 5)).true;
    expect(fighter.moves().value()).equal(fighter.movement().value() - 1);
    expect(transportRegistry.hasUnit(fighter)).false;
    expect(carrier.cargo().includes(fighter)).false;
    expect(fighter.busy()).null;

    // Airborne again, so the fuel check applies.
    endTurn();

    expect(fighter.destroyed()).true;
  });
});
