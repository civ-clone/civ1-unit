import { Settlers, Spearman, Warrior } from '../Units';
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
});
