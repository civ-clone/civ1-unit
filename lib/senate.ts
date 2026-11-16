import { hasSenate } from '@civ-clone/base-government-senate/lib/senate';

/**
 * Whether `player` has a Senate, which won't let it break a peace treaty: the
 * Republic and Democracy (v474.05 `F0_29f3_0c9e`, civ-clone/web-renderer#133).
 * A player with no government yet has none. It is base-government-senate's
 * `hasSenate`; civ1-unit's `SenateIntervenes` rule answers with it.
 */
export { hasSenate };

export default hasSenate;
