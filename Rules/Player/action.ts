import { ActiveUnit, InactiveUnit } from '../../PlayerActions';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Action from '@civ-clone/core-player/Rules/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (unitRegistry?: UnitRegistry) => Action[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance
): Action[] => {
  return [
    new Action(
      new Criterion((player: Player): boolean =>
        unitRegistry
          .getByPlayer(player)
          .some((unit) => unit.active() && unit.moves().value())
      ),
      new Effect((player: Player): ActiveUnit[] =>
        unitRegistry
          .getByPlayer(player)
          .filter(
            (unit: Unit): boolean => unit.active() && unit.moves().value() > 0
          )
          .sort(
            (a: Unit, b: Unit): number =>
              (a.waiting() ? 1 : 0) - (b.waiting() ? 1 : 0)
          )
          .map((unit: Unit): ActiveUnit => new ActiveUnit(player, unit))
      )
    ),
    new Action(
      new Criterion((player: Player): boolean =>
        unitRegistry
          .getByPlayer(player)
          .some((unit) => !unit.active() || !unit.moves().value())
      ),
      new Effect((player: Player): InactiveUnit[] =>
        unitRegistry
          .getByPlayer(player)
          .filter((unit: Unit) => !unit.active() || unit.moves().value() === 0)
          .sort(
            (a: Unit, b: Unit): number =>
              (a.waiting() ? 1 : 0) - (b.waiting() ? 1 : 0)
          )
          .map((unit) => new InactiveUnit(player, unit))
      )
    ),
  ];
};

export default getRules;
