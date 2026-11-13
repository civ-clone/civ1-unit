import {
  carriesDomain,
  carriesUnit,
} from '@civ-clone/base-unit-lifecycle/lib/canStow';
import { Air } from '../../Types';
import CanStow from '@civ-clone/core-unit-transport/Rules/CanStow';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Land } from '@civ-clone/library-unit/Types';
import Unit from '@civ-clone/core-unit/Unit';

// What a transport carries is its `Carries` traits (`Rules/Unit/traits`): Land for the Trireme, Sail, Frigate and
//  Transport, Air for the Carrier. One rule for each domain a transport may be declared to carry, so the ids stay.
export const getRules = (): CanStow[] =>
  ([Land, Air] as (typeof Unit)[]).map(
    (StowableUnitType: typeof Unit): CanStow =>
      new CanStow(
        `civ1-unit:unit/can-stow/${StowableUnitType.name}`,
        new Criterion(carriesDomain(StowableUnitType)),
        new Effect(carriesUnit(StowableUnitType))
      )
  );

export default getRules;
