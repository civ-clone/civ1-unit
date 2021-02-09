import {
  BronzeWorking,
  Chivalry,
  Gunpowder,
  HorsebackRiding,
  IronWorking,
  MapMaking,
  Mathematics,
  Navigation,
  TheWheel,
} from '@civ-clone/civ1-science/Advances';
import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import {
  Catapult,
  Chariot,
  Horseman,
  Knight,
  Musketman,
  Sail,
  Spearman,
  Swordman,
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
  ...([
    [Catapult, Mathematics],
    [Horseman, HorsebackRiding],
    [Chariot, TheWheel],
    [Knight, Chivalry],
    [Musketman, Gunpowder],
    [Sail, Navigation],
    [Spearman, BronzeWorking],
    [Swordman, IronWorking],
    [Trireme, MapMaking],
  ] as [typeof Unit, typeof Advance][]).map(
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
  ...([
    [Horseman, Gunpowder],
    [Chariot, Chivalry],
    [Warrior, Gunpowder],
    [Spearman, Gunpowder],
    [Trireme, Navigation],
  ] as [typeof Unit, typeof Advance][]).map(
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
