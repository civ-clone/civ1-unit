import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import Hold from '@civ-clone/core-city-build/Rules/Hold';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  gameDifficultyRegistry?: GameDifficultyRegistry,
  ruleRegistry?: RuleRegistry
) => Hold[];
export default getRules;
