import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Stowed from '@civ-clone/core-unit-transport/Rules/Stowed';
import { sleepAboardWith } from '@civ-clone/base-unit-lifecycle/lib/stowed';

// A unit that has just boarded sleeps aboard, looking for enemies among the game's own units
//  (civ-clone/web-renderer#1110).
export const getRules = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  turn: Turn = turnInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): Stowed[] => [
  new Stowed(
    'civ1-unit:unit/stowed/sleep',
    new Effect(sleepAboardWith(ruleRegistry, turn, unitRegistry))
  ),
];

export default getRules;
