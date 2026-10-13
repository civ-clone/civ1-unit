import { Carrier, Fighter, Trireme, Warrior } from '../Units';
import Halted from '@civ-clone/base-unit-action-goto/Rules/Halted';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { Ocean } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import register from '../registerRules';

// Through `register(game)` rather than constructing the rules directly, so a rule that is defined but never registered
// fails here (civ-clone/web-renderer#246).
describe('registerRules', (): void => {
  const setUp = async () => {
    const game = new Game();

    register(game);

    const player = new Player(game.rules),
      world = new World(new FillGenerator(3, 3, Ocean), game.rules);

    await world.build();

    const tile = world.get(1, 1),
      carrier = new Carrier(null, player, tile, game.rules, game.transports),
      trireme = new Trireme(null, player, tile, game.rules, game.transports);

    return { carrier, game, player, tile, trireme };
  };

  it('should only let aircraft aboard a Carrier', async (): Promise<void> => {
    const { carrier, game, player, tile, trireme } = await setUp(),
      fighter = new Fighter(null, player, tile, game.rules);

    expect(trireme.canStow(fighter)).false;
    expect(carrier.canStow(fighter)).true;
  });

  it('should only let land units aboard a Trireme', async (): Promise<void> => {
    const { carrier, game, player, tile, trireme } = await setUp(),
      warrior = new Warrior(null, player, tile, game.rules);

    expect(carrier.canStow(warrior)).false;
    expect(trireme.canStow(warrior)).true;
  });

  it('should refuse a unit once a Trireme is full', async (): Promise<void> => {
    const { game, player, tile, trireme } = await setUp(),
      [first, second, third] = [1, 2, 3].map(
        () => new Warrior(null, player, tile, game.rules)
      );

    expect(trireme.stow(first)).true;
    expect(trireme.stow(second)).true;
    expect(trireme.stow(third)).false;
  });

  it('should tell the engine when a GoTo stops next to its destination', async (): Promise<void> => {
    const { game, player, tile } = await setUp(),
      warrior = new Warrior(null, player, tile, game.rules),
      emitted: unknown[][] = [];

    game.engine.on('unit:halted', (...args: unknown[]) => emitted.push(args));

    game.rules.process(Halted, warrior, tile);

    expect(emitted.length).to.equal(1);
    expect(emitted[0][0] === warrior && emitted[0][1] === tile).true;
  });
});
