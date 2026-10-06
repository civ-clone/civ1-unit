"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.routesPerCity = exports.goodsFor = exports.goods = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const LandMassRegistry_1 = require("@civ-clone/core-world/LandMassRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const TradeRouteRegistry_1 = require("@civ-clone/core-city/TradeRouteRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Flight_1 = require("@civ-clone/base-science-advance-flight/Flight");
const Yields_1 = require("@civ-clone/library-city/Yields");
const Railroad_1 = require("@civ-clone/base-science-advance-railroad/Railroad");
const Research_1 = require("@civ-clone/core-science/Yields/Research");
const TradeRoute_1 = require("@civ-clone/core-city/TradeRoute");
const TradeRouteEstablished_1 = require("@civ-clone/base-unit-action-establish-trade-route/Rules/TradeRouteEstablished");
const baseTrade_1 = require("../../lib/baseTrade");
const civ1Distance_1 = require("@civ-clone/civ1-world/lib/civ1Distance");
// What the goods are said to be, picked by the unit (v474.05 picks by unit slot & 7).
exports.goods = [
    'Silk',
    'Silver',
    'Wine',
    'Copper',
    'Gems',
    'Dye',
    'Salt',
    'Spice',
];
const goodsFor = (unit) => exports.goods[unit
    .id()
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0) %
    exports.goods.length];
exports.goodsFor = goodsFor;
// The number of routes a city holds (v474.05 `City.TradeCityIDs[3]`).
exports.routesPerCity = 3;
const getRules = (tradeRouteRegistry = TradeRouteRegistry_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, landMassRegistry = LandMassRegistry_1.instance, engine = Engine_1.instance) => {
    // A route's worth when choosing which slot to fill: the partner's base trade, doubled if it's foreign.
    const worth = (player, city) => (0, baseTrade_1.default)(city) * (city.player() === player ? 1 : 2);
    return [
        // The goods sell for a one-off sum, added to the owner's gold and research (v474.05 `Actions.cs`
        //  `F0_2459_0948_CaravanArrivesAtDestinationCity`; Rome on 640K a Day, p230). All the maths is integer.
        new TradeRouteEstablished_1.default('civ1-unit:unit/trade-route-established/bonus', new Effect_1.default((unit, city) => {
            const home = unit.city(), player = unit.player(), destinationResearch = playerResearchRegistry.getByPlayer(city.player());
            let bonus = Math.floor((((0, civ1Distance_1.default)(home.tile(), city.tile()) + 10) *
                ((0, baseTrade_1.default)(city) + (0, baseTrade_1.default)(home))) /
                24);
            if (landMassRegistry.getByTile(home.tile()) ===
                landMassRegistry.getByTile(city.tile())) {
                bonus = Math.floor(bonus / 2);
            }
            if (city.player() === player) {
                bonus = Math.floor(bonus / 2);
            }
            [Railroad_1.default, Flight_1.default].forEach((Advance) => {
                if (destinationResearch.completed(Advance)) {
                    bonus -= Math.floor(bonus / 3);
                }
            });
            playerTreasuryRegistry.getByPlayerAndType(player, Yields_1.Gold).add(bonus);
            playerResearchRegistry
                .getByPlayer(player)
                .add(new Research_1.default(bonus, 'TradeRoute'));
            engine.emit('unit:trade-route-established', player, home, city, (0, exports.goodsFor)(unit), bonus);
        })),
        // The home city keeps its best three routes. A route to a city it already trades with stays where it is; otherwise
        //  an empty slot is filled, or the least valuable route is replaced if the new one is worth more (the first wins a
        //  tie). If none is worth less, the route isn't kept, but the goods were still sold. v474.05 skips a slot holding the
        //  same city, which can leave it with two routes to one city; we don't copy that (Dom, 2026-09-30).
        new TradeRouteEstablished_1.default('civ1-unit:unit/trade-route-established/route', new Effect_1.default((unit, city) => {
            const home = unit.city(), player = unit.player(), routes = tradeRouteRegistry.getByCity(home);
            if (routes.some((route) => route.to() === city)) {
                return;
            }
            if (routes.length < exports.routesPerCity) {
                tradeRouteRegistry.register(new TradeRoute_1.default(home, city));
                return;
            }
            const newWorth = worth(player, city), [lowest, lowestWorth] = routes
                .map((route) => [
                route,
                worth(player, route.to()),
            ])
                .reduce((lowest, candidate) => candidate[1] < lowest[1] ? candidate : lowest);
            if (lowestWorth < newWorth) {
                lowest.setTo(city);
                tradeRouteRegistry.reindex(lowest);
            }
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tradeRouteEstablished.js.map