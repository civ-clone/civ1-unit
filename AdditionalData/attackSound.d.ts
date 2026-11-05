import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * What a battle sounds like, as words a renderer's sound pack knows, most specific first: the pack plays the first it
 *  has a sound for. Civ1 (v474.05, `BATTLE.C`) plays the winning unit's: a gun's for one with an attack above 4 or a
 *  defence above 2 in its unit table (so the Catapult's is a gun's), a blade's otherwise, and a bombing run for a
 *  Bomber. Which of the pack's versions plays, won or lost, is the renderer's to say: that depends on whose side the
 *  player watching is on, not on the unit.
 */
export type AttackSound = string[];
export declare const melee = 'melee',
  gunfire = 'gunfire',
  bombing = 'bombing';
/** The sound for a unit of `UnitType`, or `null` for one that doesn't fight, or isn't in Civ1's unit table. */
export declare const attackSoundFor: (
  UnitType: typeof Unit
) => AttackSound | null;
export declare const getAdditionalData: () => AdditionalData[];
export default getAdditionalData;
