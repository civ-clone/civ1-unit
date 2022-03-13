import { Spearman, Warrior } from '../Units';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import buildCost from '../Rules/City/buildCost';
import { expect } from 'chai';
import setUpCity from '@civ-clone/civ1-city/tests/lib/setUpCity';

describe('CityBuild:build', () => {
  it('should include the expected `Unit`s', async () => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry();

    availableBuildItemsRegistry.register(
      Warrior as unknown as typeof Buildable
    );

    ruleRegistry.register(...buildCost());

    const cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      available = cityBuild.available();

    expect(available).length(1);

    expect(available[0].item()).equal(Warrior);
    expect(available[0].cost().value()).equal(10);

    availableBuildItemsRegistry.register(
      Spearman as unknown as typeof Buildable
    );

    const updatedAvailable = cityBuild.available();

    expect(updatedAvailable).length(2);

    expect(updatedAvailable[0].item()).equal(Warrior);
    expect(updatedAvailable[1].item()).equal(Spearman);
    expect(updatedAvailable[1].cost().value()).equal(20);
  });
});
