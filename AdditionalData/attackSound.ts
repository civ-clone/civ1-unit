import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import { Bomber } from '../Units';
import Unit from '@civ-clone/core-unit/Unit';
import { baseStats } from '../Rules/Unit/yield';

/**
 * What a battle sounds like, as words a renderer's sound pack knows, most specific first: the pack plays the first it
 *  has a sound for. Civ1 (v474.05, `BATTLE.C`) plays the winning unit's: a gun's for one with an attack above 4 or a
 *  defence above 2 in its unit table (so the Catapult's is a gun's), a blade's otherwise, and a bombing run for a
 *  Bomber. Which of the pack's versions plays, won or lost, is the renderer's to say: that depends on whose side the
 *  player watching is on, not on the unit.
 */
export type AttackSound = string[];

export const melee = 'melee',
  gunfire = 'gunfire',
  bombing = 'bombing';

/**
 * The sound for a unit of `UnitType`, or `null` for one that isn't in Civ1's unit table. A unit that doesn't attack
 *  still has one, as Civ1 gives it: heard when it wins a defence (a Transport's is a gun's).
 */
export const attackSoundFor = (UnitType: typeof Unit): AttackSound | null => {
  const stats = baseStats.find(([Type]) => Type === UnitType);

  if (stats === undefined) {
    return null;
  }

  const [, attack = 1, defence = 1] = stats;

  const sound = attack > 4 || defence > 2 ? gunfire : melee;

  return UnitType === Bomber ? [bombing, sound] : [sound];
};

export const getAdditionalData = (): AdditionalData[] => [
  new AdditionalData(Unit, 'attackSound', (unit: Unit): AttackSound | null =>
    attackSoundFor(unit.constructor as typeof Unit)
  ),
];

export default getAdditionalData;
