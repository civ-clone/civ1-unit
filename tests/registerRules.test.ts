import { Carrier, Fighter, Trireme, Warrior } from '../Units';
import Halted from '@civ-clone/base-unit-action-goto/Rules/Halted';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { Ocean } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { OBSOLESCENCE } from '../RuleSets';
import { obsoletedBy } from '../Requirements';
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

  it('should group the rules that make units obsolete as a set that can be switched off', async (): Promise<void> => {
    const { game } = await setUp(),
      ids = obsoletedBy.map((entry) => entry.id);

    expect(OBSOLESCENCE).to.equal('civ1-unit:obsolescence');
    expect(ids).to.have.length(13);
    expect(ids).to.include('civ1-unit:city/build/obsolete/Spearman');
    expect(game.ruleSets.get(OBSOLESCENCE)!.memberIds()).to.eql(ids);
    expect((): void => game.ruleSets.check()).not.to.throw();
    expect(game.ruleSets.state(OBSOLESCENCE)).to.equal('on');

    game.ruleSets.set(OBSOLESCENCE, false);

    // One line in a save for the whole of it, so a unit added later goes with the rest.
    expect(game.ruleSets.choices()).to.eql([
      { id: 'civ1-unit:obsolescence', value: false },
    ]);

    expect(ids.every((id) => !game.rules.getById(id)!.enabled())).true;
    // What a unit needs is not part of it.
    expect(
      game.rules
        .getById('civ1-unit:city/build/requires-advance/Musketman')!
        .enabled()
    ).true;

    game.ruleSets.set(OBSOLESCENCE, true);

    expect(ids.every((id) => game.rules.getById(id)!.enabled())).true;
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
  // Each game's own (civ-clone/web-renderer#873): a player's choice in one game doesn't reach another's rules.
  it('should act on the game`s own build preferences', async (): Promise<void> => {
    const { game, player, tile } = await setUp(),
      other = new Game();

    register(other);

    const warrior = new Warrior(null, player, tile, game.rules),
      cityBuild = {
        auto: (): boolean => false,
        city: () => ({ player: (): Player => player }),
      },
      id = 'civ1-unit:city/building-complete/repeat-military-unit',
      repeats = (inGame: Game): boolean =>
        inGame.rules.getById(id)!.validate(cityBuild, warrior);

    expect(repeats(game)).false;

    game.buildPreferences.set(player, { repeat: true });

    expect(repeats(game)).true;
    expect(repeats(other)).false;
  });
});
