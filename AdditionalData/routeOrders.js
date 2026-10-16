"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const Unit_1 = require("@civ-clone/core-unit/Unit");
const routeOrders_1 = require("../lib/routeOrders");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
/**
 * The route orders (`RoadTo`, `RailroadTo`) a unit may be given for a distant square, by name, so a renderer can offer
 * them beside Go to without knowing the rule (civ-clone/web-renderer#195). The engine still decides, when one is
 * chosen, whether there is a route.
 */
const getAdditionalData = (playerResearchRegistry = PlayerResearchRegistry_1.instance) => [
    new AdditionalData_1.default(Unit_1.default, 'routeOrders', (unit) => (0, routeOrders_1.default)(unit, playerResearchRegistry).map((Order) => (0, DataObject_1.typeNameOf)(Order))),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=routeOrders.js.map