"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const Units_1 = require("../../Units");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Automobile_1 = require("@civ-clone/base-science-advance-automobile/Automobile");
const Chivalry_1 = require("@civ-clone/base-science-advance-chivalry/Chivalry");
const Combustion_1 = require("@civ-clone/base-science-advance-combustion/Combustion");
const Conscription_1 = require("@civ-clone/base-science-advance-conscription/Conscription");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Gunpowder_1 = require("@civ-clone/base-science-advance-gunpowder/Gunpowder");
const Industrialization_1 = require("@civ-clone/base-science-advance-industrialization/Industrialization");
const Magnetism_1 = require("@civ-clone/base-science-advance-magnetism/Magnetism");
const Metallurgy_1 = require("@civ-clone/base-science-advance-metallurgy/Metallurgy");
const Types_1 = require("../../Types");
const Navigation_1 = require("@civ-clone/base-science-advance-navigation/Navigation");
const Robotics_1 = require("@civ-clone/base-science-advance-robotics/Robotics");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const requiredAdvances_1 = require("../../lib/requiredAdvances");
// A barbarian city's player has no advances: what it may build is a rule of its own (`civ1-barbarians`), and the
//  advance a unit needs, or makes obsolete, says nothing there (civ-clone/web-renderer#169).
const notBarbarian = new Criterion_1.default((city) => !(0, isBarbarian_1.default)(city.player()));
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance) => [
    // new Build(
    //   new Effect((city: City): IBuildCriterion => new Criterion(
    //     (): boolean => (city.production - city.units.length) > 0
    //   ))
    // ),
    new Build_1.Build('civ1-unit:city/build/naval-needs-coast', Types_1.Naval, new Criterion_1.default((city, BuildItem) => Object.prototype.isPrototypeOf.call(Types_1.Naval, BuildItem)), new Effect_1.default((city) => new Criterion_1.default(() => city.tile().isCoast()))),
    ...requiredAdvances_1.default.map(([UnitType, RequiredAdvance]) => new Build_1.Build(`civ1-unit:city/build/requires-advance/${UnitType.name}`, UnitType, notBarbarian, new Criterion_1.default((city, BuildItem) => BuildItem === UnitType), new Effect_1.default((city) => new Criterion_1.default(() => playerResearchRegistry
        .getByPlayer(city.player())
        .completed(RequiredAdvance))))),
    ...[
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
    ].map(([UnitType, ObseletionAdvance]) => new Build_1.Build(`civ1-unit:city/build/obsolete/${UnitType.name}`, UnitType, notBarbarian, new Criterion_1.default((city, BuildItem) => BuildItem === UnitType), new Effect_1.default((city) => new Criterion_1.default(() => !playerResearchRegistry
        .getByPlayer(city.player())
        .completed(ObseletionAdvance))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map