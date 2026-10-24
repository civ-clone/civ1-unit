import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  UnitLossRegistry,
  instance as unitLossRegistryInstance,
} from '@civ-clone/core-unit/UnitLossRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
import TransportManifest from '@civ-clone/core-unit-transport/TransportManifest';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  engine?: Engine,
  unitLossRegistry?: UnitLossRegistry,
  transportRegistry?: TransportRegistry
) => LostAtSea[] = (
  engine: Engine = engineInstance,
  unitLossRegistry: UnitLossRegistry = unitLossRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance
): LostAtSea[] => [
  new LostAtSea(
    'civ1-unit:unit/lost-at-sea/emit',
    new Effect((unit: ITransport): void => {
      engine.emit('unit:lost-at-sea', unit);
    })
  ),
  new LostAtSea(
    // The ship and everything aboard are losses for the Military report, though no one destroyed them
    //  (civ-clone/web-renderer#405). Before `destroy`, while the manifests still say what's aboard.
    'civ1-unit:unit/lost-at-sea/count-loss',
    new Effect((transport: ITransport): void =>
      [
        transport as unknown as Unit,
        ...transportRegistry
          .getByTransport(transport)
          .map((manifest: TransportManifest): Unit => manifest.unit()),
      ].forEach((unit: Unit): void => {
        unitLossRegistry.record(
          unit.player(),
          unit.sourceClass() as typeof Unit
        );
      })
    )
  ),
  new LostAtSea(
    'civ1-unit:unit/lost-at-sea/destroy',
    new Effect((unit: ITransport): void => unit.destroy(null))
  ),
];

export default getRules;
