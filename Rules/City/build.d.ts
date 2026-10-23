import { Build } from '@civ-clone/core-city-build/Rules/Build';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
/** Ships are only built in a coastal city: a state of the map, so a rule written by hand. */
export declare const navalNeedsCoastRule: () => Build;
/**
 * The rule `entry` is played by: a city may build its subject only while its player has the advances it `requires`,
 * and only until its player has the ones it is `obsoletedBy`. A `replacedBy` entry only describes, so it makes none.
 */
export declare const buildRulesFor: (
  entry: Requirement,
  playerResearchRegistry?: PlayerResearchRegistry
) => Build[];
/** What `registerRules` gives the game's `requirements` to make each entry's rules with. */
export declare const deriveBuildRules: (
  playerResearchRegistry: PlayerResearchRegistry
) => Deriver;
/**
 * Every rule about which units a city may build, as `registerRules` registers them: the coastal rule, then one for
 * each of `Requirements`' entries. For a rule registry without a game's `requirements` (tests, and rulesets that build
 * on these): a game's are registered through `game.requirements`, so a plugin can change an entry and its rule
 * together.
 */
export declare const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry
) => Build[];
export default getRules;
