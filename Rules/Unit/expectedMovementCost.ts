import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import ExpectedMovementCost from '@civ-clone/core-world-path/Rules/ExpectedMovementCost';
import Unit from '@civ-clone/core-unit/Unit';
import { shortfallFactor } from './validateMove';

export const getRules: () => ExpectedMovementCost[] = () => [
  new ExpectedMovementCost(
    // With full moves `m`, a step costing `c > m` is entered with chance
    // `min(1, m / (c × shortfallFactor))` per turn (see `validateMove`), and each
    // attempt spends the turn. So on average it's worth
    // `max(m, c × shortfallFactor)`: one turn while success is certain,
    // `1 / chance` turns after that.
    'civ1-unit:unit/expected-movement-cost/shortfall',
    new Criterion(
      (unit: Unit, movementCost: number, movement: number): boolean =>
        movement > 0
    ),
    new Effect((unit: Unit, movementCost: number, movement: number): number =>
      Math.max(movement, movementCost * shortfallFactor)
    )
  ),
];

export default getRules;
