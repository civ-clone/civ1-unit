import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Stowed from '@civ-clone/core-unit-transport/Rules/Stowed';
export declare const getRules: (
  ruleRegistry?: RuleRegistry,
  turn?: Turn,
  unitRegistry?: UnitRegistry
) => Stowed[];
export default getRules;
