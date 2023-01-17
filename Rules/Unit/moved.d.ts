import { Engine } from '@civ-clone/core-engine/Engine';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
export declare const getRules: (
  transportRegistry?: TransportRegistry,
  ruleRegistry?: RuleRegistry,
  randomNumberGenerator?: () => number,
  engine?: Engine,
  cityRegistry?: CityRegistry,
  turn?: Turn
) => Moved[];
export default getRules;
