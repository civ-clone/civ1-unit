import {
  hasMovesFor,
  shortOfMovesFor,
  spendMoves,
  spendShort,
} from '@civ-clone/base-unit-lifecycle/lib/validateMove';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import ValidateMove from '@civ-clone/core-unit/Rules/ValidateMove';
import { instance as rngInstance } from '@civ-clone/core-random';

/**
 * A unit short of the moves a step costs gets there when its remaining moves
 * reach this fraction of the cost, scaled by a random draw: always with at
 * least half the cost left, otherwise with a chance of `remaining / (cost × this)`.
 * `expectedMovementCost` prices routes from the same number.
 */
export const shortfallFactor = 0.5;

export const getRules: (
  randomNumberGenerator?: () => number
) => ValidateMove[] = (randomNumberGenerator: () => number = rngInstance) => [
  new ValidateMove(
    'civ1-unit:unit/validate-move/enough-moves',
    new Criterion(hasMovesFor),
    new Effect(spendMoves)
  ),

  new ValidateMove(
    'civ1-unit:unit/validate-move/not-enough-moves',
    new Criterion(shortOfMovesFor),
    new Effect(spendShort(shortfallFactor, randomNumberGenerator))
  ),
];

export default getRules;
