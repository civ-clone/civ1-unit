"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sleep = exports.restow = exports.isLandUnitAtSea = void 0;
const Sleep_1 = require("@civ-clone/base-unit-action-sleep/Sleep");
const Types_1 = require("../Types");
const Stowed_1 = require("@civ-clone/base-unit-action-embark/Busy/Stowed");
const traits_1 = require("@civ-clone/core-unit/traits");
/**
 * Whether `unit` is a land unit at sea, so aboard a transport there. v474.05 never wakes one that's asleep
 *  (`validate_record`, UNITS.C, which wakes every other sleeping unit an enemy comes beside), so it sleeps `Stowed`, as
 *  it boarded, rather than `Sleeping`, which wakes when a foreign unit comes into sight (civ-clone/web-renderer#1031).
 */
const isLandUnitAtSea = (unit, tile = unit.tile()) => (0, traits_1.isA)(unit, Types_1.Land) && !tile.isLand();
exports.isLandUnitAtSea = isLandUnitAtSea;
/**
 * Puts a land unit at sea back to sleep aboard its transport, as boarding it left the unit (`Embark`): `Stowed` and
 *  inactive. Its moves are its own: v474.05 leaves them as they are when a ship that sails on puts its cargo back to
 *  sleep (CONTROL.C, `status |= 1`).
 */
const restow = (unit) => {
    unit.setActive(false);
    unit.setBusy(new Stowed_1.default());
};
exports.restow = restow;
/**
 * `Sleep` for a land unit at sea (`isLandUnitAtSea`): it sleeps `Stowed` (`restow`), not `Sleeping`, and, as v474.05's
 *  's' leaves any unit, with no moves left.
 *
 * Named `Sleep`, as the action it is: the renderer and its translations know a unit's actions by their class's name,
 *  and the player gives this order with the same key.
 */
class Sleep extends Sleep_1.default {
    perform() {
        this.unit().moves().set(0);
        (0, exports.restow)(this.unit());
    }
}
exports.Sleep = Sleep;
exports.default = Sleep;
//# sourceMappingURL=sleepAboard.js.map