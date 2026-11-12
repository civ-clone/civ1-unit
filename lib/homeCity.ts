import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import civ1Distance from '@civ-clone/civ1-world/lib/civ1Distance';

/**
 * The home of a unit of `player`'s that v474.05 makes at `tile`, or that changes sides there: the city nearest to it,
 * whoever's it is, or none (`null`) when that city is another player's, or there are no cities. Distance is
 * `civ1Distance`, and of two as near the first in `cityRegistry`'s order wins. `excluded`, a city that is going, is
 * left out, as it is no longer a city by then in v474.05. `create_unit` (`UNITS.C`):
 *
 * ```c
 * armydata[owner][index].home_city = near_city(x, y);
 * if (townbuf[armydata[owner][index].home_city].owner != owner)
 *     armydata[owner][index].home_city = -1;
 * ```
 *
 * and `near_city` (`CORE.C`), which walks every city slot, skipping the empty ones (a removed city's included), and
 * keeps the first of the nearest, as it only moves on for one strictly nearer:
 *
 * ```c
 * if (units[i].type == -1)
 *     goto next_unit;
 * dist = map_dist(x, (unsigned char) units[i].x, y, (unsigned char) units[i].y);
 * if (dist < min_dist) {
 * ```
 *
 * v474.05's first is the lowest slot, and a removed city's slot is filled again by the next city founded; here it is
 * the first registered, so of two cities as near, the one taken can differ from v474.05's when a city was founded in
 * a reused slot. Shared by a Diplomat's bribe (`Rules/Unit/diplomat`) and the Settlers that outlive their city
 * (`Rules/City/buildingComplete`, civ-clone/web-renderer#969).
 */
export const homeCity = (
  player: Player,
  tile: Tile,
  cityRegistry: CityRegistry = cityRegistryInstance,
  excluded: City | null = null
): City | null => {
  const nearest = cityRegistry
    .entries()
    .filter((city: City): boolean => !city.destroyed() && city !== excluded)
    .reduce(
      (nearest: City | null, city: City): City | null =>
        nearest === null ||
        civ1Distance(city.tile(), tile) < civ1Distance(nearest.tile(), tile)
          ? city
          : nearest,
      null
    );

  return nearest !== null && nearest.player() === player ? nearest : null;
};

export default homeCity;
