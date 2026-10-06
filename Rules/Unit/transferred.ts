import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import { Fortified, Veteran } from '../../UnitImprovements';
import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
import Unit from '@civ-clone/core-unit/Unit';
import { turnsAloftKey } from '../Player/turnEnd';

export const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine,
  strategyNoteRegistry?: StrategyNoteRegistry
) => Transferred[] = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  engine: Engine = engineInstance,
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
): Transferred[] => [
  // v474.05 deletes a bribed or defecting unit and creates a new one for its new owner, so it arrives as a new unit
  //  would: not a veteran, not fortified, with no moves until its new owner's turn (Rome on 640K a Day, p273), and,
  //  an aircraft, with its fuel full. Otherwise a Bomber a turn out when it's bribed would be lost at the end of the
  //  briber's turn, before its new owner could move it.
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

      const turnsAloft = strategyNoteRegistry.getByKey(turnsAloftKey(unit));

      if (turnsAloft) {
        strategyNoteRegistry.unregister(turnsAloft);
      }

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
