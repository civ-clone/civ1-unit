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
    new Criterion(
      (unit: Unit, movementCost: number): boolean =>
        unit.moves().value() / movementCost >= randomNumberGenerator()
    ),
    new Effect((unit: Unit): boolean => {
      unit.moves().subtract(unit.moves());

      return true;
    })
  ),
];

export default getRules;
