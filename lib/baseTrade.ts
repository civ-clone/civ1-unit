import { baseTrade as baseCityTrade } from '@civ-clone/base-city-trade-route/lib/baseTrade';
import { Trade } from '@civ-clone/library-city/Yields';
import City from '@civ-clone/core-city/City';

/**
 * Whether a `baseTrade` is being worked out. A city's trade-route yield reads its partners' `baseTrade`, which works out
 * their yields, so the route rule checks this and leaves its own routes out. Two cities routed to each other would
 * otherwise recurse. This is base-city-trade-route's own flag, re-exported so every caller shares one.
 */
export { computingBaseTrade } from '@civ-clone/base-city-trade-route/lib/baseTrade';

/**
 * Civ1's `City.BaseTrade` (v474.05 `CityWorker.cs` L1270): the city's trade after corruption, leaving out what its
 * trade routes add. Civ1 reads the value stored at the city's last update; this works it out now.
 */
export const baseTrade = (city: City): number => baseCityTrade(city, Trade);

export default baseTrade;
