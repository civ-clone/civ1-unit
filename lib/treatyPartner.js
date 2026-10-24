"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treatyPartner = void 0;
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Types_1 = require("../Types");
const Declarations_1 = require("@civ-clone/library-diplomacy/Declarations");
/**
 * The player `unit` has a peace treaty with whose land `tile` is, or `null`:
 * an improved tile (irrigation, a mine, a road or a railroad) one of that
 * player's cities is working, and a land unit that isn't a Diplomat or a
 * Caravan. Moving onto or pillaging such a tile breaks the treaty
 * (civ-clone/web-renderer#287).
 *
 * v474.05 keeps a map of who owns each tile (a city's radius when it's
 * founded, and every tile a city works, until a foreign unit steps on it):
 * here a tile counts while it's worked.
 */
const treatyPartner = (unit, tile, interactionRegistry, tileImprovementRegistry, workedTileRegistry) => {
    if (!(unit instanceof Types_1.Land) || unit instanceof Types_1.Diplomatic) {
        return null;
    }
    const workedTile = workedTileRegistry.getByTile(tile);
    if (workedTile === null) {
        return null;
    }
    const partner = workedTile.city().player();
    if (partner === unit.player() ||
        !interactionRegistry
            .getByPlayers(unit.player(), partner)
            .some((interaction) => interaction instanceof Declarations_1.Peace && interaction.active()) ||
        !tileImprovementRegistry
            .getByTile(tile)
            .some((improvement) => [TileImprovements_1.Irrigation, TileImprovements_1.Mine, TileImprovements_1.Railroad, TileImprovements_1.Road].some((Improvement) => improvement instanceof Improvement))) {
        return null;
    }
    return partner;
};
exports.treatyPartner = treatyPartner;
exports.default = exports.treatyPartner;
//# sourceMappingURL=treatyPartner.js.map