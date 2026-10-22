import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import {
  Cannon,
  Catapult,
  Chariot,
  Frigate,
  Horseman,
  Ironclad,
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
import Automobile from '@civ-clone/base-science-advance-automobile/Automobile';
import Chivalry from '@civ-clone/base-science-advance-chivalry/Chivalry';
import City from '@civ-clone/core-city/City';
import Combustion from '@civ-clone/base-science-advance-combustion/Combustion';
import Conscription from '@civ-clone/base-science-advance-conscription/Conscription';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Industrialization from '@civ-clone/base-science-advance-industrialization/Industrialization';
import Magnetism from '@civ-clone/base-science-advance-magnetism/Magnetism';
import Metallurgy from '@civ-clone/base-science-advance-metallurgy/Metallurgy';
import { Naval } from '../../Types';
import Navigation from '@civ-clone/base-science-advance-navigation/Navigation';
import Robotics from '@civ-clone/base-science-advance-robotics/Robotics';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import requiredAdvances from '../../lib/requiredAdvances';

// A barbarian city's player has no advances: what it may build is a rule of its own (`civ1-barbarians`), and the
//  advance a unit needs, or makes obsolete, says nothing there (civ-clone/web-renderer#169).
const notBarbarian = new Criterion(
  (city: City): boolean => !isBarbarian(city.player())
);

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
    'civ1-unit:city/build/naval-needs-coast',
    Naval,
    new Criterion((city: City, BuildItem: IConstructor): boolean =>
      Object.prototype.isPrototypeOf.call(Naval, BuildItem)
    ),
    new Effect(
      (city: City): IBuildCriterion =>
        new Criterion((): boolean => city.tile().isCoast())
    )
  ),
  ...requiredAdvances.map(
    ([UnitType, RequiredAdvance]): Build =>
      new Build(
        `civ1-unit:city/build/requires-advance/${UnitType.name}`,
        UnitType,
        notBarbarian,
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
        `civ1-unit:city/build/obsolete/${UnitType.name}`,
        UnitType,
        notBarbarian,
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
