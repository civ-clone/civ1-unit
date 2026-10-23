import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  Requirement,
  Target,
  met,
} from '@civ-clone/core-requirement/Requirement';
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { Naval } from '../../Types';
import buildRequirements from '../../Requirements';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

// A barbarian city's player has no advances: what it may build is a rule of its own (`civ1-barbarians`), and the
//  advance a unit needs, or makes obsolete, says nothing there (civ-clone/web-renderer#169).
const notBarbarian = new Criterion(
  (city: City): boolean => !isBarbarian(city.player())
);

/** Ships are only built in a coastal city: a state of the map, so a rule written by hand. */
export const navalNeedsCoast = (): Build =>
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
  );

/**
 * The rule `entry` is played by: a city may build its subject only while its player has the advances it `requires`,
 * and only until its player has the ones it is `obsoletedBy`. A `replacedBy` entry only describes, so it makes none.
 */
export const buildRulesFor = (
  entry: Requirement,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): Build[] =>
  entry.relation === 'requires' || entry.relation === 'obsoletedBy'
    ? [
        new Build(
          entry.id,
          entry.subject,
          notBarbarian,
          new Criterion(
            (city: City, BuildItem: IConstructor): boolean =>
              BuildItem === entry.subject
          ),
          new Effect((city: City): IBuildCriterion => {
            const known = (): boolean =>
              met(entry, (target: Target): boolean =>
                playerResearchRegistry
                  .getByPlayer(city.player())
                  .completed(target as typeof Advance)
              );

            return new Criterion((): boolean =>
              entry.relation === 'obsoletedBy' ? !known() : known()
            );
          })
        ),
      ]
    : [];

/** What `registerRules` gives the game's `requirements` to make each entry's rules with. */
export const deriveBuildRules =
  (playerResearchRegistry: PlayerResearchRegistry): Deriver =>
  (entry: Requirement): Build[] =>
    buildRulesFor(entry, playerResearchRegistry);

/**
 * Every rule about which units a city may build, as `registerRules` registers them: the coastal rule, then one for
 * each of `Requirements`' entries. For a rule registry without a game's `requirements` (tests, and rulesets that build
 * on these): a game's are registered through `game.requirements`, so a plugin can change an entry and its rule
 * together.
 */
export const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry
) => Build[] = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): Build[] => [
  navalNeedsCoast(),
  ...buildRequirements.flatMap((entry: Requirement): Build[] =>
    buildRulesFor(entry, playerResearchRegistry)
  ),
];

export default getRules;
