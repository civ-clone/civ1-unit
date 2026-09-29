import ExpectedMovementCost from '@civ-clone/core-world-path/Rules/ExpectedMovementCost';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import ValidateMove from '@civ-clone/core-unit/Rules/ValidateMove';
import { Warrior } from '../Units';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import expectedMovementCost from '../Rules/Unit/expectedMovementCost';
import validateMove from '../Rules/Unit/validateMove';

describe('unit:expectedMovementCost', async (): Promise<void> => {
  const world = new World(new FillGenerator(5, 5, Grassland)),
    player = new Player();

  await world.build();

  const expected = (movementCost: number, movement: number): number[] => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(...expectedMovementCost());

    return ruleRegistry.process(
      ExpectedMovementCost,
      new Warrior(null, player, world.get(0, 0), ruleRegistry),
      movementCost,
      movement
    );
  };

  it('should cost one turn while the move is certain to succeed', (): void => {
    expect(expected(2, 1)).to.deep.equal([1]);
    expect(expected(4, 2)).to.deep.equal([2]);
  });

  it('should cost the turns a move takes on average when it can fail', (): void => {
    // A Warrior into mountains: 2 in 3 attempts succeed, so 1.5 turns.
    expect(expected(3, 1)).to.deep.equal([1.5]);
    expect(expected(4, 1)).to.deep.equal([2]);
  });

  it('should give no answer for a unit that cannot move', (): void => {
    expect(expected(3, 0)).to.deep.equal([]);
  });

  it('should agree with how often validateMove lets the move happen', (): void => {
    // Every draw `validateMove` could make, evenly spaced: the share of them
    // that let the unit in is its chance per turn, and each attempt costs the
    // whole turn.
    const draws = 1000;

    [
      [3, 1],
      [4, 1],
      [5, 2],
      [3, 2],
    ].forEach(([movementCost, movement]) => {
      let draw = 0,
        successes = 0;

      const ruleRegistry = new RuleRegistry();

      ruleRegistry.register(
        ...validateMove((): number => (draw + 0.5) / draws)
      );

      const unit = new Warrior(null, player, world.get(0, 0), ruleRegistry);

      for (; draw < draws; draw++) {
        unit.moves().set(movement);

        const [valid] = ruleRegistry.process(ValidateMove, unit, movementCost);

        if (valid) {
          successes++;
        }
      }

      const [price] = expected(movementCost, movement);

      expect(price).to.be.closeTo(movement / (successes / draws), 0.01);
    });
  });
});
