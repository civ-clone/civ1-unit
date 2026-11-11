import Advance from '@civ-clone/core-science/Advance';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * The advance a city's player needs before it can build each unit. Units not listed (Militia, Settlers, Warrior) need
 * none. `Rules/City/build` makes the rules from this; it is exported for rules that judge a unit by who else could
 * build it, such as what a barbarian city builds (civ-clone/web-renderer#169).
 */
export declare const requiredAdvances: [typeof Unit, typeof Advance][];
/** The advance `UnitType` needs, or `null` when it needs none. */
export declare const requiredAdvanceFor: (
  UnitType: typeof Unit
) => typeof Advance | null;
export default requiredAdvances;
