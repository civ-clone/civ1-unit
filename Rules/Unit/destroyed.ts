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
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import Player from '@civ-clone/core-player/Player';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import TransportManifest from '@civ-clone/core-unit-transport/TransportManifest';
import Unit from '@civ-clone/core-unit/Unit';
import { Water } from '@civ-clone/core-terrain/Types';

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
): Destroyed[] => {
  // Nothing clears `Stowed` on its own (its criterion is `() => false`), so a unit taken off a transport, destroyed or
  // not, would otherwise stay stowed aboard nothing.
  const leaveTransport = (manifest: TransportManifest): void => {
    const cargo = manifest.unit();

    transportRegistry.unregister(manifest);

    if (cargo.busy() instanceof Stowed) {
      cargo.setBusy();
    }
  };

  return [
    new Destroyed(
      'civ1-unit:unit/destroyed/emit',
      new Effect((unit: Unit, player: Player | null): void => {
        engine.emit('unit:destroyed', unit, player);
      })
    ),
    new Destroyed(
      // A loss for the Military report, as Civ1 counts one: a unit another player destroyed, its cargo with it at sea.
      //  Disbanding, founding or joining a city, a spent Diplomat or Caravan, and a unit whose supporting city was
      //  captured are destroyed by no one, and a nuclear weapon spends itself, so none of those count. A transport lost
      //  at sea is counted by `lostAtSea` (civ-clone/web-renderer#405).
      'civ1-unit:unit/destroyed/count-loss',
      new Criterion(
        (unit: Unit, player: Player | null): boolean =>
          player !== null && player !== unit.player()
      ),
      // Once: a defeated stack's cargo goes down with its transport, and then comes up again in the stack.
      new Criterion((unit: Unit): boolean => !unit.destroyed()),
      new Effect((unit: Unit): void => {
        unitLossRegistry.record(
          unit.player(),
          unit.sourceClass() as typeof Unit
        );
      })
    ),
    new Destroyed(
      'civ1-unit:unit/destroyed/deactivate',
      new Effect((unit: Unit): void => {
        unit.setActive(false);
        unit.setDestroyed();
      })
    ),
    new Destroyed(
      'civ1-unit:unit/destroyed/remove-improvements',
      new Effect((unit: Unit): void =>
        unitImprovementRegistry
          .getByUnit(unit)
          .forEach((unitImprovement) =>
            unitImprovementRegistry.unregister(unitImprovement)
          )
      )
    ),
    new Destroyed(
      // Cargo goes down with a transport lost at sea, however it was lost. In a city, it stays in the city.
      'civ1-unit:unit/destroyed/lose-cargo',
      new Criterion(
        (unit: Unit): boolean =>
          transportRegistry.getByTransport(unit as unknown as ITransport)
            .length > 0
      ),
      new Effect((unit: Unit, player: Player | null): void =>
        transportRegistry
          .getByTransport(unit as unknown as ITransport)
          // A copy: unregistering changes the list.
          .slice()
          .forEach((manifest: TransportManifest): void => {
            const cargo = manifest.unit();

            leaveTransport(manifest);

            if (unit.tile().terrain() instanceof Water && !cargo.destroyed()) {
              cargo.destroy(player);
            }
          })
      )
    ),
    new Destroyed(
      // Cargo destroyed on its own, or by the stack rule before its transport, is no longer aboard.
      'civ1-unit:unit/destroyed/leave-transport',
      new Criterion((unit: Unit): boolean => transportRegistry.hasUnit(unit)),
      new Effect((unit: Unit): void =>
        leaveTransport(transportRegistry.getByUnit(unit))
      )
    ),
  ];
};

export default getRules;
