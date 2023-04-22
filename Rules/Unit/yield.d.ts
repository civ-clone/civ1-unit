import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { Yield as UnitYield } from '@civ-clone/core-unit/Rules/Yield';
import { BaseYield } from '@civ-clone/core-unit/Rules/Yield';
export declare const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  ruleRegistry?: RuleRegistry,
  transportRegistry?: TransportRegistry
) => (UnitYield | BaseYield)[];
export default getRules;
