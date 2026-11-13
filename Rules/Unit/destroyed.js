"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const UnitLossRegistry_1 = require("@civ-clone/core-unit/UnitLossRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const destroyed_1 = require("@civ-clone/base-unit-lifecycle/lib/destroyed");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Destroyed_1 = require("@civ-clone/core-unit/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (unitRegistry = UnitRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance, engine = Engine_1.instance, transportRegistry = TransportRegistry_1.instance, unitLossRegistry = UnitLossRegistry_1.instance) => [
    new Destroyed_1.default('civ1-unit:unit/destroyed/emit', new Effect_1.default((0, destroyed_1.emitDestroyed)(engine))),
    new Destroyed_1.default(
    // A loss for the Military report, as Civ1 counts one: a unit another player destroyed, its cargo with it at sea.
    //  Disbanding, founding or joining a city, a spent Diplomat or Caravan, and a unit whose supporting city was
    //  captured are destroyed by no one, and a nuclear weapon spends itself, so none of those count. A transport lost
    //  at sea is counted by `lostAtSea` (civ-clone/web-renderer#405).
    'civ1-unit:unit/destroyed/count-loss', new Criterion_1.default(destroyed_1.destroyedByAnother), 
    // Once: a defeated stack's cargo goes down with its transport, and then comes up again in the stack.
    new Criterion_1.default(destroyed_1.notYetDestroyed), new Effect_1.default((0, destroyed_1.countLoss)(unitLossRegistry))),
    new Destroyed_1.default('civ1-unit:unit/destroyed/deactivate', new Effect_1.default(destroyed_1.deactivate)),
    new Destroyed_1.default('civ1-unit:unit/destroyed/remove-improvements', new Effect_1.default((0, destroyed_1.removeImprovements)(unitImprovementRegistry))),
    new Destroyed_1.default(
    // Cargo goes down with a transport lost at sea, however it was lost. In a city, it stays in the city.
    'civ1-unit:unit/destroyed/lose-cargo', new Criterion_1.default((0, destroyed_1.carriesCargo)(transportRegistry)), new Effect_1.default((0, destroyed_1.loseCargo)(transportRegistry))),
    new Destroyed_1.default(
    // Cargo destroyed on its own, or by the stack rule before its transport, is no longer aboard.
    'civ1-unit:unit/destroyed/leave-transport', new Criterion_1.default((0, destroyed_1.isAboard)(transportRegistry)), new Effect_1.default((0, destroyed_1.leaveOwnTransport)(transportRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=destroyed.js.map