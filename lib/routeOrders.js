"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeOrders = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Actions_1 = require("../Actions");
const Advances_1 = require("@civ-clone/library-science/Advances");
const Terraforms_1 = require("@civ-clone/base-unit-trait-terraforms/Terraforms");
const routeOrders_1 = require("@civ-clone/base-unit-action-build-route/lib/routeOrders");
// The route orders `unit` may be given for a distant square it has a route to (civ-clone/web-renderer#195): Road to
//  for a unit that `Terraforms`, and Railroad to once its player knows Railroad. The `road-to` and `railroad-to` actions are offered
//  by this, and `AdditionalData/routeOrders` tells a renderer which to offer, so neither has the rule twice.
const civ1RouteOrders = (0, routeOrders_1.routeOrders)([
    [Actions_1.RoadTo, null],
    [Actions_1.RailroadTo, Advances_1.Railroad],
], Terraforms_1.default);
const routeOrders = (unit, playerResearchRegistry = PlayerResearchRegistry_1.instance) => civ1RouteOrders(unit, playerResearchRegistry);
exports.routeOrders = routeOrders;
exports.default = exports.routeOrders;
//# sourceMappingURL=routeOrders.js.map