"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeOrders = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Actions_1 = require("../Actions");
const Advances_1 = require("@civ-clone/library-science/Advances");
const Types_1 = require("../Types");
// The route orders `unit` may be given for a distant square it has a route to (civ-clone/web-renderer#195): Road to
//  for a worker, and Railroad to once its player knows Railroad. The `road-to` and `railroad-to` actions are offered
//  by this, and `AdditionalData/routeOrders` tells a renderer which to offer, so neither has the rule twice.
const routeOrders = (unit, playerResearchRegistry = PlayerResearchRegistry_1.instance) => {
    if (!(unit instanceof Types_1.Worker)) {
        return [];
    }
    // A player with no research of its own (a barbarian, say) knows nothing.
    return playerResearchRegistry
        .getBy('player', unit.player())
        .some((research) => research.completed(Advances_1.Railroad))
        ? [Actions_1.RoadTo, Actions_1.RailroadTo]
        : [Actions_1.RoadTo];
};
exports.routeOrders = routeOrders;
exports.default = exports.routeOrders;
//# sourceMappingURL=routeOrders.js.map