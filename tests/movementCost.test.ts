import { Railroad, Road } from '@civ-clone/civ1-world/TileImprovements';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import { Move } from '../Actions';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { Warrior } from '../Units';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import validateMove from '../Rules/Unit/validateMove';

describe('unit:movementCost', (): void => {
  const ruleRegistry = new RuleRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    player = new Player(ruleRegistry);

  ruleRegistry.register(
    ...movementCost(tileImprovementRegistry),
    ...moved(),
    ...validateMove()
  );

  it('should cost 0.33 per movement when travelling on roads', async (): Promise<void> => {
    const world = new World(new FillGenerator(5, 5, Grassland));

    await world.build();

    world
      .entries()
      .forEach((tile: Tile) =>
        tileImprovementRegistry.register(new Road(tile, ruleRegistry))
      );

    const unit = new Warrior(null, player, world.get(0, 0), ruleRegistry);

    unit.moves().set(1);

    const move1 = new Move(unit.tile(), world.get(1, 1), unit, ruleRegistry);

    expect(move1.perform()).to.true;

    expect(unit.moves().value()).to.approximately(1 - 1 / 3, 0.0001);

    const move2 = new Move(unit.tile(), world.get(2, 2), unit, ruleRegistry);

    expect(move2.perform()).to.true;

    expect(unit.moves().value()).to.approximately(1 - 2 / 3, 0.0001);
  });

  it('should cost 0.33 per movement when travelling on railroads', async (): Promise<void> => {
    const world = new World(new FillGenerator(5, 5, Grassland));

    await world.build();

    world
      .entries()
      .forEach((tile: Tile) =>
        tileImprovementRegistry.register(new Railroad(tile, ruleRegistry))
      );

    const unit = new Warrior(null, player, world.get(0, 0), ruleRegistry);

    unit.moves().set(1);

    const move1 = new Move(unit.tile(), world.get(1, 1), unit, ruleRegistry);

    expect(move1.perform()).to.true;

    expect(unit.moves().value()).to.equal(1);

    const move2 = new Move(unit.tile(), world.get(2, 2), unit, ruleRegistry);

    expect(move2.perform()).to.true;

    expect(unit.moves().value()).to.equal(1);
  });
});
