import {
  Artillery,
  Cannon,
  Catapult,
  Chariot,
  Cruiser,
  Frigate,
  Horseman,
  Ironclad,
  Knight,
  Musketman,
  Rifleman,
  Sail,
  Spearman,
  Swordman,
  Tank,
  Transport,
  Trireme,
  Warrior,
} from './Units';
import {
  Condition,
  Requirement,
  table,
} from '@civ-clone/core-requirement/Requirement';
import Automobile from '@civ-clone/base-science-advance-automobile/Automobile';
import Chivalry from '@civ-clone/base-science-advance-chivalry/Chivalry';
import Combustion from '@civ-clone/base-science-advance-combustion/Combustion';
import Conscription from '@civ-clone/base-science-advance-conscription/Conscription';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import Industrialization from '@civ-clone/base-science-advance-industrialization/Industrialization';
import Magnetism from '@civ-clone/base-science-advance-magnetism/Magnetism';
import Metallurgy from '@civ-clone/base-science-advance-metallurgy/Metallurgy';
import { Naval } from './Types';
import Navigation from '@civ-clone/base-science-advance-navigation/Navigation';
import { Irrigation } from '@civ-clone/civ1-world/TileImprovements';
import Robotics from '@civ-clone/base-science-advance-robotics/Robotics';
import requiredAdvances from './lib/requiredAdvances';

// What Civilization's units need, what makes them obsolete and what replaces them, as the entries `Rules/City/build`
//  makes its rules from (civ-clone/web-renderer#37). `registerRules` adds them to the game's `requirements`.

/** The advance a city's player needs before it can build each unit: one rule each. */
export const requiresAdvance: Requirement[] = table(
  'civ1-unit:city/build/requires-advance',
  'requires',
  requiredAdvances
);

/** The advance that stops a city's player building each unit: one rule each. */
export const obsoletedBy: Requirement[] = table(
  'civ1-unit:city/build/obsolete',
  'obsoletedBy',
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
  ]
);

/**
 * The unit each obsolete one gives way to: the one its obsoleting advance makes buildable. For the civilopedia; no rule
 * is made from these.
 */
export const replacedBy: Requirement[] = table(
  'civ1-unit:unit/replaced-by',
  'replacedBy',
  [
    [Cannon, Artillery],
    [Catapult, Cannon],
    [Chariot, Knight],
    [Frigate, Transport],
    [Horseman, Rifleman],
    [Ironclad, Cruiser],
    [Knight, Tank],
    [Musketman, Rifleman],
    [Sail, Frigate],
    [Spearman, Musketman],
    [Swordman, Rifleman],
    [Trireme, Sail],
    [Warrior, Musketman],
  ]
);

/** A city on the coast, which `Rules/City/build`'s own rule decides. */
export const coastalCity = new Condition('civ1-unit:coastal-city');

/** Ships are only built in a coastal city. The rule is written by hand; this entry names it for the civilopedia. */
export const navalNeedsCoast = new Requirement({
  id: 'civ1-unit:city/build/naval-needs-coast',
  subject: Naval,
  relation: 'requires',
  targets: [coastalCity],
  range: 'city',
});

/** The entries `Rules/City/build`'s deriver makes rules from, in the order the rules were always registered. */
export const buildRequirements: Requirement[] = [
  ...requiresAdvance,
  ...obsoletedBy,
];

/** River or water beside the tile, or irrigated land that isn't a city, which `Rules/Unit/action`'s own rule decides. */
export const waterNearby = new Condition('civ1-unit:water-nearby');

/**
 * A Worker irrigates only with water nearby. The action's rule is written by hand, and asks civ1-world's entries for
 * the terrain; this entry names the water for the civilopedia.
 */
export const irrigationNeedsWater = new Requirement({
  id: 'civ1-unit:unit/action/improvement/Irrigation',
  subject: Irrigation,
  relation: 'requires',
  targets: [waterNearby],
  range: 'tile',
});

/** The entries that only describe: no rule is made from them. */
export const describedRequirements: Requirement[] = [
  navalNeedsCoast,
  ...replacedBy,
  irrigationNeedsWater,
];

export default buildRequirements;
