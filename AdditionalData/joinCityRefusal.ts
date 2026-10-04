import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import { joinCitySizeLimit, tooLargeToJoin } from '../Rules/Unit/canJoinCity';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import { Settlers } from '../Units';
import Unit from '@civ-clone/core-unit/Unit';

export type JoinCityRefusal = { reason: 'too-large'; size: number };

/**
 * Why a unit standing in one of its player's cities isn't offered `JoinCity`, so a renderer can say so (as v474.05's
 * `*ADDCITY` warning does) without knowing the rule (civ-clone/web-renderer#279). `null` when there is nothing to
 * explain: the unit can join, isn't a kind that joins, or isn't in one of its player's cities.
 */
export const getAdditionalData = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): AdditionalData[] => [
  new AdditionalData(
    Unit,
    'joinCityRefusal',
    (unit: Unit): JoinCityRefusal | null => {
      if (!(unit instanceof Settlers)) {
        return null;
      }

      const city = cityRegistry.getByTile(unit.tile());

      if (
        city === null ||
        city.player() !== unit.player() ||
        !tooLargeToJoin(city, cityGrowthRegistry)
      ) {
        return null;
      }

      return { reason: 'too-large', size: joinCitySizeLimit };
    }
  ),
];

export default getAdditionalData;
