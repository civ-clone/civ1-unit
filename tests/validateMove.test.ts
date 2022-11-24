import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import { Move } from '../Actions';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { Warrior } from '../Units';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import movementCost from '../Rules/Unit/movementCost';
import validateMove from '../Rules/Unit/validateMove';

describe('unit:validateMove', async (): Promise<void> => {
  const world = new World(new FillGenerator(5, 5, Grassland)),
    tileImprovementRegistry = new TileImprovementRegistry(),
    player = new Player();

  await world.build();

  it('should allow moves when not enough moves remain when the generated number is low enough', (): void => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(
      ...movementCost(tileImprovementRegistry),
      ...validateMove((): number => 0)
    );

    const unit = new Warrior(null, player, world.get(0, 0), ruleRegistry),
      move = new Move(unit.tile(), world.get(0, 1), unit, ruleRegistry);

    unit.moves().set(0.1);

    expect(move.perform()).to.true;
  });

  it('should not allow moves when not enough moves remain when the generated number is high enough', (): void => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(
      ...movementCost(tileImprovementRegistry),
      ...validateMove((): number => 1)
    );

    const unit = new Warrior(null, player, world.get(0, 0), ruleRegistry),
      move = new Move(unit.tile(), world.get(0, 1), unit, ruleRegistry);

    unit.moves().set(0.4);

    expect(move.perform()).to.false;
  });
});
