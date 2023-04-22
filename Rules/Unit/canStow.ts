import { Carrier, Frigate, Sail, Transport, Trireme } from '../../Units';
import { Air } from '../../Types';
import CanStow from '@civ-clone/core-unit-transport/Rules/CanStow';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import { Land } from '@civ-clone/library-unit/Types';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules = (): CanStow[] => [
  ...(
    [
      [Land, Trireme, Sail, Frigate, Transport],
      [Air, Carrier],
    ] as [typeof Unit, ...typeof Unit[]][]
  ).map(
    ([StowableUnitType, ...transportTypes]) =>
      new CanStow(
        new Criterion((transport: ITransport) =>
          transportTypes.some(
            (TransportType) => transport instanceof TransportType
          )
        ),
        new Effect(
          (transport: ITransport, unit: Unit): boolean =>
            unit instanceof StowableUnitType
        )
      )
  ),
];

export default getRules;
