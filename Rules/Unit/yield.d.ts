import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { Yield as UnitYield } from '@civ-clone/core-unit/Rules/Yield';
import { BaseYield } from '@civ-clone/core-unit/Rules/Yield';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Each unit's attack, defence, movement and visibility before any modifier (a veteran's, a city's walls), as Civ1's
 *  unit table has them. Left out, a stat is 1.
 */
export declare const baseStats: [typeof Unit, (number | undefined)?, (number | undefined)?, (number | undefined)?, (number | undefined)?][];
export declare const getRules: (unitImprovementRegistry?: UnitImprovementRegistry, ruleRegistry?: RuleRegistry, transportRegistry?: TransportRegistry) => (UnitYield | BaseYield)[];
export default getRules;
