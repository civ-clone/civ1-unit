import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import Hold from '@civ-clone/core-city-build/Rules/Hold';
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  gameDifficultyRegistry?: GameDifficultyRegistry
) => Hold[];
export default getRules;
