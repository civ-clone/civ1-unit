"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTrade = exports.computingBaseTrade = void 0;
const baseTrade_1 = require("@civ-clone/base-city-trade-route/lib/baseTrade");
const Yields_1 = require("@civ-clone/library-city/Yields");
/**
 * Whether a `baseTrade` is being worked out. A city's trade-route yield reads its partners' `baseTrade`, which works out
 * their yields, so the route rule checks this and leaves its own routes out. Two cities routed to each other would
 * otherwise recurse. This is base-city-trade-route's own flag, re-exported so every caller shares one.
 */
var baseTrade_2 = require("@civ-clone/base-city-trade-route/lib/baseTrade");
Object.defineProperty(exports, "computingBaseTrade", { enumerable: true, get: function () { return baseTrade_2.computingBaseTrade; } });
/**
 * Civ1's `City.BaseTrade` (v474.05 `CityWorker.cs` L1270): the city's trade after corruption, leaving out what its
 * trade routes add. Civ1 reads the value stored at the city's last update; this works it out now.
 */
const baseTrade = (city) => (0, baseTrade_1.baseTrade)(city, Yields_1.Trade);
exports.baseTrade = baseTrade;
exports.default = exports.baseTrade;
//# sourceMappingURL=baseTrade.js.map