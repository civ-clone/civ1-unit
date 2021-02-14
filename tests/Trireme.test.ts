import { Attack, Disembark, Embark, Move, Unload } from '../Actions';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import { Land, Water } from '@civ-clone/core-terrain/Types';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Loader from '@civ-clone/simple-world-generator/tests/lib/Loader';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import { Trireme } from '../Units';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { Warrior } from '../Units';
import World from '@civ-clone/core-world/World';
import action from '../Rules/Unit/action';
import created from '../Rules/Unit/created';
import { expect } from 'chai';
import destroyed from '../Rules/Unit/destroyed';
import lostAtSea from '../Rules/Unit/lostAtSea';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import unitYield from '../Rules/Unit/yield';
import validateMove from '../Rules/Unit/validateMove';

export const generateIslands: (ruleRegistry: RuleRegistry) => World = (
  ruleRegistry: RuleRegistry
): World => {
  const generator = new Loader(8, 8, [
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Grassland()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Grassland()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
      [new Ocean()],
    ]),
    world = new World(generator);

  world.build(ruleRegistry);

  for (let i = 0; i < 64; i++) {
    expect(world.get(i % 8, Math.floor(i / 8)).terrain()).to.instanceof(
      i === 9 || i === 54 ? Land : Water
    );
  }

  return world;
};

