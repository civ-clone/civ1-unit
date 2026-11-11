"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stealAdvance = exports.firstStealableAdvance = exports.civ1Advances = exports.stealableAdvances = void 0;
const Advances_1 = require("@civ-clone/library-science/Advances");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const AdvanceStolen_1 = require("@civ-clone/base-unit-action-steal-technology/AdvanceStolen");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/** The advances `victim` knows and `thief` doesn't, other than repeatable ones: what a Diplomat could steal. */
const stealableAdvances = (thief, victim, playerResearchRegistry = PlayerResearchRegistry_1.instance) => {
    // Either without research (as a test may make them) has nothing to steal, rather than making the lookup throw.
    try {
        const thiefResearch = playerResearchRegistry.getByPlayer(thief);
        return playerResearchRegistry
            .getByPlayer(victim)
            .complete()
            .map((advance) => advance.sourceClass())
            .filter((AdvanceType) => !AdvanceType.repeatable && !thiefResearch.completed(AdvanceType));
    }
    catch (e) {
        return [];
    }
};
exports.stealableAdvances = stealableAdvances;
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
const firstStealableAdvance = (thief, victim, randomNumberGenerator, playerResearchRegistry = PlayerResearchRegistry_1.instance) => {
    const start = Math.floor(randomNumberGenerator() * exports.civ1Advances.length);
    if ((0, isBarbarian_1.default)(thief) || (0, isBarbarian_1.default)(victim)) {
        return null;
    }
    // The walk: v474.05's 72 slots first, then any advance it doesn't have (another package's) that `thief` could take,
    //  in the order `victim` learnt them. The start is drawn over the 72 slots only, as v474.05 draws it, not over the
    //  whole list: with no such advance the walk is exactly v474.05's, and with some they are only reached by a walk
    //  that passes slot 71 before finding anything.
    const stealable = (0, exports.stealableAdvances)(thief, victim, playerResearchRegistry), order = [
        ...exports.civ1Advances,
        ...stealable.filter((AdvanceType) => !exports.civ1Advances.includes(AdvanceType)),
    ];
    for (let i = 0; i < order.length; i++) {
        const AdvanceType = order[(start + i) % order.length];
        if (AdvanceType !== null && stealable.includes(AdvanceType)) {
            return AdvanceType;
        }
    }
    return null;
};
exports.firstStealableAdvance = firstStealableAdvance;
/**
 * `thief` takes `AdvanceType` from `victim`'s `city`: it learns the advance, the city is marked as robbed (an
 * `AdvanceStolen`, which any change of owner clears) and `player:advance-stolen` is emitted. Shared by `civ1-unit`'s
 * `unit/technology-stolen/steal` and `civ1-enhanced`'s, which only choose the advance differently.
 */
const stealAdvance = (thief, victim, city, AdvanceType, { engine = Engine_1.instance, interactionRegistry = InteractionRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, } = {}) => {
    playerResearchRegistry.getByPlayer(thief).addAdvance(AdvanceType);
    interactionRegistry.register(new AdvanceStolen_1.default(thief, victim, city, ruleRegistry, turn));
    engine.emit('player:advance-stolen', thief, victim, AdvanceType, city);
};
exports.stealAdvance = stealAdvance;
exports.default = exports.stealAdvance;
//# sourceMappingURL=stealAdvance.js.map