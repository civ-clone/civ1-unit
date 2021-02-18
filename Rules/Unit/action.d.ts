import { Action } from '@civ-clone/core-unit/Rules/Action';
import { CityNameRegistry } from '@civ-clone/core-civilization/CityNameRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
export declare const getRules: (
  cityNameRegistry?: CityNameRegistry,
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry,
  tileImprovementRegistry?: TileImprovementRegistry,
  unitImprovementRegistry?: UnitImprovementRegistry,
  unitRegistry?: UnitRegistry,
  transportRegistry?: TransportRegistry,
  turn?: Turn
) => Action[];
export default getRules;
