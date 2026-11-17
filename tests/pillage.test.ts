import {
  Irrigation,
  Mine,
  Pollution,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import { Pillage } from '../Actions';
import Player from '@civ-clone/core-player/Player';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import UnitAction from '@civ-clone/core-unit/Action';
import { Warrior } from '../Units';
import World from '@civ-clone/core-world/World';
import built from '@civ-clone/civ1-world/Rules/TileImprovement/built';
import { expect } from 'chai';
import pillaged from '@civ-clone/civ1-world/Rules/TileImprovement/pillaged';
import register from '../registerRules';

// civ-clone/web-renderer#1061: a pillage takes what v474.05 takes (`CONTROL.C`, the 'P' command): Irrigation or a Mine,
//  else the Railroad, else the Road, and never anything else on the square, such as Pollution.
describe('pillage', (): void => {
  // Builds `Improvements` on a square in the order given, so whatever comes first is first on the tile, then has a
  //  Warrior pillage it, and returns the names of what is left.
  const pillage = async (
    ...Improvements: (typeof TileImprovement)[]
  ): Promise<string[]> => {
    const game = new Game();

    register(game);
    game.rules.register(
      ...built(game.tileImprovements, game.engine),
      ...pillaged(game.tileImprovements, game.engine)
    );

    const world = new World(new FillGenerator(3, 3, Grassland), game.rules);

    await world.build();

    const tile = world.get(1, 1),
      warrior = new Warrior(null, new Player(game.rules), tile, game.rules);

    Improvements.forEach(
      (Improvement: typeof TileImprovement) => new Improvement(tile, game.rules)
    );

    const action = warrior
      .actions(tile)
      .find((action: UnitAction): boolean => action instanceof Pillage);

    expect(action, 'Pillage is offered').instanceOf(Pillage);

    Pillage.complete(action as Pillage);

    return game.tileImprovements
      .getByTile(tile)
      .map(
        (improvement: TileImprovement): string => improvement.constructor.name
      );
  };

  it('takes the Road from a polluted square, and leaves the Pollution', async (): Promise<void> => {
    expect(await pillage(Pollution, Road)).to.deep.equal(['Pollution']);
  });

  it('takes the Irrigation before the Road', async (): Promise<void> => {
    expect(await pillage(Road, Irrigation)).to.deep.equal(['Road']);
  });

  it('takes the Railroad before the Road', async (): Promise<void> => {
    expect(await pillage(Road, Railroad)).to.deep.equal(['Road']);
  });

  it('takes the Mine', async (): Promise<void> => {
    expect(await pillage(Mine)).to.deep.equal([]);
  });

  it('takes the Mine before the Railroad and the Road, from a polluted square', async (): Promise<void> => {
    expect(await pillage(Pollution, Road, Railroad, Mine)).to.deep.equal([
      'Pollution',
      'Road',
      'Railroad',
    ]);
  });
});
