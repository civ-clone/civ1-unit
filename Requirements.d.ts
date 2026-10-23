import {
  Condition,
  Requirement,
} from '@civ-clone/core-requirement/Requirement';
/** The advance a city's player needs before it can build each unit: one rule each. */
export declare const requiresAdvance: Requirement[];
/** The advance that stops a city's player building each unit: one rule each. */
export declare const obsoletedBy: Requirement[];
/**
 * The unit each obsolete one gives way to: the one its obsoleting advance makes buildable. For the civilopedia; no rule
 * is made from these.
 */
export declare const replacedBy: Requirement[];
/** A city on the coast, which `Rules/City/build`'s own rule decides. */
export declare const coastalCity: Condition;
/** Ships are only built in a coastal city. The rule is written by hand; this entry names it for the civilopedia. */
export declare const navalNeedsCoast: Requirement;
/** The entries `Rules/City/build`'s deriver makes rules from, in the order the rules were always registered. */
export declare const buildRequirements: Requirement[];
/** River or water beside the tile, or irrigated land that isn't a city, which `Rules/Unit/action`'s own rule decides. */
export declare const waterNearby: Condition;
/**
 * A Worker irrigates only with water nearby. The action's rule is written by hand, and asks civ1-world's entries for
 * the terrain; this entry names the water for the civilopedia.
 */
export declare const irrigationNeedsWater: Requirement;
/** The entries that only describe: no rule is made from them. */
export declare const describedRequirements: Requirement[];
export default buildRequirements;
