"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const core_game_1 = require("@civ-clone/core-game");
const joinCityRefusal_1 = require("./AdditionalData/joinCityRefusal");
const register = (game) => game.additionalData.register(...(0, joinCityRefusal_1.default)(game.cities, game.cityGrowth));
exports.register = register;
// Imported for this side effect, as `registerRules` is.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerAdditionalData.js.map