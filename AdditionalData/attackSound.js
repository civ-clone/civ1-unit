"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = exports.attackSoundFor = exports.bombing = exports.gunfire = exports.melee = void 0;
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const Units_1 = require("../Units");
const Unit_1 = require("@civ-clone/core-unit/Unit");
const yield_1 = require("../Rules/Unit/yield");
exports.melee = 'melee', exports.gunfire = 'gunfire', exports.bombing = 'bombing';
/**
 * The sound for a unit of `UnitType`, or `null` for one that isn't in Civ1's unit table. A unit that doesn't attack
 *  still has one, as Civ1 gives it: heard when it wins a defence (a Transport's is a gun's).
 */
const attackSoundFor = (UnitType) => {
    const stats = yield_1.baseStats.find(([Type]) => Type === UnitType);
    if (stats === undefined) {
        return null;
    }
    const [, attack = 1, defence = 1] = stats;
    const sound = attack > 4 || defence > 2 ? exports.gunfire : exports.melee;
    return UnitType === Units_1.Bomber ? [exports.bombing, sound] : [sound];
};
exports.attackSoundFor = attackSoundFor;
const getAdditionalData = () => [
    new AdditionalData_1.default(Unit_1.default, 'attackSound', (unit) => (0, exports.attackSoundFor)(unit.constructor)),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=attackSound.js.map