"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Advances_1 = require("@civ-clone/civ1-science/Advances");
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const Units_1 = require("../../Units");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Types_1 = require("../../Types");
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance) => [
    // new Build(
    //   new Effect((city: City): IBuildCriterion => new Criterion(
    //     (): boolean => (city.production - city.units.length) > 0
    //   ))
    // ),
    new Build_1.Build(new Criterion_1.default((city, BuildItem) => Object.prototype.isPrototypeOf.call(Types_1.Naval, BuildItem)), new Effect_1.default((city) => new Criterion_1.default(() => city.tile().isCoast()))),
    ...[
        [Units_1.Artillery, Advances_1.Robotics],
        [Units_1.Battleship, Advances_1.Steel],
        [Units_1.Bomber, Advances_1.AdvancedFlight],
        [Units_1.Cannon, Advances_1.Metallurgy],
        [Units_1.Carrier, Advances_1.AdvancedFlight],
        [Units_1.Caravan, Advances_1.Trade],
        [Units_1.Catapult, Advances_1.Mathematics],
        [Units_1.Chariot, Advances_1.TheWheel],
        [Units_1.Cruiser, Advances_1.Combustion],
        [Units_1.Diplomat, Advances_1.Writing],
        [Units_1.Fighter, Advances_1.Flight],
        [Units_1.Frigate, Advances_1.Magnetism],
        [Units_1.Horseman, Advances_1.HorsebackRiding],
        [Units_1.Ironclad, Advances_1.SteamEngine],
        [Units_1.Knight, Advances_1.Chivalry],
        [Units_1.MechanizedInfantry, Advances_1.LaborUnion],
        [Units_1.Musketman, Advances_1.Gunpowder],
        [Units_1.Nuclear, Advances_1.Rocketry],
        [Units_1.Rifleman, Advances_1.Conscription],
        [Units_1.Sail, Advances_1.Navigation],
        [Units_1.Spearman, Advances_1.BronzeWorking],
        [Units_1.Submarine, Advances_1.MassProduction],
        [Units_1.Swordman, Advances_1.IronWorking],
        [Units_1.Tank, Advances_1.Automobile],
        [Units_1.Transport, Advances_1.Industrialization],
        [Units_1.Trireme, Advances_1.MapMaking],
    ].map(([UnitType, RequiredAdvance]) => new Build_1.Build(new Criterion_1.default((city, BuildItem) => BuildItem === UnitType), new Effect_1.default((city) => new Criterion_1.default(() => playerResearchRegistry
        .getByPlayer(city.player())
        .completed(RequiredAdvance))))),
    ...[
        [Units_1.Cannon, Advances_1.Robotics],
        [Units_1.Catapult, Advances_1.Metallurgy],
        [Units_1.Chariot, Advances_1.Chivalry],
        [Units_1.Frigate, Advances_1.Industrialization],
        [Units_1.Horseman, Advances_1.Conscription],
        [Units_1.Ironclad, Advances_1.Combustion],
        [Units_1.Knight, Advances_1.Automobile],
        [Units_1.Musketman, Advances_1.Conscription],
        [Units_1.Sail, Advances_1.Magnetism],
        [Units_1.Spearman, Advances_1.Gunpowder],
        [Units_1.Swordman, Advances_1.Conscription],
        [Units_1.Trireme, Advances_1.Navigation],
        [Units_1.Warrior, Advances_1.Gunpowder],
    ].map(([UnitType, ObseletionAdvance]) => new Build_1.Build(new Criterion_1.default((city, BuildItem) => BuildItem === UnitType), new Effect_1.default((city) => new Criterion_1.default(() => !playerResearchRegistry
        .getByPlayer(city.player())
        .completed(ObseletionAdvance))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map