import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import TurnEnd from '@civ-clone/core-player/Rules/TurnEnd';
import Unit from '@civ-clone/core-unit/Unit';
export declare const aircraftRange: [typeof Unit, number][];
export declare const turnsAloftKey: (unit: Unit) => string;
export declare const getRules: (
  unitRegistry?: UnitRegistry,
  cityRegistry?: CityRegistry,
  transportRegistry?: TransportRegistry,
  strategyNoteRegistry?: StrategyNoteRegistry,
  ruleRegistry?: RuleRegistry
) => TurnEnd[];
export default getRules;
