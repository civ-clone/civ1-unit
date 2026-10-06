import { Trade } from '@civ-clone/library-city/Yields';
import City from '@civ-clone/core-city/City';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

let computing = false;

/**
 * Whether a `baseTrade` is being worked out. A city's trade-route yield reads its partners' `baseTrade`, which works out
 * their yields, so the route rule checks this and leaves its own routes out. Two cities routed to each other would
 * otherwise recurse.
 */
export const computingBaseTrade = (): boolean => computing;

/**
 * Civ1's `City.BaseTrade` (v474.05 `CityWorker.cs` L1270): the city's trade after corruption, leaving out what its
 * trade routes add. Civ1 reads the value stored at the city's last update; this works it out now.
 */
export const baseTrade = (city: City): number => {
  const wasComputing = computing;

  computing = true;

  try {
    // `Corruption` is a negative `Trade`, so this is already net of it.
    return Math.max(reduceYield(city.yields(), Trade), 0);
  } finally {
    computing = wasComputing;
  }
};

export default baseTrade;
