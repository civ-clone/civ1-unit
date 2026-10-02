import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CanJoinCity from '@civ-clone/base-unit-action-join-city/Rules/CanJoinCity';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';

// Settlers can join a city only while it is under size 10. In v474.05 a larger city shows the `*ADDCITY` warning
// instead (OpenCivOne `PlayerTurn.cs`, `ActualSize < 10`).
export const joinCitySizeLimit = 10;

export const getRules = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): CanJoinCity[] => [
  new CanJoinCity(
    'civ1-unit:unit/can-join-city/size-limit',
    new Effect(
      (unit: Unit, city: City): boolean =>
        cityGrowthRegistry.getByCity(city).size() < joinCitySizeLimit
    )
  ),
];

export default getRules;
