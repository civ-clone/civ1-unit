import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import { Fortified, Veteran } from '../../UnitImprovements';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine
) => Transferred[] = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  engine: Engine = engineInstance
): Transferred[] => [
  // v474.05 deletes a bribed or defecting unit and creates a new one for its new owner, so it arrives as a new unit
  //  would: not a veteran, not fortified, and with no moves until its new owner's turn (Rome on 640K a Day, p273).
  new Transferred(
    'civ1-unit:unit/transferred/start-afresh',
    new Effect((unit: Unit): void => {
      unitImprovementRegistry
        .getByUnit(unit)
        .filter(
          (improvement) =>
            improvement instanceof Fortified || improvement instanceof Veteran
        )
        .forEach((improvement) =>
          unitImprovementRegistry.unregister(improvement)
        );

      unit.setBusy();
      unit.moves().set(0);
      unit.applyVisibility();
    })
  ),

  new Transferred(
    'civ1-unit:unit/transferred/emit',
    new Effect((unit: Unit, player: Player, previousPlayer: Player): void => {
      engine.emit('unit:transferred', unit, player, previousPlayer);
    })
  ),
];

export default getRules;
