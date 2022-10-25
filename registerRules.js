"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("./Rules/Unit/action");
const activate_1 = require("./Rules/Unit/activate");
const build_1 = require("./Rules/City/build");
const buildCost_1 = require("./Rules/City/buildCost");
const buildingComplete_1 = require("./Rules/City/buildingComplete");
const created_1 = require("./Rules/Unit/created");
const defeated_1 = require("./Rules/Unit/defeated");
const destroyed_1 = require("./Rules/Unit/destroyed");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const lostAtSea_1 = require("./Rules/Unit/lostAtSea");
const moved_1 = require("./Rules/Unit/moved");
const movementCost_1 = require("./Rules/Unit/movementCost");
const action_2 = require("./Rules/Player/action");
const stowed_1 = require("./Rules/Unit/stowed");
const yield_1 = require("./Rules/Unit/yield");
const unsupported_1 = require("./Rules/Unit/unsupported");
const validateMove_1 = require("./Rules/Unit/validateMove");
RuleRegistry_1.instance.register(...(0, action_1.default)(), ...(0, activate_1.default)(), ...(0, build_1.default)(), ...(0, buildCost_1.default)(), ...(0, buildingComplete_1.default)(), ...(0, created_1.default)(), ...(0, defeated_1.default)(), ...(0, destroyed_1.default)(), ...(0, lostAtSea_1.default)(), ...(0, moved_1.default)(), ...(0, movementCost_1.default)(), ...(0, action_2.default)(), ...(0, stowed_1.default)(), ...(0, yield_1.default)(), ...(0, unsupported_1.default)(), ...(0, validateMove_1.default)());
//# sourceMappingURL=registerRules.js.map