/** A Diplomat steals the first advance it can, walking v474.05's list of advances from a random one. */
export declare const STEAL_RULE = 'civ1-unit:unit/technology-stolen/steal';
/** Every city near a nuclear detonation loses half its size, SDI Defense or not. */
export declare const HALVE_CITIES_RULE =
  'civ1-unit:unit/detonated/halve-cities';
/** A unit that changes sides arrives as a new unit would: not a veteran, not fortified, with no moves. */
export declare const START_AFRESH_RULE =
  'civ1-unit:unit/transferred/start-afresh';
/** On Chieftain, a size-1 city does not complete Settlers until it grows (civ-clone/web-renderer#959). */
export declare const CHIEFTAIN_SETTLERS_RULE =
  'civ1-unit:city/hold/chieftain-settlers';
/**
 * Settlers cost their city a citizen. One of size 1 is removed, and the Settlers stay on its square, unless it is its
 * player's only city, which keeps its citizen (civ-clone/web-renderer#959).
 */
export declare const SETTLERS_SHRINK_CITY_RULE =
  'civ1-unit:city/building-complete/settlers-shrink-city';
