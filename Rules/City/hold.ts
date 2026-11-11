import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { CHIEFTAIN_SETTLERS_RULE } from '../../RuleIds';
import Criterion from '@civ-clone/core-rule/Criterion';
import Hold from '@civ-clone/core-city-build/Rules/Hold';
import { levelOf } from '@civ-clone/civ1-difficulty/level';
import settlersInSizeOneCity from '../../lib/settlersInSizeOneCity';

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  gameDifficultyRegistry?: GameDifficultyRegistry
) => Hold[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance
): Hold[] => [
  // On Chieftain, a size-1 city doesn't complete Settlers: the build stays, with its shields, which go on adding up,
  //  until the city has grown (civ-clone/web-renderer#959). The level is the game's, so the computer players' cities
  //  wait too. v474.05 `CITYMGT.C`, before the shields are spent and the unit made:
  //
  //  ```c
  //  townbuf[city].shield_box += scratch_i;
  //  ...
  //  if (utypes[townbuf[city].production].cost * cost_scale <= townbuf[city].shield_box) {
  //      if (townbuf[city].production == UTYPE_SETTLERS && townbuf[city].size == 1 && cur_tier == 0)
  //          goto label_ai_buy;
  //  ```
  new Hold(
    CHIEFTAIN_SETTLERS_RULE,
    new Criterion(settlersInSizeOneCity(cityGrowthRegistry)),
    new Criterion((): boolean => levelOf(gameDifficultyRegistry) === 0)
  ),
];

export default getRules;
