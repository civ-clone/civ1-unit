"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const action_1 = require("./Rules/Unit/action");
const activate_1 = require("./Rules/Unit/activate");
const build_1 = require("./Rules/City/build");
const buildCost_1 = require("./Rules/City/buildCost");
const buildingComplete_1 = require("./Rules/City/buildingComplete");
const created_1 = require("./Rules/Unit/created");
const defeated_1 = require("./Rules/Unit/defeated");
const destroyed_1 = require("./Rules/Unit/destroyed");
const lostAtSea_1 = require("./Rules/Unit/lostAtSea");
const moved_1 = require("./Rules/Unit/moved");
const movementCost_1 = require("./Rules/Unit/movementCost");
const action_2 = require("./Rules/Player/action");
const yield_1 = require("./Rules/Unit/yield");
const validateMove_1 = require("./Rules/Unit/validateMove");
RuleRegistry_1.instance.register(...action_1.default(), ...activate_1.default(), ...build_1.default(), ...buildCost_1.default(), ...buildingComplete_1.default(), ...created_1.default(), ...defeated_1.default(), ...destroyed_1.default(), ...lostAtSea_1.default(), ...moved_1.default(), ...movementCost_1.default(), ...action_2.default(), ...yield_1.default(), ...validateMove_1.default());
//# sourceMappingURL=registerRules.js.map