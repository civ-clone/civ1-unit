import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
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
    new Criterion(
      (unit: Unit, movementCost: number): boolean =>
        unit.moves().value() >= movementCost
    ),
    new Effect((unit: Unit, movementCost: number): boolean => {
      unit.moves().subtract(movementCost);

      return true;
    })
  ),

  new ValidateMove(
    'civ1-unit:unit/validate-move/not-enough-moves',
    new Criterion(
      (unit: Unit, movementCost: number): boolean =>
        unit.moves().value() < movementCost
    ),
    new Effect((unit: Unit, movementCost: number): boolean => {
      const remainingMoves = unit.moves().value();

      unit.moves().set(0);

      return (
        remainingMoves >=
        movementCost * shortfallFactor * randomNumberGenerator()
      );
    })
  ),
];

export default getRules;
