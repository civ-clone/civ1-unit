import { Settlers, Spearman, Warrior } from '../Units';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Engine from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import defeated from '../Rules/Unit/defeated';
import destroyed from '../Rules/Unit/destroyed';
import { expect } from 'chai';

describe('defeated', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      unitRegistry = new UnitRegistry(),
      engine = new Engine(),
      player = new Player(ruleRegistry),
      enemy = new Player(ruleRegistry),
      world = new World(new FillGenerator(5, 5, Grassland), ruleRegistry);

    ruleRegistry.register(
      ...defeated(
        cityRegistry,
        ruleRegistry,
        new TileImprovementRegistry(),
        unitRegistry,
        engine
      ),
      ...destroyed(unitRegistry, new UnitImprovementRegistry(), engine)
    );

    await world.build();

    const tile = world.get(2, 2),
      stack = [Warrior, Spearman, Settlers].map(
        (UnitType): Unit => new UnitType(null, player, tile, ruleRegistry)
      ),
      attacker = new Warrior(null, enemy, world.get(2, 3), ruleRegistry);

    unitRegistry.register(...stack, attacker);

    return {
      attacker,
      cityRegistry,
      enemy,
      engine,
      player,
      ruleRegistry,
      stack,
      tile,
      unitRegistry,
    };
  };

  it('should destroy every unit in a stack outside a city when its defender is defeated', async (): Promise<void> => {
    const {
      attacker,
      ruleRegistry,
      stack: [defender, ...others],
    } = await setUp();

    ruleRegistry.process(Defeated, defender, attacker);

    expect(defender.destroyed()).true;
    others.forEach((unit: Unit): void => {
      expect(unit.destroyed()).true;
    });
  });

  it('should only destroy the defender of a stack in a city', async (): Promise<void> => {
    const {
      attacker,
      cityRegistry,
      player,
      ruleRegistry,
      stack: [defender, ...others],
      tile,
    } = await setUp();

    cityRegistry.register(new City(player, tile, '', ruleRegistry));

    ruleRegistry.process(Defeated, defender, attacker);

    expect(defender.destroyed()).true;
    others.forEach((unit: Unit): void => {
      expect(unit.destroyed()).false;
    });
  });

  it("should not destroy another player's units on the tile", async (): Promise<void> => {
    const {
        attacker,
        enemy,
        ruleRegistry,
        stack: [defender],
        tile,
        unitRegistry,
      } = await setUp(),
      // Not reachable in play, but the rule should still only take the defender's own units.
      bystander = new Warrior(null, enemy, tile, ruleRegistry);

    unitRegistry.register(bystander);

    ruleRegistry.process(Defeated, defender, attacker);

    expect(bystander.destroyed()).false;
  });

  it('should destroy the stack of a defender defeated by an attack', async (): Promise<void> => {
    const {
      attacker,
      ruleRegistry,
      stack: [defender, ...others],
      tile,
    } = await setUp();

    ruleRegistry.process(
      Defeated,
      defender,
      attacker,
      new Action(attacker.tile(), tile, attacker, ruleRegistry)
    );

    expect(defender.destroyed()).true;
    others.forEach((unit: Unit): void => {
      expect(unit.destroyed()).true;
    });
  });

  it('should only destroy an attacker that loses, not the stack it attacked from', async (): Promise<void> => {
    const {
      attacker: defender,
      ruleRegistry,
      stack: [attacker, ...others],
    } = await setUp();

    ruleRegistry.process(
      Defeated,
      attacker,
      defender,
      new Action(attacker.tile(), defender.tile(), attacker, ruleRegistry)
    );

    expect(attacker.destroyed()).true;
    others.forEach((unit: Unit): void => {
      expect(unit.destroyed()).false;
    });
  });

  it('should tell listeners which unit lost, which won, and the attack', async (): Promise<void> => {
    const {
        attacker,
        engine,
        ruleRegistry,
        stack: [defender],
        tile,
      } = await setUp(),
      action = new Action(attacker.tile(), tile, attacker, ruleRegistry),
      heard: [Unit, Unit, Action | undefined][] = [];

    engine.on('unit:defeated', (unit: Unit, by: Unit, attack?: Action) =>
      heard.push([unit, by, attack])
    );

    ruleRegistry.process(Defeated, defender, attacker, action);

    expect(heard.length).equal(1);
    expect(heard[0][0]).equal(defender);
    expect(heard[0][1]).equal(attacker);
    expect(heard[0][2]).equal(action);
  });

  it('should tell listeners the attack when the attacker is the one that lost', async (): Promise<void> => {
    const {
        attacker,
        engine,
        ruleRegistry,
        stack: [defender],
        tile,
      } = await setUp(),
      action = new Action(attacker.tile(), tile, attacker, ruleRegistry),
      heard: [Unit, Unit, Action | undefined][] = [];

    engine.on('unit:defeated', (unit: Unit, by: Unit, attack?: Action) =>
      heard.push([unit, by, attack])
    );

    ruleRegistry.process(Defeated, attacker, defender, action);

    expect(heard.length).equal(1);
    expect(heard[0][0]).equal(attacker);
    expect(heard[0][1]).equal(defender);
    expect(heard[0][2]).equal(action);
    expect(heard[0][2]!.unit()).equal(attacker);
  });
});
