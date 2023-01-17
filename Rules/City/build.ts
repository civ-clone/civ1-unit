import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
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
  Warrior,
} from '../../Units';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import Advance from '@civ-clone/core-science/Advance';
import AdvancedFlight from '@civ-clone/base-science-advance-advancedflight/AdvancedFlight';
import Automobile from '@civ-clone/base-science-advance-automobile/Automobile';
import BronzeWorking from '@civ-clone/base-science-advance-bronzeworking/BronzeWorking';
import Chivalry from '@civ-clone/base-science-advance-chivalry/Chivalry';
import City from '@civ-clone/core-city/City';
import Combustion from '@civ-clone/base-science-advance-combustion/Combustion';
import Conscription from '@civ-clone/base-science-advance-conscription/Conscription';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Flight from '@civ-clone/base-science-advance-flight/Flight';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import HorsebackRiding from '@civ-clone/base-science-advance-horsebackriding/HorsebackRiding';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Industrialization from '@civ-clone/base-science-advance-industrialization/Industrialization';
import IronWorking from '@civ-clone/base-science-advance-ironworking/IronWorking';
import LaborUnion from '@civ-clone/base-science-advance-laborunion/LaborUnion';
import Magnetism from '@civ-clone/base-science-advance-magnetism/Magnetism';
import MapMaking from '@civ-clone/base-science-advance-mapmaking/MapMaking';
import MassProduction from '@civ-clone/base-science-advance-massproduction/MassProduction';
import Mathematics from '@civ-clone/base-science-advance-mathematics/Mathematics';
import Metallurgy from '@civ-clone/base-science-advance-metallurgy/Metallurgy';
import { Naval } from '../../Types';
import Navigation from '@civ-clone/base-science-advance-navigation/Navigation';
import Robotics from '@civ-clone/base-science-advance-robotics/Robotics';
import Rocketry from '@civ-clone/base-science-advance-rocketry/Rocketry';
import SteamEngine from '@civ-clone/base-science-advance-steamengine/SteamEngine';
import Steel from '@civ-clone/base-science-advance-steel/Steel';
import TheWheel from '@civ-clone/base-science-advance-thewheel/TheWheel';
import Trade from '@civ-clone/base-science-advance-trade/Trade';
import Unit from '@civ-clone/core-unit/Unit';
import Writing from '@civ-clone/base-science-advance-writing/Writing';

export const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry
) => Build[] = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): Build[] => [
  // new Build(
  //   new Effect((city: City): IBuildCriterion => new Criterion(
  //     (): boolean => (city.production - city.units.length) > 0
  //   ))
  // ),

  new Build(
    new Criterion((city: City, BuildItem: IConstructor): boolean =>
      Object.prototype.isPrototypeOf.call(Naval, BuildItem)
    ),
    new Effect(
      (city: City): IBuildCriterion =>
        new Criterion((): boolean => city.tile().isCoast())
    )
  ),
  ...(
    [
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
    ] as [typeof Unit, typeof Advance][]
  ).map(
    ([UnitType, RequiredAdvance]): Build =>
      new Build(
        new Criterion(
          (city: City, BuildItem: IConstructor): boolean =>
            BuildItem === UnitType
        ),
        new Effect(
          (city: City): IBuildCriterion =>
            new Criterion((): boolean =>
              playerResearchRegistry
                .getByPlayer(city.player())
                .completed(RequiredAdvance)
            )
        )
      )
  ),
  ...(
    [
      [Cannon, Robotics],
      [Catapult, Metallurgy],
      [Chariot, Chivalry],
      [Frigate, Industrialization],
      [Horseman, Conscription],
      [Ironclad, Combustion],
      [Knight, Automobile],
      [Musketman, Conscription],
      [Sail, Magnetism],
      [Spearman, Gunpowder],
      [Swordman, Conscription],
      [Trireme, Navigation],
      [Warrior, Gunpowder],
    ] as [typeof Unit, typeof Advance][]
  ).map(
    ([UnitType, ObseletionAdvance]): Build =>
      new Build(
        new Criterion(
          (city: City, BuildItem: IConstructor): boolean =>
            BuildItem === UnitType
        ),
        new Effect(
          (city: City): IBuildCriterion =>
            new Criterion(
              (): boolean =>
                !playerResearchRegistry
                  .getByPlayer(city.player())
                  .completed(ObseletionAdvance)
            )
        )
      )
  ),
];

export default getRules;
