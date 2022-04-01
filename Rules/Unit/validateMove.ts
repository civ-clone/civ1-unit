import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
import ValidateMove from '@civ-clone/core-unit/Rules/ValidateMove';

export const getRules: (
  randomNumberGenerator?: () => number
) => ValidateMove[] = (
  randomNumberGenerator: () => number = (): number => Math.random()
) => [
  new ValidateMove(
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
    new Criterion(
      (unit: Unit, movementCost: number): boolean =>
        unit.moves().value() < movementCost
    ),
    new Effect((unit: Unit, movementCost: number): boolean => {
      const remainingMoves = unit.moves().value();

      unit.moves().set(0);

      return remainingMoves >= movementCost * 0.5 * randomNumberGenerator();
    })
  ),
];

export default getRules;
