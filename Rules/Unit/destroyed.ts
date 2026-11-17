import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import {
  UnitLossRegistry,
  instance as unitLossRegistryInstance,
} from '@civ-clone/core-unit/UnitLossRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  carriesCargo,
  countLoss,
  deactivate,
  destroyedByAnother,
  emitDestroyed,
  isAboard,
  leaveOwnTransport,
  loseCargo,
  notYetDestroyed,
  removeImprovements,
} from '@civ-clone/base-unit-lifecycle/lib/destroyed';
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  unitRegistry?: UnitRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry,
  engine?: Engine,
  transportRegistry?: TransportRegistry,
  unitLossRegistry?: UnitLossRegistry
) => Destroyed[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  engine: Engine = engineInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance,
  unitLossRegistry: UnitLossRegistry = unitLossRegistryInstance
): Destroyed[] => [
  new Destroyed(
    'civ1-unit:unit/destroyed/emit',
    // Once: a unit destroyed again, after its destruction or from inside it, is announced only the first time. Asked
    //  as the effect runs, not as a `Criterion`, because every criterion is checked before any effect: a unit whose
    //  loss defeats its player (`civ1-player`'s `unit/destroyed/defeat-when-no-cities`, earlier in the list) is
    //  destroyed again, and announced, by that defeat before this effect runs (civ-clone/web-renderer#1000).
    new Effect((unit: Unit, player: Player | null): void => {
      if (unit.destroyed()) {
        return;
      }

      emitDestroyed(engine)(unit, player);
    })
  ),
  new Destroyed(
    // A loss for the Military report, as Civ1 counts one: a unit another player destroyed, its cargo with it at sea.
    //  Disbanding, founding or joining a city, a spent Diplomat or Caravan, and a unit whose supporting city was
    //  captured are destroyed by no one, and a nuclear weapon spends itself, so none of those count. A transport lost
    //  at sea is counted by `lostAtSea` (civ-clone/web-renderer#405).
    'civ1-unit:unit/destroyed/count-loss',
    new Criterion(destroyedByAnother),
    // Once: a defeated stack's cargo goes down with its transport, and then comes up again in the stack. Asked again as
    //  the effect runs, as for `unit/destroyed/emit`, for a unit destroyed again from inside its own destruction.
    new Criterion(notYetDestroyed),
    new Effect((unit: Unit): void => {
      if (unit.destroyed()) {
        return;
      }

      countLoss(unitLossRegistry)(unit);
    })
  ),
  new Destroyed('civ1-unit:unit/destroyed/deactivate', new Effect(deactivate)),
  new Destroyed(
    'civ1-unit:unit/destroyed/remove-improvements',
    new Effect(removeImprovements(unitImprovementRegistry))
  ),
  new Destroyed(
    // Cargo goes down with a transport lost at sea, however it was lost. In a city, it stays in the city.
    'civ1-unit:unit/destroyed/lose-cargo',
    new Criterion(carriesCargo(transportRegistry)),
    new Effect(loseCargo(transportRegistry))
  ),
  new Destroyed(
    // Cargo destroyed on its own, or by the stack rule before its transport, is no longer aboard.
    'civ1-unit:unit/destroyed/leave-transport',
    new Criterion(isAboard(transportRegistry)),
    new Effect(leaveOwnTransport(transportRegistry))
  ),
];

export default getRules;
