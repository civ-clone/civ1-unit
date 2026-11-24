import { Warrior } from '../Units';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import Player from '@civ-clone/core-player/Player';
import Sleeping from '@civ-clone/base-unit-action-sleep/Rules/Sleeping';
import Stowed from '@civ-clone/core-unit-transport/Rules/Stowed';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import World from '@civ-clone/core-world/World';
import { createRng } from '@civ-clone/core-random/Rng';
import { expect } from 'chai';
import register from '../registerRules';

// A game built with its own registries, as the engine's tests are: a unit put to sleep looks for enemies among that
//  game's units, not core-unit's instance, so it wakes when one comes beside it (civ-clone/web-renderer#1110).
describe('sleep in a game of its own', (): void => {
  // Grassland in the two westernmost columns, the sea east of them.
  class MapGenerator extends FillGenerator {
    constructor() {
      super(5, 5, Grassland);
    }

    generate(): Promise<Terrain[]> {
      return Promise.resolve(
        new Array(25).fill(0).map((value, index): Terrain => {
          const [x] = this.indexToCoords(index);

          return x >= 2 ? new Ocean() : new Grassland();
        })
      );
    }
  }

  const named = (
      unit: Unit,
      name: string,
      to = unit.tile()
    ): UnitAction | undefined =>
      unit
        .actions(to)
        .find(
          (unitAction: UnitAction): boolean =>
            unitAction.constructor.name === name
        ),
    setUp = async () => {
      const game = new Game({ rng: createRng(1110) });

      register(game);

      const world = new World(new MapGenerator(), game.rules);

      await world.build();

      return {
        game,
        player: new Player(game.rules),
        enemy: new Player(game.rules),
        world,
      };
    };

  it('should wake a sleeping unit when an enemy comes beside it', async (): Promise<void> => {
    const { enemy, game, player, world } = await setUp(),
      warrior = new Warrior(
        null,
        player,
        world.get(0, 2),
        game.rules,
        game.transports
      );

    game.units.register(warrior);

    warrior.action(named(warrior, 'Sleep')!);

    const sleeping = warrior.busy()!;

    expect(sleeping).instanceof(Sleeping);
    expect(warrior.active()).false;

    // Nothing in sight yet: it sleeps on.
    expect(sleeping.validate()).false;

    game.units.register(
      new Warrior(null, enemy, world.get(1, 2), game.rules, game.transports)
    );

    expect(sleeping.validate()).true;

    sleeping.process();

    expect(warrior.busy()).null;
    expect(warrior.active()).true;
  });

  it('should wake a unit put to sleep by boarding when an enemy comes beside it', async (): Promise<void> => {
    const { enemy, game, player, world } = await setUp(),
      warrior = new Warrior(
        null,
        player,
        world.get(0, 2),
        game.rules,
        game.transports
      );

    game.units.register(warrior);

    const [stowed] = game.rules
      .get(Stowed)
      .filter(
        (rule: Stowed): boolean => rule.id() === 'civ1-unit:unit/stowed/sleep'
      );

    stowed.process(warrior);

    const sleeping = warrior.busy()!;

    expect(sleeping).instanceof(Sleeping);
    expect(sleeping.validate()).false;

    game.units.register(
      new Warrior(null, enemy, world.get(1, 2), game.rules, game.transports)
    );

    expect(sleeping.validate()).true;
  });
});
