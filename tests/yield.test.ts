import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  Fortified as FortifiedImprovement,
  Veteran as VeteranImprovement,
} from '../UnitImprovements';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { Spearman } from '../Units';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import created from '@civ-clone/civ1-city/Rules/City/created';
import { expect } from 'chai';
import setUpCity from '@civ-clone/civ1-city/tests/lib/setUpCity';
import unitYield from '../Rules/Unit/yield';

describe('unit:yield', (): void => {
  const ruleRegistry = new RuleRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry();

  ruleRegistry.register(
    ...created(tileImprovementRegistry, cityBuildRegistry),
    ...unitYield(unitImprovementRegistry, ruleRegistry)
  );

  ([
    [Defence, [], 2],
    [Defence, [FortifiedImprovement], 4],
    [Defence, [VeteranImprovement], 3],
    [Defence, [FortifiedImprovement, VeteranImprovement], 5],
    [Attack, [], 1],
    [Attack, [FortifiedImprovement], 1],
    [Attack, [VeteranImprovement], 1.5],
    [Attack, [FortifiedImprovement, VeteranImprovement], 1.5],
  ] as [typeof Yield, typeof UnitImprovement[], number][]).forEach(
    ([YieldType, UnitImprovements, expectedValue]: [
      typeof Yield,
      typeof UnitImprovement[],
      number
    ]): void => {
      it(`should modify ${YieldType.name} appropriately when improvements applied to the unit`, (): void => {
        const player = new Player(),
          city = setUpCity({
            ruleRegistry,
          }),
          unit = new Spearman(city, player, city.tile(), ruleRegistry);

        UnitImprovements.forEach(
          (UnitImprovementType: typeof UnitImprovement): void =>
            unitImprovementRegistry.register(new UnitImprovementType(unit))
        );

        const [unitYield] = unit.yield(new YieldType());

        expect(unitYield.value()).to.equal(expectedValue);
      });
    }
  );
});
