"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstStealableAdvance = exports.civ1Advances = exports.stealAdvance = exports.stealableAdvances = void 0;
const Advances_1 = require("@civ-clone/library-science/Advances");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const stealAdvance_1 = require("@civ-clone/base-unit-action-steal-technology/lib/stealAdvance");
exports.stealAdvance = stealAdvance_1.default;
Object.defineProperty(exports, "stealableAdvances", { enumerable: true, get: function () { return stealAdvance_1.stealableAdvances; } });
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/**
 * v474.05's 72 advances (civd `GAME.C` `advances[72]`), in its order, by their index there. Slots 67 to 70 (named
 * "1" to "4") are never known, nor is 71, Future Technology (`has_tech()` is 0 for it), so they hold `null`.
 */
exports.civ1Advances = [
    Advances_1.Alphabet,
    Advances_1.CodeOfLaws,
    Advances_1.Currency,
    Advances_1.AtomicTheory,
    Advances_1.Democracy,
    Advances_1.Monarchy,
    Advances_1.Astronomy,
    Advances_1.MapMaking,
    Advances_1.Navigation,
    Advances_1.Mathematics,
    Advances_1.Medicine,
    Advances_1.Physics,
    Advances_1.Engineering,
    Advances_1.University,
    Advances_1.Magnetism,
    Advances_1.Electronics,
    Advances_1.Masonry,
    Advances_1.BronzeWorking,
    Advances_1.IronWorking,
    Advances_1.BridgeBuilding,
    Advances_1.Invention,
    Advances_1.Computers,
    Advances_1.Writing,
    Advances_1.SteamEngine,
    Advances_1.Trade,
    Advances_1.CeremonialBurial,
    Advances_1.Mysticism,
    Advances_1.NuclearFission,
    Advances_1.Philosophy,
    Advances_1.Religion,
    Advances_1.Literacy,
    Advances_1.HorsebackRiding,
    Advances_1.Feudalism,
    Advances_1.TheWheel,
    Advances_1.Gunpowder,
    Advances_1.Industrialization,
    Advances_1.Chemistry,
    Advances_1.Combustion,
    Advances_1.Flight,
    Advances_1.AdvancedFlight,
    Advances_1.SpaceFlight,
    Advances_1.MassProduction,
    Advances_1.Pottery,
    Advances_1.Communism,
    Advances_1.TheRepublic,
    Advances_1.Construction,
    Advances_1.Rocketry,
    Advances_1.Corporation,
    Advances_1.Metallurgy,
    Advances_1.Railroad,
    Advances_1.NuclearPower,
    Advances_1.TheoryOfGravity,
    Advances_1.Steel,
    Advances_1.Banking,
    Advances_1.Electricity,
    Advances_1.Refining,
    Advances_1.Explosives,
    Advances_1.Superconductor,
    Advances_1.Automobile,
    Advances_1.GeneticEngineering,
    Advances_1.Plastics,
    Advances_1.Recycling,
    Advances_1.Chivalry,
    Advances_1.Robotics,
    Advances_1.Conscription,
    Advances_1.LaborUnion,
    Advances_1.FusionPower,
    null,
    null,
    null,
    null,
    null,
];
/**
 * The advance a Diplomat of `thief`'s takes from `victim`, as v474.05 picks it (civd `DIPLOMAT.C`, the Steal Technology
 * case):
 *
 *     rand_tech = rand_scaled(72);
 *     for (i = 0; i < 72; i++) {
 *         tech = (rand_tech + i) % 72;
 *         if (player == 0)
 *             continue;
 *         if (!has_tech(target_civ, tech))
 *             continue;
 *         if (has_tech(player, tech))
 *             continue;
 *         give_advance(player, tech, target_civ);
 *
 * and `has_tech()` (civd `ECONOMY.C`) knows nothing of the Barbarians, civilization 0:
 *
 *     if (adv >= 71)
 *         return 0;
 *     if (civ == 0)
 *         return 0;
 *
 * One draw, always, then the first advance from a random place in `civ1Advances` that `victim` knows and `thief`
 * doesn't, so an advance after a run `thief` knows is likelier. Nothing is taken by the Barbarians (`player == 0`), nor
 * from them (`has_tech(target_civ, …)` is 0 for every slot), though the draw is still made. `null` if there is nothing
 * to take.
 */
const firstStealableAdvance = (thief, victim, randomNumberGenerator, playerResearchRegistry = PlayerResearchRegistry_1.instance) => 
// The walk is base-unit-action-steal-technology's, over `civ1Advances`; the Barbarians are refused after the draw.
(0, stealAdvance_1.firstStealableAdvance)(thief, victim, exports.civ1Advances, randomNumberGenerator, {
    playerResearchRegistry,
    refuses: (thief, victim) => (0, isBarbarian_1.default)(thief) || (0, isBarbarian_1.default)(victim),
});
exports.firstStealableAdvance = firstStealableAdvance;
exports.default = stealAdvance_1.default;
//# sourceMappingURL=stealAdvance.js.map