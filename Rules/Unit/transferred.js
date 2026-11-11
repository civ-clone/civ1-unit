"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const startAfresh_1 = require("../../lib/startAfresh");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const RuleIds_1 = require("../../RuleIds");
const Transferred_1 = require("@civ-clone/core-unit/Rules/Transferred");
const getRules = (unitImprovementRegistry = UnitImprovementRegistry_1.instance, engine = Engine_1.instance, strategyNoteRegistry = StrategyNoteRegistry_1.instance) => [
    // v474.05 deletes a bribed or defecting unit and creates a new one for its new owner (civd `DIPLOMAT.C` `buy_u()`
    //  and the city revolt, `drop_u_stack()` then `create_unit()`, which sets `status = 0` and the type's fuel), so it
    //  arrives as a new unit would: not a veteran, not fortified, with no moves until its new owner's turn (Rome on 640K
    //  a Day, p273), and, an aircraft, with its fuel full. Otherwise a Bomber a turn out when it's bribed would be lost at
    //  the end of the briber's turn, before its new owner could move it. `civ1-enhanced` can have it keep its veteran
    //  status (civ-clone/web-renderer#960). `START_AFRESH_PRIORITY`, before the client is told, whichever is in force.
    new Transferred_1.default(RuleIds_1.START_AFRESH_RULE, new Priority_1.default(startAfresh_1.START_AFRESH_PRIORITY), new Effect_1.default((unit) => (0, startAfresh_1.default)(unit, false, unitImprovementRegistry, strategyNoteRegistry))),
    new Transferred_1.default('civ1-unit:unit/transferred/emit', new Effect_1.default((unit, player, previousPlayer) => {
        engine.emit('unit:transferred', unit, player, previousPlayer);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=transferred.js.map