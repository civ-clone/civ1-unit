import {
  AdvancedFlight,
  Automobile,
  BronzeWorking,
  Chivalry,
  Combustion,
  Conscription,
  Flight,
  Gunpowder,
  HorsebackRiding,
  Industrialization,
  IronWorking,
  LaborUnion,
  Magnetism,
  MapMaking,
  MassProduction,
  Mathematics,
  Metallurgy,
  Navigation,
  Robotics,
  Rocketry,
  SteamEngine,
  Steel,
  TheWheel,
  Trade,
  Writing,
} from '@civ-clone/civ1-science/Advances';
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
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { Naval } from '../../Types';
import Unit from '@civ-clone/core-unit/Unit';

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
