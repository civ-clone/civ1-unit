"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.TRAIT_RULE_PREFIX = void 0;
const Units_1 = require("../../Units");
const Types_1 = require("../../Types");
const UnitTraits_1 = require("@civ-clone/core-unit/Rules/UnitTraits");
const AttackEndsTurn_1 = require("@civ-clone/base-unit-trait-attack-ends-turn/AttackEndsTurn");
const Carries_1 = require("@civ-clone/base-unit-trait-carries/Carries");
const CoastBound_1 = require("@civ-clone/base-unit-trait-coast-bound/CoastBound");
const Detonates_1 = require("@civ-clone/base-unit-trait-detonates/Detonates");
const DiplomaticMissions_1 = require("@civ-clone/base-unit-trait-diplomatic-missions/DiplomaticMissions");
const Fortifies_1 = require("@civ-clone/base-unit-trait-fortifies/Fortifies");
const FoundsCities_1 = require("@civ-clone/base-unit-trait-founds-cities/FoundsCities");
const IgnoresFortifications_1 = require("@civ-clone/base-unit-trait-ignores-fortifications/IgnoresFortifications");
const IgnoresZoneOfControl_1 = require("@civ-clone/base-unit-trait-ignores-zone-of-control/IgnoresZoneOfControl");
const Interceptor_1 = require("@civ-clone/base-unit-trait-interceptor/Interceptor");
const NonCombatant_1 = require("@civ-clone/base-unit-trait-non-combatant/NonCombatant");
const Submerged_1 = require("@civ-clone/base-unit-trait-submerged/Submerged");
const Terraforms_1 = require("@civ-clone/base-unit-trait-terraforms/Terraforms");
const TradeMissions_1 = require("@civ-clone/base-unit-trait-trade-missions/TradeMissions");
/** The prefix of every trait declaration's id: `civ1-unit:unit/trait/<Unit>/<Trait>`. */
exports.TRAIT_RULE_PREFIX = 'civ1-unit:unit/trait';
const declare = (UnitTypes, ...traits) => UnitTypes.flatMap((UnitType) => (0, UnitTraits_1.unitTraits)(exports.TRAIT_RULE_PREFIX, UnitType, ...traits));
/**
 * What each Civ1 unit type can do beyond what its domain (`Land`, `Naval`, `Air`) gives it. Each list names leaf
 *  classes, never an abstract one, so a unit added later gets no trait by accident. Together they say exactly what the
 *  `Fortifiable`, `Diplomatic` and `Worker` classes and the leaf-class checks say today (`tests/traitEquivalence`).
 */
const getRules = () => [
    // Every `Fortifiable`: the 13 military land units, and the Diplomat and Caravan, as `Diplomatic` extends `Fortifiable`.
    ...declare([
        Units_1.Artillery,
        Units_1.Cannon,
        Units_1.Caravan,
        Units_1.Catapult,
        Units_1.Chariot,
        Units_1.Diplomat,
        Units_1.Horseman,
        Units_1.Knight,
        Units_1.MechanizedInfantry,
        Units_1.Musketman,
        Units_1.Rifleman,
        Units_1.Spearman,
        Units_1.Swordman,
        Units_1.Tank,
        Units_1.Warrior,
    ], Fortifies_1.default),
    // Never attacks, captures or pillages, needs no support, makes no one unhappy, and walks through zones of control.
    ...declare([Units_1.Caravan, Units_1.Diplomat], NonCombatant_1.default, IgnoresZoneOfControl_1.default),
    ...declare([Units_1.Settlers], Terraforms_1.default, FoundsCities_1.default),
    ...declare([Units_1.Diplomat], DiplomaticMissions_1.default),
    ...declare([Units_1.Caravan], TradeMissions_1.default),
    ...declare([Units_1.Nuclear], Detonates_1.default),
    // May attack a square holding only aircraft.
    ...declare([Units_1.Fighter], Interceptor_1.default),
    // May not attack a land square.
    ...declare([Units_1.Submarine], Submerged_1.default),
    // May be lost at sea away from the coast.
    ...declare([Units_1.Trireme], CoastBound_1.default),
    // City Walls don't help against them.
    ...declare([Units_1.Artillery, Units_1.Bomber], IgnoresFortifications_1.default),
    ...declare([Units_1.Bomber], AttackEndsTurn_1.default),
    ...declare([Units_1.Frigate, Units_1.Sail, Units_1.Transport, Units_1.Trireme], new Carries_1.default(Types_1.Land)),
    ...declare([Units_1.Carrier], new Carries_1.default(Types_1.Air)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=traits.js.map