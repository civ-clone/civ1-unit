import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import startAfresh from '../../lib/startAfresh';
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
import { START_AFRESH_RULE } from '../../RuleIds';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine,
  strategyNoteRegistry?: StrategyNoteRegistry
) => Transferred[] = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  engine: Engine = engineInstance,
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
): Transferred[] => [
  // v474.05 deletes a bribed or defecting unit and creates a new one for its new owner (civd `DIPLOMAT.C` `buy_u()`
  //  and the city revolt, `drop_u_stack()` then `create_unit()`, which sets `status = 0` and the type's fuel), so it
  //  arrives as a new unit would: not a veteran, not fortified, with no moves until its new owner's turn (Rome on 640K
  //  a Day, p273), and, an aircraft, with its fuel full. Otherwise a Bomber a turn out when it's bribed would be lost at
  //  the end of the briber's turn, before its new owner could move it. `civ1-enhanced` can have it keep its veteran
  //  status (civ-clone/web-renderer#960), at `lib/startAfresh`'s `START_AFRESH_PRIORITY`, before `emit` as this is.
  new Transferred(
    START_AFRESH_RULE,
    new Effect((unit: Unit): void =>
      startAfresh(unit, false, unitImprovementRegistry, strategyNoteRegistry)
    )
  ),

  new Transferred(
    'civ1-unit:unit/transferred/emit',
    new Effect((unit: Unit, player: Player, previousPlayer: Player): void => {
      engine.emit('unit:transferred', unit, player, previousPlayer);
    })
  ),
];

export default getRules;
