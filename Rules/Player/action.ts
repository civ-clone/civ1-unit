import { ActiveUnit, InactiveUnit } from '../../PlayerActions';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  activeUnits,
  hasActiveUnits,
  hasInactiveUnits,
  inactiveUnits,
} from '@civ-clone/base-unit-lifecycle/lib/playerAction';
import Action from '@civ-clone/core-player/Rules/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';

export const getRules: (unitRegistry?: UnitRegistry) => Action[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance
): Action[] => {
  return [
    new Action(
      'civ1-unit:player/action/active-units',
      new Criterion(hasActiveUnits(unitRegistry)),
      new Effect(activeUnits(unitRegistry, ActiveUnit))
    ),
    new Action(
      'civ1-unit:player/action/inactive-units',
      new Criterion(hasInactiveUnits(unitRegistry)),
      new Effect(inactiveUnits(unitRegistry, InactiveUnit))
    ),
  ];
};

export default getRules;
