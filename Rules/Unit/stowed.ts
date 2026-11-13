import Effect from '@civ-clone/core-rule/Effect';
import Stowed from '@civ-clone/core-unit-transport/Rules/Stowed';
import { sleepAboard } from '@civ-clone/base-unit-lifecycle/lib/stowed';

export const getRules = (): Stowed[] => [
  new Stowed('civ1-unit:unit/stowed/sleep', new Effect(sleepAboard)),
];

export default getRules;
