import {
  Artillery,
  Battleship,
  Bomber,
  Cannon,
  Caravan,
  Carrier,
  Catapult,
  Chariot,
  Cruiser,
  Diplomat,
  Fighter,
  Frigate,
  Horseman,
  Ironclad,
  Knight,
  MechanizedInfantry,
  Musketman,
  Nuclear,
  Rifleman,
  Sail,
  Spearman,
  Submarine,
  Swordman,
  Tank,
  Transport,
  Trireme,
} from '../Units';
import Advance from '@civ-clone/core-science/Advance';
import AdvancedFlight from '@civ-clone/base-science-advance-advancedflight/AdvancedFlight';
import Automobile from '@civ-clone/base-science-advance-automobile/Automobile';
import BronzeWorking from '@civ-clone/base-science-advance-bronzeworking/BronzeWorking';
import Chivalry from '@civ-clone/base-science-advance-chivalry/Chivalry';
import Combustion from '@civ-clone/base-science-advance-combustion/Combustion';
import Conscription from '@civ-clone/base-science-advance-conscription/Conscription';
import Flight from '@civ-clone/base-science-advance-flight/Flight';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import HorsebackRiding from '@civ-clone/base-science-advance-horsebackriding/HorsebackRiding';
import Industrialization from '@civ-clone/base-science-advance-industrialization/Industrialization';
import IronWorking from '@civ-clone/base-science-advance-ironworking/IronWorking';
import LaborUnion from '@civ-clone/base-science-advance-laborunion/LaborUnion';
import Magnetism from '@civ-clone/base-science-advance-magnetism/Magnetism';
import MapMaking from '@civ-clone/base-science-advance-mapmaking/MapMaking';
import MassProduction from '@civ-clone/base-science-advance-massproduction/MassProduction';
import Mathematics from '@civ-clone/base-science-advance-mathematics/Mathematics';
import Metallurgy from '@civ-clone/base-science-advance-metallurgy/Metallurgy';
import Navigation from '@civ-clone/base-science-advance-navigation/Navigation';
import Robotics from '@civ-clone/base-science-advance-robotics/Robotics';
import Rocketry from '@civ-clone/base-science-advance-rocketry/Rocketry';
import SteamEngine from '@civ-clone/base-science-advance-steamengine/SteamEngine';
import Steel from '@civ-clone/base-science-advance-steel/Steel';
import TheWheel from '@civ-clone/base-science-advance-thewheel/TheWheel';
import Trade from '@civ-clone/base-science-advance-trade/Trade';
import Unit from '@civ-clone/core-unit/Unit';
import Writing from '@civ-clone/base-science-advance-writing/Writing';

/**
 * The advance a city's player needs before it can build each unit. Units not listed (Militia, Settlers, Warrior) need
 * none. `Rules/City/build` makes the rules from this; it is exported for rules that judge a unit by who else could
 * build it, such as what a barbarian city builds (civ-clone/web-renderer#169).
 */
export const requiredAdvances = [
  [Artillery, Robotics],
  [Battleship, Steel],
  [Bomber, AdvancedFlight],
  [Cannon, Metallurgy],
  [Carrier, AdvancedFlight],
  [Caravan, Trade],
  [Catapult, Mathematics],
  [Chariot, TheWheel],
  [Cruiser, Combustion],
  [Diplomat, Writing],
  [Fighter, Flight],
  [Frigate, Magnetism],
  [Horseman, HorsebackRiding],
  [Ironclad, SteamEngine],
  [Knight, Chivalry],
  [MechanizedInfantry, LaborUnion],
  [Musketman, Gunpowder],
  [Nuclear, Rocketry],
  [Rifleman, Conscription],
  [Sail, Navigation],
  [Spearman, BronzeWorking],
  [Submarine, MassProduction],
  [Swordman, IronWorking],
  [Tank, Automobile],
  [Transport, Industrialization],
  [Trireme, MapMaking],
] as [typeof Unit, typeof Advance][];

/** The advance `UnitType` needs, or `null` when it needs none. */
export const requiredAdvanceFor = (
  UnitType: typeof Unit
): typeof Advance | null =>
  requiredAdvances.find(([Type]) => Type === UnitType)?.[1] ?? null;

export default requiredAdvances;
