import City from '@civ-clone/core-city/City';
/**
 * Whether a `baseTrade` is being worked out. A city's trade-route yield reads its partners' `baseTrade`, which works out
 * their yields, so the route rule checks this and leaves its own routes out. Two cities routed to each other would
 * otherwise recurse.
 */
export declare const computingBaseTrade: () => boolean;
/**
 * Civ1's `City.BaseTrade` (v474.05 `CityWorker.cs` L1270): the city's trade after corruption, leaving out what its
 * trade routes add. Civ1 reads the value stored at the city's last update; this works it out now.
 */
export declare const baseTrade: (city: City) => number;
export default baseTrade;
