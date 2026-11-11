import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
export type JoinCityRefusal = {
  reason: 'too-large';
  size: number;
};
/**
 * Why a unit standing in one of its player's cities isn't offered `JoinCity`, so a renderer can say so (as v474.05's
 * `*ADDCITY` warning does) without knowing the rule (civ-clone/web-renderer#279). `null` when there is nothing to
 * explain: the unit can join, isn't a kind that joins, or isn't in one of its player's cities.
 */
export declare const getAdditionalData: (
  cityRegistry?: CityRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => AdditionalData[];
export default getAdditionalData;
