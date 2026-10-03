import { Carrier, Fighter, Trireme, Warrior } from '../Units';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Move } from '../Actions';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import canStow from '../Rules/Unit/canStow';
import { expect } from 'chai';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import { sleeping } from '@civ-clone/base-unit-action-sleep/Sleep';
import stowed from '../Rules/Unit/stowed';
import unitYield from '../Rules/Unit/yield';
import validateMove from '../Rules/Unit/validateMove';

// A transport that moves onto its player's units picks some of them up (civ-clone/web-renderer#263).
describe('pickup', (): void => {
  const setUp = async (TerrainType: typeof Terrain = Ocean) => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      transportRegistry = new TransportRegistry(),
      unitRegistry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      enemy = new Player(ruleRegistry),
      world = new World(new FillGenerator(5, 5, TerrainType), ruleRegistry);

    ruleRegistry.register(
      ...canStow(),
      ...moved(
        transportRegistry,
        ruleRegistry,
        (): number => 1,
        undefined,
        cityRegistry,
        undefined,
        undefined,
        unitRegistry
      ),
      ...movementCost(new TileImprovementRegistry(), transportRegistry),
      ...stowed(),
      ...unitYield(
        new UnitImprovementRegistry(),
        ruleRegistry,
        transportRegistry
      ),
      ...validateMove((): number => 1)
    );

    await world.build();

    const create = <T extends Unit>(
        UnitType: new (...args: any[]) => T,
        x: number,
        owner: Player = player
      ): T => {
        const unit = new UnitType(
          null,
          owner,
          world.get(x, 2),
          ruleRegistry,
          transportRegistry
        );

        unitRegistry.register(unit);
        unit.moves().set(unit.movement());

        return unit;
      },
      sail = (transport: Unit, x: number): void => {
        expect(
          new Move(
            transport.tile(),
            world.get(x, 2),
            transport,
            ruleRegistry
          ).perform()
        ).true;
      },
      addCity = (x: number): City => {
        const city = new City(player, world.get(x, 2), '', ruleRegistry);

        cityRegistry.register(city);

        return city;
      };

    return {
      addCity,
      create,
      enemy,
      sail,
      transportRegistry,
      unitRegistry,
    };
  };

  it('should pick up an aircraft that a Carrier moves onto', async (): Promise<void> => {
    const { create, sail } = await setUp(),
      carrier = create(Carrier, 1),
      fighter = create(Fighter, 2);

    sail(carrier, 2);

    expect(carrier.cargo().includes(fighter)).true;
    expect(fighter.busy() instanceof Stowed).true;
  });

  it('should pick up no more aircraft than a Carrier can hold', async (): Promise<void> => {
    const { create, sail } = await setUp(),
      carrier = create(Carrier, 1),
      fighters = Array.from({ length: 9 }, () => create(Fighter, 2));

    sail(carrier, 2);

    expect(carrier.cargo().length).eq(carrier.capacity().value());
    expect(carrier.cargo().length < fighters.length).true;
  });

  it("should not pick up another player's aircraft, or a land unit", async (): Promise<void> => {
    const { create, enemy, sail } = await setUp(),
      carrier = create(Carrier, 1),
      trireme = create(Trireme, 1),
      fighter = create(Fighter, 2, enemy),
      warrior = create(Warrior, 2);

    sail(carrier, 2);
    sail(trireme, 2);

    expect(carrier.cargo().includes(fighter)).false;
    expect(carrier.cargo().includes(warrior)).false;
    // A Trireme only picks up land units that are sleeping in a city.
    expect(trireme.cargo().includes(warrior)).false;
  });

  it('should take aircraft it picked up along with it', async (): Promise<void> => {
    const { create, sail } = await setUp(),
      carrier = create(Carrier, 1),
      fighter = create(Fighter, 2);

    sail(carrier, 2);
    sail(carrier, 3);

    expect(fighter.tile() === carrier.tile()).true;
    expect(carrier.cargo().includes(fighter)).true;
  });

  it('should pick up the units sleeping in a city it sails into', async (): Promise<void> => {
    const { addCity, create, enemy, sail, unitRegistry } = await setUp(),
      trireme = create(Trireme, 1),
      sleeper = create(Warrior, 2),
      awake = create(Warrior, 2),
      enemyUnit = create(Warrior, 2, enemy);

    addCity(2);

    [sleeper, enemyUnit].forEach((unit: Unit): void =>
      unit.setBusy(sleeping(unit, unitRegistry))
    );

    sail(trireme, 2);

    expect(trireme.cargo().includes(sleeper)).true;
    expect(sleeper.busy() instanceof Stowed).true;
    expect(trireme.cargo().includes(awake)).false;
    expect(trireme.cargo().includes(enemyUnit)).false;

    sail(trireme, 3);

    expect(sleeper.tile() === trireme.tile()).true;
    expect(awake.tile() === trireme.tile()).false;
  });

  it('should not pick up a sleeping aircraft a Trireme can not carry', async (): Promise<void> => {
    const { addCity, create, sail, unitRegistry } = await setUp(),
      trireme = create(Trireme, 1),
      fighter = create(Fighter, 2);

    addCity(2);
    fighter.setBusy(sleeping(fighter, unitRegistry));

    sail(trireme, 2);

    expect(trireme.cargo().includes(fighter)).false;
  });

  it('should leave behind a unit that walks off a ship in a city', async (): Promise<void> => {
    const { addCity, create, sail, transportRegistry, unitRegistry } =
        await setUp(Grassland),
      trireme = create(Trireme, 1),
      warrior = create(Warrior, 2);

    addCity(2);
    warrior.setBusy(sleeping(warrior, unitRegistry));

    sail(trireme, 2);

    expect(trireme.cargo().includes(warrior)).true;

    sail(warrior, 3);

    expect(transportRegistry.hasUnit(warrior)).false;
    expect(warrior.busy()).null;

    sail(trireme, 1);

    expect(warrior.tile() === trireme.tile()).false;
  });
});
