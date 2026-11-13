import { Air } from '../../Types';
import CanStow from '@civ-clone/core-unit-transport/Rules/CanStow';
import Carries from '@civ-clone/base-unit-trait-carries/Carries';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import { Land } from '@civ-clone/library-unit/Types';
import Unit from '@civ-clone/core-unit/Unit';

// What a transport carries is its `Carries` traits (`Rules/Unit/traits`): Land for the Trireme, Sail, Frigate and
//  Transport, Air for the Carrier. One rule for each domain a transport may be declared to carry, so the ids stay.
export const getRules = (): CanStow[] =>
  ([Land, Air] as (typeof Unit)[]).map(
    (StowableUnitType: typeof Unit): CanStow =>
      new CanStow(
        `civ1-unit:unit/can-stow/${StowableUnitType.name}`,
        new Criterion((transport: ITransport): boolean =>
          (transport as unknown as Unit)
            .traits(Carries)
            .some(
              (carries: Carries): boolean => carries.what === StowableUnitType
            )
        ),
        new Effect((transport: ITransport, unit: Unit): boolean =>
          (transport as unknown as Unit)
            .traits(Carries)
            .some(
              (carries: Carries): boolean =>
                carries.what === StowableUnitType && carries.carries(unit)
            )
        )
      )
  );

export default getRules;
