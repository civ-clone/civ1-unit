"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSenate = void 0;
const Governments_1 = require("@civ-clone/library-government/Governments");
/**
 * Whether `player` has a Senate, which won't let it break a peace treaty: the
 * Republic and Democracy (v474.05 `F0_29f3_0c9e`, civ-clone/web-renderer#133).
 * A player with no government yet has none.
 */
const hasSenate = (player, playerGovernmentRegistry) => {
    try {
        return playerGovernmentRegistry.getByPlayer(player).is(Governments_1.Republic, Governments_1.Democracy);
    }
    catch (e) {
        return false;
    }
};
exports.hasSenate = hasSenate;
exports.default = exports.hasSenate;
//# sourceMappingURL=senate.js.map