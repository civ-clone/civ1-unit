import BaseSleep from '@civ-clone/base-unit-action-sleep/Sleep';
import { Land as LandUnit } from '../Types';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { isA } from '@civ-clone/core-unit/traits';

/**
 * Whether `unit` is a land unit at sea, so aboard a transport there. v474.05 never wakes one that's asleep
 *  (`validate_record`, UNITS.C, which wakes every other sleeping unit an enemy comes beside), so it sleeps `Stowed`, as
 *  it boarded, rather than `Sleeping`, which wakes when a foreign unit comes into sight (civ-clone/web-renderer#1031).
 */
export const isLandUnitAtSea = (
  unit: Unit,
  tile: Tile = unit.tile()
): boolean => isA(unit, LandUnit) && !tile.isLand();

/**
 * Puts a land unit at sea back to sleep aboard its transport, as boarding it left the unit (`Embark`): `Stowed` and
 *  inactive. Its moves are its own: v474.05 leaves them as they are when a ship that sails on puts its cargo back to
 *  sleep (CONTROL.C, `status |= 1`).
 */
export const restow = (unit: Unit): void => {
  unit.setActive(false);
  unit.setBusy(new Stowed());
};

/**
 * `Sleep` for a land unit at sea (`isLandUnitAtSea`): it sleeps `Stowed` (`restow`), not `Sleeping`, and, as v474.05's
 *  's' leaves any unit, with no moves left.
 *
 * Named `Sleep`, as the action it is: the renderer and its translations know a unit's actions by their class's name,
 *  and the player gives this order with the same key.
 */
export class Sleep extends BaseSleep {
  perform(): void {
    this.unit().moves().set(0);

    restow(this.unit());
  }
}

export default Sleep;
