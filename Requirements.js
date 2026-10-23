"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describedRequirements = exports.irrigationNeedsWater = exports.waterNearby = exports.buildRequirements = exports.navalNeedsCoast = exports.coastalCity = exports.replacedBy = exports.obsoletedBy = exports.requiresAdvance = void 0;
const Units_1 = require("./Units");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const Automobile_1 = require("@civ-clone/base-science-advance-automobile/Automobile");
const Chivalry_1 = require("@civ-clone/base-science-advance-chivalry/Chivalry");
const Combustion_1 = require("@civ-clone/base-science-advance-combustion/Combustion");
const Conscription_1 = require("@civ-clone/base-science-advance-conscription/Conscription");
const Gunpowder_1 = require("@civ-clone/base-science-advance-gunpowder/Gunpowder");
const Industrialization_1 = require("@civ-clone/base-science-advance-industrialization/Industrialization");
const Magnetism_1 = require("@civ-clone/base-science-advance-magnetism/Magnetism");
const Metallurgy_1 = require("@civ-clone/base-science-advance-metallurgy/Metallurgy");
const Types_1 = require("./Types");
const Navigation_1 = require("@civ-clone/base-science-advance-navigation/Navigation");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Robotics_1 = require("@civ-clone/base-science-advance-robotics/Robotics");
const requiredAdvances_1 = require("./lib/requiredAdvances");
// What Civilization's units need, what makes them obsolete and what replaces them, as the entries `Rules/City/build`
//  makes its rules from (civ-clone/web-renderer#37). `registerRules` adds them to the game's `requirements`.
/** The advance a city's player needs before it can build each unit: one rule each. */
exports.requiresAdvance = (0, Requirement_1.table)('civ1-unit:city/build/requires-advance', 'requires', requiredAdvances_1.default);
/** The advance that stops a city's player building each unit: one rule each. */
exports.obsoletedBy = (0, Requirement_1.table)('civ1-unit:city/build/obsolete', 'obsoletedBy', [
    [Units_1.Cannon, Robotics_1.default],
    [Units_1.Catapult, Metallurgy_1.default],
    [Units_1.Chariot, Chivalry_1.default],
    [Units_1.Frigate, Industrialization_1.default],
    [Units_1.Horseman, Conscription_1.default],
    [Units_1.Ironclad, Combustion_1.default],
    [Units_1.Knight, Automobile_1.default],
    [Units_1.Musketman, Conscription_1.default],
    [Units_1.Sail, Magnetism_1.default],
    [Units_1.Spearman, Gunpowder_1.default],
    [Units_1.Swordman, Conscription_1.default],
    [Units_1.Trireme, Navigation_1.default],
    [Units_1.Warrior, Gunpowder_1.default],
]);
/**
 * The unit each obsolete one gives way to: the one its obsoleting advance makes buildable. For the civilopedia; no rule
 * is made from these.
 */
exports.replacedBy = (0, Requirement_1.table)('civ1-unit:unit/replaced-by', 'replacedBy', [
    [Units_1.Cannon, Units_1.Artillery],
    [Units_1.Catapult, Units_1.Cannon],
    [Units_1.Chariot, Units_1.Knight],
    [Units_1.Frigate, Units_1.Transport],
    [Units_1.Horseman, Units_1.Rifleman],
    [Units_1.Ironclad, Units_1.Cruiser],
    [Units_1.Knight, Units_1.Tank],
    [Units_1.Musketman, Units_1.Rifleman],
    [Units_1.Sail, Units_1.Frigate],
    [Units_1.Spearman, Units_1.Musketman],
    [Units_1.Swordman, Units_1.Rifleman],
    [Units_1.Trireme, Units_1.Sail],
    [Units_1.Warrior, Units_1.Musketman],
]);
/** A city on the coast, which `Rules/City/build`'s own rule decides. */
exports.coastalCity = new Requirement_1.Condition('civ1-unit:coastal-city');
/** Ships are only built in a coastal city. The rule is written by hand; this entry names it for the civilopedia. */
exports.navalNeedsCoast = new Requirement_1.Requirement({
    id: 'civ1-unit:city/build/naval-needs-coast',
    subject: Types_1.Naval,
    relation: 'requires',
    targets: [exports.coastalCity],
    range: 'city',
});
/** The entries `Rules/City/build`'s deriver makes rules from, in the order the rules were always registered. */
exports.buildRequirements = [
    ...exports.requiresAdvance,
    ...exports.obsoletedBy,
];
/** River or water beside the tile, or irrigated land that isn't a city, which `Rules/Unit/action`'s own rule decides. */
exports.waterNearby = new Requirement_1.Condition('civ1-unit:water-nearby');
/**
 * A Worker irrigates only with water nearby. The action's rule is written by hand, and asks civ1-world's entries for
 * the terrain; this entry names the water for the civilopedia.
 */
exports.irrigationNeedsWater = new Requirement_1.Requirement({
    id: 'civ1-unit:unit/action/improvement/Irrigation',
    subject: TileImprovements_1.Irrigation,
    relation: 'requires',
    targets: [exports.waterNearby],
    range: 'tile',
});
/** The entries that only describe: no rule is made from them. */
exports.describedRequirements = [
    exports.navalNeedsCoast,
    ...exports.replacedBy,
    exports.irrigationNeedsWater,
];
exports.default = exports.buildRequirements;
//# sourceMappingURL=Requirements.js.map