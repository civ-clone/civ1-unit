import {
  Artillery,
  Bomber,
  Cannon,
  Caravan,
  Carrier,
  Catapult,
  Chariot,
  Diplomat,
  Fighter,
  Frigate,
  Horseman,
  Knight,
  MechanizedInfantry,
  Musketman,
  Nuclear,
  Rifleman,
  Sail,
  Settlers,
  Spearman,
  Submarine,
  Swordman,
  Tank,
  Transport,
  Trireme,
  Warrior,
} from '../../Units';
import { Air, Land } from '../../Types';
import UnitTraits, { unitTraits } from '@civ-clone/core-unit/Rules/UnitTraits';
import AttackEndsTurn from '@civ-clone/base-unit-trait-attack-ends-turn/AttackEndsTurn';
import Carries from '@civ-clone/base-unit-trait-carries/Carries';
import CoastBound from '@civ-clone/base-unit-trait-coast-bound/CoastBound';
import Detonates from '@civ-clone/base-unit-trait-detonates/Detonates';
import DiplomaticMissions from '@civ-clone/base-unit-trait-diplomatic-missions/DiplomaticMissions';
import Fortifies from '@civ-clone/base-unit-trait-fortifies/Fortifies';
import FoundsCities from '@civ-clone/base-unit-trait-founds-cities/FoundsCities';
import IgnoresFortifications from '@civ-clone/base-unit-trait-ignores-fortifications/IgnoresFortifications';
import IgnoresZoneOfControl from '@civ-clone/base-unit-trait-ignores-zone-of-control/IgnoresZoneOfControl';
import Interceptor from '@civ-clone/base-unit-trait-interceptor/Interceptor';
import NonCombatant from '@civ-clone/base-unit-trait-non-combatant/NonCombatant';
import Submerged from '@civ-clone/base-unit-trait-submerged/Submerged';
import Terraforms from '@civ-clone/base-unit-trait-terraforms/Terraforms';
import TradeMissions from '@civ-clone/base-unit-trait-trade-missions/TradeMissions';
import Unit from '@civ-clone/core-unit/Unit';

/** The prefix of every trait declaration's id: `civ1-unit:unit/trait/<Unit>/<Trait>`. */
export const TRAIT_RULE_PREFIX = 'civ1-unit:unit/trait';

const declare = (
  UnitTypes: (typeof Unit)[],
  ...traits: Parameters<typeof unitTraits>[2][]
): UnitTraits[] =>
  UnitTypes.flatMap((UnitType: typeof Unit): UnitTraits[] =>
    unitTraits(TRAIT_RULE_PREFIX, UnitType, ...traits)
  );

/**
 * What each Civ1 unit type can do beyond what its domain (`Land`, `Naval`, `Air`) gives it. Each list names leaf
 *  classes, never an abstract one, so a unit added later gets no trait by accident. Together they say exactly what the
 *  `Fortifiable`, `Diplomatic` and `Worker` classes and the leaf-class checks say today (`tests/traitEquivalence`).
 */
export const getRules = (): UnitTraits[] => [
  // Every `Fortifiable`: the 13 military land units, and the Diplomat and Caravan, as `Diplomatic` extends `Fortifiable`.
  ...declare(
    [
      Artillery,
      Cannon,
      Caravan,
      Catapult,
      Chariot,
      Diplomat,
      Horseman,
      Knight,
      MechanizedInfantry,
      Musketman,
      Rifleman,
      Spearman,
      Swordman,
      Tank,
      Warrior,
    ],
    Fortifies
  ),
  // Never attacks, captures or pillages, needs no support, makes no one unhappy, and walks through zones of control.
  ...declare([Caravan, Diplomat], NonCombatant, IgnoresZoneOfControl),
  ...declare([Settlers], Terraforms, FoundsCities),
  ...declare([Diplomat], DiplomaticMissions),
  ...declare([Caravan], TradeMissions),
  ...declare([Nuclear], Detonates),
  // May attack a square holding only aircraft.
  ...declare([Fighter], Interceptor),
  // May not attack a land square.
  ...declare([Submarine], Submerged),
  // May be lost at sea away from the coast.
  ...declare([Trireme], CoastBound),
  // City Walls don't help against them.
  ...declare([Artillery, Bomber], IgnoresFortifications),
  ...declare([Bomber], AttackEndsTurn),
  ...declare([Frigate, Sail, Transport, Trireme], new Carries(Land)),
  ...declare([Carrier], new Carries(Air)),
];

export default getRules;
