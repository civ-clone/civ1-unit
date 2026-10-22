"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredAdvanceFor = exports.requiredAdvances = void 0;
const Units_1 = require("../Units");
const AdvancedFlight_1 = require("@civ-clone/base-science-advance-advancedflight/AdvancedFlight");
const Automobile_1 = require("@civ-clone/base-science-advance-automobile/Automobile");
const BronzeWorking_1 = require("@civ-clone/base-science-advance-bronzeworking/BronzeWorking");
const Chivalry_1 = require("@civ-clone/base-science-advance-chivalry/Chivalry");
const Combustion_1 = require("@civ-clone/base-science-advance-combustion/Combustion");
const Conscription_1 = require("@civ-clone/base-science-advance-conscription/Conscription");
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
const Navigation_1 = require("@civ-clone/base-science-advance-navigation/Navigation");
const Robotics_1 = require("@civ-clone/base-science-advance-robotics/Robotics");
const Rocketry_1 = require("@civ-clone/base-science-advance-rocketry/Rocketry");
const SteamEngine_1 = require("@civ-clone/base-science-advance-steamengine/SteamEngine");
const Steel_1 = require("@civ-clone/base-science-advance-steel/Steel");
const TheWheel_1 = require("@civ-clone/base-science-advance-thewheel/TheWheel");
const Trade_1 = require("@civ-clone/base-science-advance-trade/Trade");
const Writing_1 = require("@civ-clone/base-science-advance-writing/Writing");
/**
 * The advance a city's player needs before it can build each unit. Units not listed (Militia, Settlers, Warrior) need
 * none. `Rules/City/build` makes the rules from this; it is exported for rules that judge a unit by who else could
 * build it, such as what a barbarian city builds (civ-clone/web-renderer#169).
 */
exports.requiredAdvances = [
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
];
/** The advance `UnitType` needs, or `null` when it needs none. */
const requiredAdvanceFor = (UnitType) => { var _a, _b; return (_b = (_a = exports.requiredAdvances.find(([Type]) => Type === UnitType)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null; };
exports.requiredAdvanceFor = requiredAdvanceFor;
exports.default = exports.requiredAdvances;
//# sourceMappingURL=requiredAdvances.js.map