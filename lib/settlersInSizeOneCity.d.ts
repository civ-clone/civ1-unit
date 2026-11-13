import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
/**
 * Whether `cityBuild` is a size-1 city's and `BuildItem` is Settlers: what the `Hold` rules about Settlers have in
 * common, v474.05's on Chieftain (`Rules/City/hold`) and any ruleset's own (civ-clone/web-renderer#959).
 *
 * "Settlers" is a type that `FoundsCities` in `ruleRegistry`, the game's rules: a build item is a class, which has no
 * registry of its own. Without one, it is the `Settlers` class, as before: a caller that doesn't pass its game's rules
 * yet keeps the answer it had, rather than asking a registry that may hold no traits.
 */
export declare const settlersInSizeOneCity: (
  cityGrowthRegistry?: CityGrowthRegistry,
  ruleRegistry?: RuleRegistry
) => (cityBuild: CityBuild, BuildItem: Buildable) => boolean;
export default settlersInSizeOneCity;
