import { Settlers, Warrior } from '../Units';
import { CleanPollution } from '../Actions';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import { Pollution } from '@civ-clone/civ1-world/TileImprovements';
import World from '@civ-clone/core-world/World';
import built from '@civ-clone/civ1-world/Rules/TileImprovement/built';
import { expect } from 'chai';
import register from '../registerRules';

// civ-clone/web-renderer#32: Settlers clean up pollution, and only where there is some.
describe('pollution', (): void => {
  const setUp = async () => {
    const game = new Game();

    register(game);
    game.rules.register(...built(game.tileImprovements, game.engine));

    const world = new World(new FillGenerator(3, 3, Grassland), game.rules);

    await world.build();

    return { game, player: new Player(game.rules), tile: world.get(1, 1) };
  };

  it('is offered to Settlers on a polluted square', async (): Promise<void> => {
    const { game, player, tile } = await setUp(),
      settlers = new Settlers(null, player, tile, game.rules);

    expect(
      settlers.actions(tile).some((action) => action instanceof CleanPollution)
    ).to.false;

    new Pollution(tile, game.rules);

    expect(
      settlers.actions(tile).some((action) => action instanceof CleanPollution)
    ).to.true;
  });

  it('is not offered to other units', async (): Promise<void> => {
    const { game, player, tile } = await setUp(),
      warrior = new Warrior(null, player, tile, game.rules);

    new Pollution(tile, game.rules);

    expect(
      warrior.actions(tile).some((action) => action instanceof CleanPollution)
    ).to.false;
  });
});
