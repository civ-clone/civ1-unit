"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.deriveBuildRules = exports.buildRulesFor = exports.navalNeedsCoast = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Types_1 = require("../../Types");
const Requirements_1 = require("../../Requirements");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
// A barbarian city's player has no advances: what it may build is a rule of its own (`civ1-barbarians`), and the
//  advance a unit needs, or makes obsolete, says nothing there (civ-clone/web-renderer#169).
const notBarbarian = new Criterion_1.default((city) => !(0, isBarbarian_1.default)(city.player()));
/** Ships are only built in a coastal city: a state of the map, so a rule written by hand. */
const navalNeedsCoast = () => new Build_1.Build('civ1-unit:city/build/naval-needs-coast', Types_1.Naval, new Criterion_1.default((city, BuildItem) => Object.prototype.isPrototypeOf.call(Types_1.Naval, BuildItem)), new Effect_1.default((city) => new Criterion_1.default(() => city.tile().isCoast())));
exports.navalNeedsCoast = navalNeedsCoast;
/**
 * The rule `entry` is played by: a city may build its subject only while its player has the advances it `requires`,
 * and only until its player has the ones it is `obsoletedBy`. A `replacedBy` entry only describes, so it makes none.
 */
const buildRulesFor = (entry, playerResearchRegistry = PlayerResearchRegistry_1.instance) => entry.relation === 'requires' || entry.relation === 'obsoletedBy'
    ? [
        new Build_1.Build(entry.id, entry.subject, notBarbarian, new Criterion_1.default((city, BuildItem) => BuildItem === entry.subject), new Effect_1.default((city) => {
            const known = () => (0, Requirement_1.met)(entry, (target) => playerResearchRegistry
                .getByPlayer(city.player())
                .completed(target));
            return new Criterion_1.default(() => entry.relation === 'obsoletedBy' ? !known() : known());
        })),
    ]
    : [];
exports.buildRulesFor = buildRulesFor;
/** What `registerRules` gives the game's `requirements` to make each entry's rules with. */
const deriveBuildRules = (playerResearchRegistry) => (entry) => (0, exports.buildRulesFor)(entry, playerResearchRegistry);
exports.deriveBuildRules = deriveBuildRules;
/**
 * Every rule about which units a city may build, as `registerRules` registers them: the coastal rule, then one for
 * each of `Requirements`' entries. For a rule registry without a game's `requirements` (tests, and rulesets that build
 * on these): a game's are registered through `game.requirements`, so a plugin can change an entry and its rule
 * together.
 */
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance) => [
    (0, exports.navalNeedsCoast)(),
    ...Requirements_1.default.flatMap((entry) => (0, exports.buildRulesFor)(entry, playerResearchRegistry)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map