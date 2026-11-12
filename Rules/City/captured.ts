import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { High } from '@civ-clone/core-rule/Priorities';
import InciteRevolt from '@civ-clone/base-unit-action-incite-revolt/InciteRevolt';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  cityRegistry?: CityRegistry,
  unitRegistry?: UnitRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => Captured[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  // No longer read: kept so that callers passing it still compile.
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): Captured[] => [
  // An incited (or subverted) city takes the old owner's units with it: those in the city and on the tiles around it
  //  that aren't cities, whatever their home, homed in the city now, at any size (civ-clone/web-renderer#58,
  //  civ-clone/web-renderer#969). v474.05 `city_revolt` (`DIPLOMAT.C`) walks all the old owner's units, and re-makes
  //  for the new owner each one on the city's square or next to it on a square that isn't a city, homed in the city:
  //
  //  ```c
  //  d = map_dist(cx, armydata[civ][m].x, cy, armydata[civ][m].y);
  //  if (armydata[civ][m].type != -1 && d <= 1 && (d == 0 || !(map_flags(armydata[civ][m].x, armydata[civ][m].y) & 1))) {
  //      ...
  //      new_unit = create_unit(new_owner, type, armydata[civ][m].x, armydata[civ][m].y);
  //      if (new_unit != -1) {
  //          armydata[new_owner][new_unit].visibility |= (1 << civ);
  //          armydata[new_owner][new_unit].home_city = city_id;
  //  ```
  //
  //  and never destroys the city it then captures (`capunit(new_owner, city_id, 1L)`, `CAPTURE.C`: one of size 1 isn't
  //  shrunk), which `civ1-city`'s `city/captured/shrink` follows since civ-clone/civ1-city#23. With a civ1-city from before it, an incited
  //  city of size 1 is destroyed, and its defectors, homed there, with it. High priority, so they have changed sides
  //  before the city's other supported units are disbanded (`civ1-city`'s `city/captured/destroy-supported-units`).
  new Captured(
    'civ1-unit:city/captured/defecting-units',
    new High(),
    new Criterion(
      (city: City, capturingPlayer: Player, originalPlayer: Player, cause) =>
        cause instanceof InciteRevolt
    ),
    new Effect(
      (city: City, capturingPlayer: Player, originalPlayer: Player): void =>
        [
          city.tile(),
          ...city
            .tile()
            .getNeighbours()
            .filter(
              (tile: Tile): boolean => cityRegistry.getByTile(tile) === null
            ),
        ]
          .flatMap((tile: Tile): Unit[] => unitRegistry.getByTile(tile))
          .filter((unit: Unit): boolean => unit.player() === originalPlayer)
          .forEach((unit: Unit): void => unit.transfer(capturingPlayer, city))
    )
  ),
];

export default getRules;
