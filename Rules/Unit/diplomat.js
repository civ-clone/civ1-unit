"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.stealableAdvances = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const AdvanceStolen_1 = require("@civ-clone/base-unit-action-steal-technology/AdvanceStolen");
const CitySabotaged_1 = require("@civ-clone/base-unit-action-industrial-sabotage/Rules/CitySabotaged");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Yields_1 = require("@civ-clone/library-city/Yields");
const CityImprovements_1 = require("@civ-clone/library-city/CityImprovements");
const RevoltIncited_1 = require("@civ-clone/base-unit-action-incite-revolt/Rules/RevoltIncited");
const SubvertCity_1 = require("@civ-clone/base-unit-action-incite-revolt/SubvertCity");
const TechnologyStolen_1 = require("@civ-clone/base-unit-action-steal-technology/Rules/TechnologyStolen");
const UnitBribed_1 = require("@civ-clone/base-unit-action-bribe-unit/Rules/UnitBribed");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const civ1Distance_1 = require("@civ-clone/civ1-world/lib/civ1Distance");
const core_random_1 = require("@civ-clone/core-random");
/** The advances `victim` knows and `thief` doesn't: what a Diplomat could steal. */
const stealableAdvances = (thief, victim, playerResearchRegistry = PlayerResearchRegistry_1.instance) => {
    // Either without research (as a test may make them) has nothing to steal, rather than making the lookup throw.
    try {
        const thiefResearch = playerResearchRegistry.getByPlayer(thief);
        return playerResearchRegistry
            .getByPlayer(victim)
            .complete()
            .map((advance) => advance.sourceClass())
            .filter((AdvanceType) => !thiefResearch.completed(AdvanceType));
    }
    catch (e) {
        return [];
    }
};
exports.stealableAdvances = stealableAdvances;
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, cityRegistry = CityRegistry_1.instance, interactionRegistry = InteractionRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, engine = Engine_1.instance, randomNumberGenerator = core_random_1.instance) => {
    // Pays `cost` from `unit`'s owner's gold, if it has that much.
    const pay = (unit, cost) => {
        const treasury = playerTreasuryRegistry.getByPlayerAndType(unit.player(), Yields_1.Gold);
        if (treasury.value() < cost) {
            return false;
        }
        treasury.subtract(cost);
        return true;
    };
    return [
        // v474.05 walks the advances from a random one and takes the first the victim has and the thief doesn't, which
        //  favours an advance after a run the thief already knows; here each is as likely (civ-clone/web-renderer#58).
        //  The city is marked as robbed, which any change of owner clears.
        new TechnologyStolen_1.default('civ1-unit:unit/technology-stolen/steal', new Effect_1.default((unit, city) => {
            const thief = unit.player(), victim = city.player(), stealable = (0, exports.stealableAdvances)(thief, victim, playerResearchRegistry);
            if (stealable.length === 0) {
                return false;
            }
            const AdvanceType = stealable[Math.floor(randomNumberGenerator() * stealable.length)];
            playerResearchRegistry.getByPlayer(thief).addAdvance(AdvanceType);
            interactionRegistry.register(new AdvanceStolen_1.default(thief, victim, city, ruleRegistry, turn));
            engine.emit('player:advance-stolen', thief, victim, AdvanceType, city);
            return true;
        })),
        // v474.05: a random improvement (never the Palace or a Wonder) half the time, or always if the shield box is
        //  empty; otherwise, or with nothing to destroy, the shield box is emptied.
        new CitySabotaged_1.default('civ1-unit:unit/city-sabotaged/sabotage', new Effect_1.default((unit, city) => {
            const cityBuild = cityBuildRegistry.getByCity(city), improvements = cityImprovementRegistry
                .getByCity(city)
                .filter((improvement) => !(improvement instanceof CityImprovements_1.Palace) &&
                !(improvement instanceof Wonder_1.default) &&
                !improvement.destroyed());
            if (improvements.length > 0 &&
                (cityBuild.progress().value() === 0 || randomNumberGenerator() < 0.5)) {
                const improvement = improvements[Math.floor(randomNumberGenerator() * improvements.length)];
                improvement.destroy();
                engine.emit('city:sabotaged', city, unit.player(), improvement);
                return;
            }
            const building = cityBuild.building();
            cityBuild.progress().set(0);
            engine.emit('city:sabotaged', city, unit.player(), building === null ? null : building.item());
        })),
        // The city changes hands as a conquered one does, through `City#capture`, with the action as its cause so the
        //  `Captured` rules can tell (civ-clone/web-renderer#58: the city shrinks, may lose buildings, and nearby units
        //  defect).
        new RevoltIncited_1.default('civ1-unit:unit/revolt-incited/capture', new Effect_1.default((unit, city, action) => {
            const originalPlayer = city.player();
            if (!pay(unit, action.cost())) {
                return false;
            }
            city.capture(unit.player(), action);
            engine.emit('city:incited', city, unit.player(), originalPlayer, action.cost(), action instanceof SubvertCity_1.default);
            return true;
        })),
        // v474.05 recreates the unit for the briber, which its `CreateUnit` homes in the nearest city if that's the
        //  briber's, and in none otherwise (Rome on 640K a Day, p356, "The Homeless Soldiers' Solution").
        new UnitBribed_1.default('civ1-unit:unit/unit-bribed/transfer', new Effect_1.default((unit, target, action) => {
            const briber = unit.player(), previousOwner = target.player();
            if (!pay(unit, action.cost())) {
                return false;
            }
            const [nearest] = cityRegistry
                .entries()
                .filter((city) => !city.destroyed())
                .sort((a, b) => (0, civ1Distance_1.default)(a.tile(), target.tile()) -
                (0, civ1Distance_1.default)(b.tile(), target.tile()));
            target.transfer(briber, nearest !== undefined && nearest.player() === briber ? nearest : null);
            engine.emit('unit:bribed', target, briber, previousOwner, action.cost());
            return true;
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=diplomat.js.map