import {
  BuildingComplete,
  ICompletedBuildItem,
} from '@civ-clone/core-city-build/Rules/BulidingComplete';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import { Settlers } from '../../Units';

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry
) => BuildingComplete[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): BuildingComplete[] => [
  new BuildingComplete(
    new Criterion(
      (cityBuild: CityBuild, buildItem: ICompletedBuildItem) =>
        buildItem instanceof Settlers
    ),
    new Effect((cityBuild: CityBuild) =>
      cityGrowthRegistry.getByCity(cityBuild.city()).shrink()
    )
  ),
];

export default getRules;
