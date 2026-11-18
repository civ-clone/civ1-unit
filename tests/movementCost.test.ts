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
import traits from '../Rules/Unit/traits';

describe('unit:movementCost', (): void => {
  const ruleRegistry = new RuleRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    player = new Player(ruleRegistry);

  ruleRegistry.register(
    // The Civ1 unit traits, which the rules below ask units about.
    ...traits(),
    ...movementCost(tileImprovementRegistry),
    ...moved(),
    ...validateMove()
  );

  it('should cost 0.33 per movement when travelling on roads', async (): Promise<void> => {
    const world = new World(new FillGenerator(5, 5, Grassland), ruleRegistry);

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

  it('should cost nothing when travelling on railroads', async (): Promise<void> => {
    const world = new World(new FillGenerator(5, 5, Grassland), ruleRegistry);

    await world.build();

    world.entries().forEach((tile: Tile) =>
      // A Railroad is built on a Road, as it is in a game.
      tileImprovementRegistry.register(
        new Road(tile, ruleRegistry),
        new Railroad(tile, ruleRegistry)
      )
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

  // v474.05's railroad (`CONTROL.C`, the move, civ-clone/web-renderer#1029): free from a square with a Railroad to one
  //  with a Road, so a train runs on into a city, which has no Railroad of its own, and off the end of the line.
  (
    [
      ['from a Railroad to a Road', [Road, Railroad], [Road], 0],
      ['from a Railroad to a Railroad', [Road, Railroad], [Road, Railroad], 0],
      ['from a Road to a Railroad', [Road], [Road, Railroad], 1 / 3],
      ['from a Road to a Road', [Road], [Road], 1 / 3],
      ['from a Railroad to nothing', [Road, Railroad], [], 1],
      // A Railroad is built on a Road, but a save or a rule set might part them: v474.05 needs a Road on both squares
      //  for a road or railroad move, so this is the terrain's cost.
      ['from a Railroad with no Road to a Road', [Railroad], [Road], 1],
    ] as [string, (typeof Road)[], (typeof Road)[], number][]
  ).forEach(([description, from, to, cost]): void =>
    it(`should cost ${cost.toFixed(
      2
    )} ${description}`, async (): Promise<void> => {
      const world = new World(new FillGenerator(5, 5, Grassland), ruleRegistry);

      await world.build();

      from.forEach((Improvement: typeof Road): void =>
        tileImprovementRegistry.register(
          new Improvement(world.get(1, 1), ruleRegistry)
        )
      );
      to.forEach((Improvement: typeof Road): void =>
        tileImprovementRegistry.register(
          new Improvement(world.get(2, 1), ruleRegistry)
        )
      );

      const unit = new Warrior(null, player, world.get(1, 1), ruleRegistry);

      expect(
        new Move(
          unit.tile(),
          world.get(2, 1),
          unit,
          ruleRegistry
        ).movementCost()
      ).to.approximately(cost, 0.0001);
    })
  );
});
