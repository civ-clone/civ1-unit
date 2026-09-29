import { Carrier, Fighter, Trireme, Warrior } from '../Units';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import { Disband } from '../Actions';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
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
import defeated from '../Rules/Unit/defeated';
import destroyed from '../Rules/Unit/destroyed';
import { expect } from 'chai';
import lostAtSea from '../Rules/Unit/lostAtSea';
import unitYield from '../Rules/Unit/yield';

describe('cargo', (): void => {
  const setUp = async (TerrainType: typeof Terrain = Ocean) => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      transportRegistry = new TransportRegistry(),
      unitImprovementRegistry = new UnitImprovementRegistry(),
      unitRegistry = new UnitRegistry(),
      engine = new Engine(),
      player = new Player(ruleRegistry),
      enemy = new Player(ruleRegistry),
      world = new World(new FillGenerator(5, 5, TerrainType), ruleRegistry),
      destroyedCount = new Map<Unit, number>();

    ruleRegistry.register(
      ...canStow(),
      ...defeated(
        cityRegistry,
        ruleRegistry,
        new TileImprovementRegistry(),
        unitRegistry,
        engine
      ),
      ...destroyed(
        unitRegistry,
        unitImprovementRegistry,
        engine,
        transportRegistry
      ),
      ...lostAtSea(engine),
      ...unitYield(unitImprovementRegistry, ruleRegistry, transportRegistry),
      new Destroyed(
        new Effect((unit: Unit): void => {
          destroyedCount.set(unit, (destroyedCount.get(unit) ?? 0) + 1);
        })
      )
    );

    await world.build();

    const tile = world.get(2, 2),
      stowAboard = (transport: ITransport, ...cargo: Unit[]): void =>
        cargo.forEach((unit: Unit): void => {
          expect(transport.stow(unit)).true;

          // As `Embark` and `LandAircraft` leave it.
          unit.setBusy(new Stowed());
          unit.setActive(false);
        });

    return {
      cityRegistry,
      destroyedCount,
      enemy,
      player,
      ruleRegistry,
      stowAboard,
      tile,
      transportRegistry,
      unitRegistry,
    };
  };

  it('should lose the cargo of a Trireme lost at sea', async (): Promise<void> => {
    const {
        player,
        ruleRegistry,
        stowAboard,
        tile,
        transportRegistry,
        unitRegistry,
      } = await setUp(),
      trireme = new Trireme(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      warrior = new Warrior(null, player, tile, ruleRegistry);

    unitRegistry.register(trireme, warrior);
    stowAboard(trireme, warrior);

    ruleRegistry.process(LostAtSea, trireme as unknown as ITransport);

    expect(trireme.destroyed()).true;
    expect(warrior.destroyed()).true;
    expect(warrior.busy()).not.instanceof(Stowed);
    expect(transportRegistry.entries()).empty;
  });

  it('should lose the cargo of a transport disbanded at sea', async (): Promise<void> => {
    const {
        player,
        ruleRegistry,
        stowAboard,
        tile,
        transportRegistry,
        unitRegistry,
      } = await setUp(),
      trireme = new Trireme(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      cargo = [
        new Warrior(null, player, tile, ruleRegistry),
        new Warrior(null, player, tile, ruleRegistry),
      ];

    unitRegistry.register(trireme, ...cargo);
    stowAboard(trireme, ...cargo);

    new Disband(tile, tile, trireme, ruleRegistry).perform();

    expect(trireme.destroyed()).true;
    cargo.forEach((unit: Unit): void => {
      expect(unit.destroyed()).true;
    });
    expect(transportRegistry.entries()).empty;
  });

  it('should lose the aircraft on a Carrier sunk outside a city once each', async (): Promise<void> => {
    const {
        destroyedCount,
        enemy,
        player,
        ruleRegistry,
        stowAboard,
        tile,
        transportRegistry,
        unitRegistry,
      } = await setUp(),
      carrier = new Carrier(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      fighters = [
        new Fighter(null, player, tile, ruleRegistry),
        new Fighter(null, player, tile, ruleRegistry),
      ],
      attacker = new Fighter(null, enemy, tile, ruleRegistry);

    unitRegistry.register(carrier, ...fighters, attacker);
    stowAboard(carrier, ...fighters);

    ruleRegistry.process(Defeated, carrier, attacker);

    expect(carrier.destroyed()).true;
    fighters.forEach((fighter: Unit): void => {
      expect(fighter.destroyed()).true;
      expect(fighter.busy()).not.instanceof(Stowed);
      expect(destroyedCount.get(fighter)).equal(1);
    });
    expect(transportRegistry.entries()).empty;
  });

  it('should leave the cargo of a transport lost in a city in the city', async (): Promise<void> => {
    const {
        cityRegistry,
        player,
        ruleRegistry,
        stowAboard,
        tile,
        transportRegistry,
        unitRegistry,
      } = await setUp(Grassland),
      city = new City(player, tile, '', ruleRegistry),
      trireme = new Trireme(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      warrior = new Warrior(null, player, tile, ruleRegistry);

    cityRegistry.register(city);
    unitRegistry.register(trireme, warrior);
    stowAboard(trireme, warrior);

    trireme.destroy();

    expect(trireme.destroyed()).true;
    expect(warrior.destroyed()).false;
    expect(warrior.tile()).equal(tile);
    expect(warrior.busy()).not.instanceof(Stowed);
    expect(transportRegistry.hasUnit(warrior)).false;
    expect(transportRegistry.entries()).empty;
  });

  it('should take a destroyed unit off its transport', async (): Promise<void> => {
    const {
        player,
        ruleRegistry,
        stowAboard,
        tile,
        transportRegistry,
        unitRegistry,
      } = await setUp(),
      carrier = new Carrier(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      fighter = new Fighter(null, player, tile, ruleRegistry);

    unitRegistry.register(carrier, fighter);
    stowAboard(carrier, fighter);

    fighter.destroy();

    expect(carrier.destroyed()).false;
    expect(carrier.hasCargo()).false;
    expect(fighter.busy()).not.instanceof(Stowed);
    expect(transportRegistry.hasUnit(fighter)).false;
  });
});
