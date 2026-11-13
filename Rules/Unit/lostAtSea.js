"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const UnitLossRegistry_1 = require("@civ-clone/core-unit/UnitLossRegistry");
const lostAtSea_1 = require("@civ-clone/base-unit-lifecycle/lib/lostAtSea");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const LostAtSea_1 = require("@civ-clone/core-unit-transport/Rules/LostAtSea");
const getRules = (engine = Engine_1.instance, unitLossRegistry = UnitLossRegistry_1.instance, transportRegistry = TransportRegistry_1.instance) => [
    new LostAtSea_1.default('civ1-unit:unit/lost-at-sea/emit', new Effect_1.default((0, lostAtSea_1.emitLostAtSea)(engine))),
    new LostAtSea_1.default(
    // The ship and everything aboard are losses for the Military report, though no one destroyed them
    //  (civ-clone/web-renderer#405). Before `destroy`, while the manifests still say what's aboard.
    'civ1-unit:unit/lost-at-sea/count-loss', new Effect_1.default((0, lostAtSea_1.countLosses)(unitLossRegistry, transportRegistry))),
    new LostAtSea_1.default('civ1-unit:unit/lost-at-sea/destroy', new Effect_1.default(lostAtSea_1.sink)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=lostAtSea.js.map