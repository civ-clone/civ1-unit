"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const RuleIds_1 = require("../../RuleIds");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Hold_1 = require("@civ-clone/core-city-build/Rules/Hold");
const level_1 = require("@civ-clone/civ1-difficulty/level");
const settlersInSizeOneCity_1 = require("../../lib/settlersInSizeOneCity");
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance) => [
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
    new Hold_1.default(RuleIds_1.CHIEFTAIN_SETTLERS_RULE, new Criterion_1.default((0, settlersInSizeOneCity_1.default)(cityGrowthRegistry)), new Criterion_1.default(() => (0, level_1.levelOf)(gameDifficultyRegistry) === 0)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=hold.js.map