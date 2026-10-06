"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTrade = exports.computingBaseTrade = void 0;
const Yields_1 = require("@civ-clone/library-city/Yields");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
let computing = false;
/**
 * Whether a `baseTrade` is being worked out. A city's trade-route yield reads its partners' `baseTrade`, which works out
 * their yields, so the route rule checks this and leaves its own routes out. Two cities routed to each other would
 * otherwise recurse.
 */
const computingBaseTrade = () => computing;
exports.computingBaseTrade = computingBaseTrade;
/**
 * Civ1's `City.BaseTrade` (v474.05 `CityWorker.cs` L1270): the city's trade after corruption, leaving out what its
 * trade routes add. Civ1 reads the value stored at the city's last update; this works it out now.
 */
const baseTrade = (city) => {
    const wasComputing = computing;
    computing = true;
    try {
        // `Corruption` is a negative `Trade`, so this is already net of it.
        return Math.max((0, reduceYields_1.reduceYield)(city.yields(), Yields_1.Trade), 0);
    }
    finally {
        computing = wasComputing;
    }
};
exports.baseTrade = baseTrade;
exports.default = exports.baseTrade;
//# sourceMappingURL=baseTrade.js.map