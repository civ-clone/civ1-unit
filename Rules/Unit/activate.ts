import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Activate from '@civ-clone/core-unit/Rules/Activate';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import { Fortified } from '../../UnitImprovements';

export const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry
) => Activate[] = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance
): Activate[] => [
  new Activate(
    new Criterion((unit: Unit): boolean => unit.moves().value() > 0),
    new Effect((unit: Unit): void => unit.setActive())
  ),
  new Activate(
    new Criterion((unit: Unit): boolean => unit.busy() !== null),
    new Effect((unit: Unit): void => unit.setBusy())
  ),
  ...([Fortified] as [typeof UnitImprovement]).map(
    (UnitImprovementType): Activate =>
      new Activate(
        new Criterion((unit: Unit): boolean =>
          unitImprovementRegistry
            .getByUnit(unit)
            .some(
              (unitImprovement: UnitImprovement): boolean =>
                unitImprovement instanceof UnitImprovementType
            )
        ),
        new Effect((unit: Unit): void =>
          unitImprovementRegistry.unregister(
            ...unitImprovementRegistry
              .getByUnit(unit)
              .filter(
                (unitImprovement: UnitImprovement): boolean =>
                  unitImprovement instanceof UnitImprovementType
              )
          )
        )
      )
  ),
];

export default getRules;
