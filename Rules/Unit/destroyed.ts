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
  transportRegistry?: TransportRegistry
) => Destroyed[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  engine: Engine = engineInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance
): Destroyed[] => [
  new Destroyed(
    'civ1-unit:unit/destroyed/emit',
    new Effect((unit: Unit, player: Player | null): void => {
      engine.emit('unit:destroyed', unit, player);
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
        transportRegistry.getByTransport(unit as unknown as ITransport).length >
        0
    ),
    new Effect((unit: Unit, player: Player | null): void =>
      transportRegistry
        .getByTransport(unit as unknown as ITransport)
        // A copy: unregistering changes the list.
        .slice()
        .forEach((manifest: TransportManifest): void => {
          const cargo = manifest.unit();

          transportRegistry.unregister(manifest);

          if (unit.tile().terrain() instanceof Water) {
            if (!cargo.destroyed()) {
              cargo.destroy(player);
            }

            return;
          }

          if (cargo.busy() instanceof Stowed) {
            cargo.setBusy();
          }
        })
    )
  ),
  new Destroyed(
    // Cargo destroyed on its own, or by the stack rule before its transport, is no longer aboard.
    'civ1-unit:unit/destroyed/leave-transport',
    new Criterion((unit: Unit): boolean => transportRegistry.hasUnit(unit)),
    new Effect((unit: Unit): void =>
      transportRegistry.unregister(transportRegistry.getByUnit(unit))
    )
  ),
];

export default getRules;
