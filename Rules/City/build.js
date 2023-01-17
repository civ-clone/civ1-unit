"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const Units_1 = require("../../Units");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const AdvancedFlight_1 = require("@civ-clone/base-science-advance-advancedflight/AdvancedFlight");
const Automobile_1 = require("@civ-clone/base-science-advance-automobile/Automobile");
const BronzeWorking_1 = require("@civ-clone/base-science-advance-bronzeworking/BronzeWorking");
const Chivalry_1 = require("@civ-clone/base-science-advance-chivalry/Chivalry");
const Combustion_1 = require("@civ-clone/base-science-advance-combustion/Combustion");
const Conscription_1 = require("@civ-clone/base-science-advance-conscription/Conscription");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Flight_1 = require("@civ-clone/base-science-advance-flight/Flight");
const Gunpowder_1 = require("@civ-clone/base-science-advance-gunpowder/Gunpowder");
const HorsebackRiding_1 = require("@civ-clone/base-science-advance-horsebackriding/HorsebackRiding");
const Industrialization_1 = require("@civ-clone/base-science-advance-industrialization/Industrialization");
const IronWorking_1 = require("@civ-clone/base-science-advance-ironworking/IronWorking");
const LaborUnion_1 = require("@civ-clone/base-science-advance-laborunion/LaborUnion");
const Magnetism_1 = require("@civ-clone/base-science-advance-magnetism/Magnetism");
const MapMaking_1 = require("@civ-clone/base-science-advance-mapmaking/MapMaking");
const MassProduction_1 = require("@civ-clone/base-science-advance-massproduction/MassProduction");
const Mathematics_1 = require("@civ-clone/base-science-advance-mathematics/Mathematics");
const Metallurgy_1 = require("@civ-clone/base-science-advance-metallurgy/Metallurgy");
const Types_1 = require("../../Types");
const Navigation_1 = require("@civ-clone/base-science-advance-navigation/Navigation");
const Robotics_1 = require("@civ-clone/base-science-advance-robotics/Robotics");
const Rocketry_1 = require("@civ-clone/base-science-advance-rocketry/Rocketry");
const SteamEngine_1 = require("@civ-clone/base-science-advance-steamengine/SteamEngine");
const Steel_1 = require("@civ-clone/base-science-advance-steel/Steel");
const TheWheel_1 = require("@civ-clone/base-science-advance-thewheel/TheWheel");
const Trade_1 = require("@civ-clone/base-science-advance-trade/Trade");
const Writing_1 = require("@civ-clone/base-science-advance-writing/Writing");
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance) => [
    // new Build(
    //   new Effect((city: City): IBuildCriterion => new Criterion(
    //     (): boolean => (city.production - city.units.length) > 0
    //   ))
    // ),
    new Build_1.Build(new Criterion_1.default((city, BuildItem) => Object.prototype.isPrototypeOf.call(Types_1.Naval, BuildItem)), new Effect_1.default((city) => new Criterion_1.default(() => city.tile().isCoast()))),
    ...[
        [Units_1.Artillery, Robotics_1.default],
        [Units_1.Battleship, Steel_1.default],
        [Units_1.Bomber, AdvancedFlight_1.default],
        [Units_1.Cannon, Metallurgy_1.default],
        [Units_1.Carrier, AdvancedFlight_1.default],
        [Units_1.Caravan, Trade_1.default],
        [Units_1.Catapult, Mathematics_1.default],
        [Units_1.Chariot, TheWheel_1.default],
        [Units_1.Cruiser, Combustion_1.default],
        [Units_1.Diplomat, Writing_1.default],
        [Units_1.Fighter, Flight_1.default],
        [Units_1.Frigate, Magnetism_1.default],
        [Units_1.Horseman, HorsebackRiding_1.default],
        [Units_1.Ironclad, SteamEngine_1.default],
        [Units_1.Knight, Chivalry_1.default],
        [Units_1.MechanizedInfantry, LaborUnion_1.default],
        [Units_1.Musketman, Gunpowder_1.default],
        [Units_1.Nuclear, Rocketry_1.default],
        [Units_1.Rifleman, Conscription_1.default],
        [Units_1.Sail, Navigation_1.default],
        [Units_1.Spearman, BronzeWorking_1.default],
        [Units_1.Submarine, MassProduction_1.default],
        [Units_1.Swordman, IronWorking_1.default],
        [Units_1.Tank, Automobile_1.default],
        [Units_1.Transport, Industrialization_1.default],
        [Units_1.Trireme, MapMaking_1.default],
    ].map(([UnitType, RequiredAdvance]) => new Build_1.Build(new Criterion_1.default((city, BuildItem) => BuildItem === UnitType), new Effect_1.default((city) => new Criterion_1.default(() => playerResearchRegistry
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
    ].map(([UnitType, ObseletionAdvance]) => new Build_1.Build(new Criterion_1.default((city, BuildItem) => BuildItem === UnitType), new Effect_1.default((city) => new Criterion_1.default(() => !playerResearchRegistry
        .getByPlayer(city.player())
        .completed(ObseletionAdvance))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map