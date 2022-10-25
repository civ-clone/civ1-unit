import Effect from '@civ-clone/core-rule/Effect';
import Sleep from '@civ-clone/base-unit-action-sleep/Sleep';
import Stowed from '@civ-clone/core-unit-transport/Rules/Stowed';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules = (): Stowed[] => [
  new Stowed(
    new Effect((unit: Unit) =>
      unit.action(new Sleep(unit.tile(), unit.tile(), unit))
    )
  ),
];

export default getRules;
