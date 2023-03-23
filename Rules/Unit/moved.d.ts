import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Moved from '@civ-clone/core-unit/Rules/Moved';
export declare const getRules: (
  transportRegistry?: TransportRegistry,
  ruleRegistry?: RuleRegistry,
  randomNumberGenerator?: () => number,
  engine?: Engine,
  cityRegistry?: CityRegistry,
  turn?: Turn,
  interactionRegistry?: InteractionRegistry
) => Moved[];
export default getRules;
