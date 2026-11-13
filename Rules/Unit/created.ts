import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  applyVisibility,
  emitCreated,
  registerUnit,
  setMoves,
} from '@civ-clone/base-unit-lifecycle/lib/created';
import Created from '@civ-clone/core-unit/Rules/Created';
import Effect from '@civ-clone/core-rule/Effect';

export const getRules: (
  unitRegistry?: UnitRegistry,
  engine?: Engine
) => Created[] = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
  engine: Engine = engineInstance
): Created[] => [
  new Created(
    'civ1-unit:unit/created/register',
    new Effect(registerUnit(unitRegistry))
  ),
  new Created(
    'civ1-unit:unit/created/apply-visibility',
    new Effect(applyVisibility)
  ),
  new Created('civ1-unit:unit/created/set-moves', new Effect(setMoves)),
  new Created('civ1-unit:unit/created/emit', new Effect(emitCreated(engine))),
];

export default getRules;
