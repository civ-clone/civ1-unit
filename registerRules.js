"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const action_1 = require("./Rules/Unit/action");
const activate_1 = require("./Rules/Unit/activate");
const build_1 = require("./Rules/City/build");
const buildCost_1 = require("./Rules/City/buildCost");
const buildingComplete_1 = require("./Rules/City/buildingComplete");
const canJoinCity_1 = require("./Rules/Unit/canJoinCity");
const canStow_1 = require("./Rules/Unit/canStow");
const captured_1 = require("./Rules/City/captured");
const created_1 = require("./Rules/Unit/created");
const defeated_1 = require("./Rules/Unit/defeated");
const destroyed_1 = require("./Rules/Unit/destroyed");
const diplomat_1 = require("./Rules/Unit/diplomat");
const expectedMovementCost_1 = require("./Rules/Unit/expectedMovementCost");
const lostAtSea_1 = require("./Rules/Unit/lostAtSea");
const moved_1 = require("./Rules/Unit/moved");
const movementCost_1 = require("./Rules/Unit/movementCost");
const action_2 = require("./Rules/Player/action");
const stowed_1 = require("./Rules/Unit/stowed");
const tradeRouteEstablished_1 = require("./Rules/Unit/tradeRouteEstablished");
const transferred_1 = require("./Rules/Unit/transferred");
const turnEnd_1 = require("./Rules/Player/turnEnd");
const yield_1 = require("./Rules/Unit/yield");
const unsupported_1 = require("./Rules/Unit/unsupported");
const validateMove_1 = require("./Rules/Unit/validateMove");
const core_game_1 = require("@civ-clone/core-game");
const register = (game) => game.rules.register(...(0, action_1.default)(game.cityNames, game.cities, game.rules, game.tileImprovements, game.unitImprovements, game.units, game.terrainFeatures, game.transports, game.turn, game.interactions, game.workedTiles, game.pathFinders, game.strategyNotes, game.cityGrowth, game.landMasses, game.cityBuilds, game.cityImprovements, game.playerResearch, game.playerTreasuries), ...(0, activate_1.default)(game.unitImprovements), ...(0, build_1.default)(game.playerResearch), ...(0, buildCost_1.default)(), ...(0, buildingComplete_1.default)(game.cityGrowth), ...(0, canJoinCity_1.default)(game.cityGrowth), ...(0, canStow_1.default)(), ...(0, captured_1.default)(game.cities, game.units), ...(0, created_1.default)(game.units, game.engine), ...(0, defeated_1.default)(game.cities, game.rules, game.tileImprovements, game.units, game.engine), ...(0, destroyed_1.default)(game.units, game.unitImprovements, game.engine, game.transports), ...(0, expectedMovementCost_1.default)(), ...(0, lostAtSea_1.default)(game.engine), ...(0, moved_1.default)(game.transports, game.rules, game.rng, game.engine, game.cities, game.turn, game.interactions, game.units), ...(0, movementCost_1.default)(game.tileImprovements, game.transports), ...(0, action_2.default)(game.units), ...(0, stowed_1.default)(), ...(0, diplomat_1.default)(game.cityBuilds, game.cityImprovements, game.cities, game.interactions, game.playerResearch, game.playerTreasuries, game.rules, game.turn, game.engine, game.rng), ...(0, transferred_1.default)(game.unitImprovements, game.engine), ...(0, tradeRouteEstablished_1.default)(game.tradeRoutes, game.playerTreasuries, game.playerResearch, game.landMasses, game.engine), ...(0, turnEnd_1.default)(game.units, game.cities, game.transports, game.strategyNotes, game.rules), ...(0, yield_1.default)(game.unitImprovements, game.rules, game.transports), ...(0, unsupported_1.default)(game.engine), ...(0, validateMove_1.default)(game.rng));
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map