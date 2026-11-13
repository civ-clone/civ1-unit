import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import {
  clearBusy,
  hasImprovement,
  hasMoves,
  isBusy,
  removeImprovement,
  setActive,
} from '@civ-clone/base-unit-lifecycle/lib/activate';
import Activate from '@civ-clone/core-unit/Rules/Activate';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import { Fortified } from '../../UnitImprovements';

export const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry
) => Activate[] = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance
): Activate[] => [
  new Activate(
    'civ1-unit:unit/activate/has-moves',
    new Criterion(hasMoves),
    new Effect(setActive)
  ),
  new Activate(
    'civ1-unit:unit/activate/clear-busy',
    new Criterion(isBusy),
    new Effect(clearBusy)
  ),
  ...([Fortified] as [typeof UnitImprovement]).map(
    (UnitImprovementType): Activate =>
      new Activate(
        `civ1-unit:unit/activate/remove-improvement/${UnitImprovementType.name}`,
        new Criterion(
          hasImprovement(unitImprovementRegistry, UnitImprovementType)
        ),
        new Effect(
          removeImprovement(unitImprovementRegistry, UnitImprovementType)
        )
      )
  ),
];

export default getRules;
