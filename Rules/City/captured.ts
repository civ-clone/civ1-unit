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
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): Captured[] => [
  // An incited (or subverted) city takes the old owner's units with it: those in the city and on the tiles around it
  //  that aren't cities, whatever their home, homed in the city now (v474.05 `F22_0000_0af5`). High priority, so they
  //  have changed sides before the city's other supported units are disbanded (civ-clone/web-renderer#58).
  // A captured city loses a citizen, so one of size 1 is destroyed, and everything homed in it with it. Its defectors
  //  are left with no home instead, and survive: v474.05 never destroys an incited city, as it doesn't shrink one of
  //  size 1, and the units it brings over are kept.
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
          .forEach((unit: Unit): void =>
            unit.transfer(
              capturingPlayer,
              cityGrowthRegistry.getByCity(city).size() > 1 ? city : null
            )
          )
    )
  ),
];

export default getRules;