describe('Trireme', (): void => {
  const cityRegistry = new CityRegistry(),
    ruleRegistry = new RuleRegistry(),
    transportRegistry = new TransportRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    unitRegistry = new UnitRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry();

  ruleRegistry.register(
    ...action(
      cityRegistry,
      ruleRegistry,
      tileImprovementRegistry,
      unitImprovementRegistry,
      unitRegistry,
      transportRegistry
    ),
    ...created(unitRegistry),
    ...destroyed(unitRegistry),
    ...lostAtSea(),
    ...moved(transportRegistry, ruleRegistry),
    ...movementCost(tileImprovementRegistry, transportRegistry),
    ...unitYield(unitImprovementRegistry),
    ...validateMove()
  );

  it('should be able to move across water', (): void => {
    const world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      transport = new Trireme(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      to = world.get(3, 3);

    expect(tile).to.equal(world.get(2, 2));
    expect(
      transport
        .actions(to)
        .some((action: Action): boolean => action instanceof Move)
    ).to.true;

    unitRegistry.unregister(<Unit>transport);
  });

  it('should be possible to stow other units on it', (): void => {
    const world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      transport = new Trireme(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      unit = new Warrior(null, player, world.get(1, 1), ruleRegistry);

    unitRegistry.register(<Unit>transport, unit);

    const [embark] = unit
      .actions(tile)
      .filter((action: Action): boolean => action instanceof Embark);

    expect(embark).to.instanceof(Embark);

    embark.perform(unitRegistry);

    expect(transport.hasCargo()).to.true;
    expect(transport.cargo().includes(unit)).to.true;
    expect(transportRegistry.getByUnit(unit).transport()).to.equal(transport);

    unitRegistry.unregister(<Unit>transport, unit);
  });

  it('should be possible to transport units', (): void => {
    const world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      transport = new Trireme(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      unit = new Warrior(null, player, world.get(1, 1), ruleRegistry),
      to = world.get(2, 2);

    unitRegistry.register(<Unit>transport, unit);

    const [embark] = unit
      .actions(to)
      .filter((action: Action): boolean => action instanceof Embark);

    embark.perform(unitRegistry);

    expect(unit.tile()).to.equal(transport.tile());

    const [move1] = transport
      .actions(world.get(3, 3))
      .filter((action: Action): boolean => action instanceof Move);

    expect(move1).to.instanceof(Move);

    transport.action(move1);

    expect(transport.tile()).to.equal(world.get(3, 3));
    expect(unit.tile()).to.equal(world.get(3, 3));

    const [move2] = transport
      .actions(world.get(4, 4))
      .filter((action: Action): boolean => action instanceof Move);

    expect(move2).to.instanceof(Move);

    transport.action(move2);

    expect(transport.tile()).to.equal(world.get(4, 4));
    expect(unit.tile()).to.equal(world.get(4, 4));

    const [move3] = transport
      .actions(world.get(5, 5))
      .filter((action: Action): boolean => action instanceof Move);

    expect(move3).to.instanceof(Move);

    transport.action(move3);

    expect(transport.tile()).to.equal(world.get(5, 5));
    expect(unit.tile()).to.equal(world.get(5, 5));
    expect(transport.moves().value()).to.equal(0);

    transport.moves().add(transport.movement());

    const [unload] = transport
      .actions()
      .filter((action: Action): boolean => action instanceof Unload);

    expect(unload).to.instanceof(Unload);

    transport.action(unload);

    const [disembark] = unit.actions(world.get(6, 6));

    expect(disembark).to.instanceof(Disembark);

    unit.action(disembark);

    expect(unit.tile()).to.equal(world.get(6, 6));

    unitRegistry.unregister(<Unit>transport, unit);
  });

  it('should be possible to Attack a defended enemy city', (): void => {
    const world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      enemy = new Player(),
      transport = new Trireme(
        null,
        player,
        tile,
        ruleRegistry,
        transportRegistry
      ),
      city = new City(enemy, world.get(1, 1), '', ruleRegistry),
      unit = new Warrior(null, enemy, world.get(1, 1), ruleRegistry);

    cityRegistry.register(city);
    unitRegistry.register(<Unit>transport, unit);

    expect(
      transport
        .actions(city.tile())
        .some((action: Action): boolean => action instanceof Attack)
    ).to.true;

    cityRegistry.unregister(city);
    unitRegistry.unregister(<Unit>transport, unit);
  });

  it('should be possible to Attack an enemy unit', (): void => {
    const world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      enemy = new Player(),
      transport = new Trireme(null, player, tile, ruleRegistry),
      unit = new Warrior(null, enemy, world.get(1, 1), ruleRegistry);

    unitRegistry.register(<Unit>transport, unit);

    expect(
      transport
        .actions(unit.tile())
        .some((action: Action): boolean => action instanceof Attack)
    ).to.true;

    unitRegistry.unregister(<Unit>transport, unit);
  });

  it('should not be possible to Attack an undefended enemy city', (): void => {
    const world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      enemy = new Player(),
      transport = new Trireme(null, player, tile, ruleRegistry),
      city = new City(enemy, world.get(1, 1), '', ruleRegistry);

    cityRegistry.register(city);
    unitRegistry.register(<Unit>transport);

    expect(
      transport
        .actions(city.tile())
        .some((action: Action): boolean => action instanceof Attack)
    ).to.false;

    cityRegistry.unregister(city);
    unitRegistry.unregister(<Unit>transport);
  });

  it('should be possible to enter a friendly city', (): void => {
    const world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      transport = new Trireme(null, player, tile, ruleRegistry),
      city = new City(player, world.get(1, 1), '', ruleRegistry);

    cityRegistry.register(city);
    unitRegistry.register(<Unit>transport);

    expect(
      transport
        .actions(city.tile())
        .some((action: Action): boolean => action instanceof Move)
    ).to.true;

    cityRegistry.unregister(city);
    unitRegistry.unregister(<Unit>transport);
  });

  it('should be become lost at sea if ending turn away from the coast with a low number from the  random number generator', (): void => {
    const ruleRegistry = new RuleRegistry(),
      world = generateIslands(ruleRegistry),
      player = new Player(),
      unit = new Trireme(null, player, world.get(2, 2), ruleRegistry);

    ruleRegistry.register(
      ...action(
        cityRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        unitImprovementRegistry,
        unitRegistry,
        transportRegistry
      ),
      ...created(unitRegistry),
      ...destroyed(unitRegistry),
      ...lostAtSea(),
      ...moved(transportRegistry, ruleRegistry, (): number => 0),
      ...movementCost(tileImprovementRegistry, transportRegistry),
      ...unitYield(unitImprovementRegistry),
      ...validateMove()
    );

    unit.moves().set(2);

    const move1 = new Move(
      unit.tile(),
      world.get(3, 3),
      <Unit>unit,
      ruleRegistry
    );

    expect(move1.perform()).to.true;

    const move2 = new Move(
      unit.tile(),
      world.get(4, 4),
      <Unit>unit,
      ruleRegistry
    );

    expect(move2.perform()).to.true;

    expect(unit.destroyed()).to.true;
  });

  it('should not be become lost at sea if ending turn away from the coast with a high number from the  random number generator', (): void => {
    const ruleRegistry = new RuleRegistry(),
      world = generateIslands(ruleRegistry),
      tile = world.get(2, 2),
      player = new Player(),
      unit = new Trireme(null, player, tile, ruleRegistry);

    ruleRegistry.register(
      ...action(
        cityRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        unitImprovementRegistry,
        unitRegistry,
        transportRegistry
      ),
      ...created(unitRegistry),
      ...destroyed(unitRegistry),
      ...lostAtSea(),
      ...moved(transportRegistry, ruleRegistry, (): number => 1),
      ...movementCost(tileImprovementRegistry, transportRegistry),
      ...unitYield(unitImprovementRegistry),
      ...validateMove()
    );

    unit.moves().set(2);

    const move1 = new Move(
      unit.tile(),
      world.get(3, 3),
      <Unit>unit,
      ruleRegistry
    );

    expect(move1.perform()).to.true;

    const move2 = new Move(
      unit.tile(),
      world.get(4, 4),
      <Unit>unit,
      ruleRegistry
    );

    expect(move2.perform()).to.true;

    expect(unit.destroyed()).to.false;
  });
});
