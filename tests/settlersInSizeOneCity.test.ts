import { Settlers, Warrior } from '../Units';
import Buildable from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';
import settlersInSizeOneCity from '../lib/settlersInSizeOneCity';
import traits from '../Rules/Unit/traits';

// A unit that is Settlers too, as a ruleset might add.
class Colonists extends Settlers {}

// What `settlersInSizeOneCity` asks of a city: only its size, so a stand-in will do.
const city = {},
  cityBuild = { city: () => city } as unknown as CityBuild,
  cityGrowthRegistry = (size: number): CityGrowthRegistry =>
    ({
      getByCity: () => ({ size: () => size }),
    } as unknown as CityGrowthRegistry),
  asks = (
    size: number,
    ruleRegistry: RuleRegistry | undefined,
    UnitType: typeof Settlers | typeof Warrior
  ): boolean =>
    settlersInSizeOneCity(cityGrowthRegistry(size), ruleRegistry)(
      cityBuild,
      UnitType as unknown as typeof Buildable
    );

describe('settlersInSizeOneCity', (): void => {
  it('should ask the given rules which types found cities', (): void => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(...traits());

    expect(asks(1, ruleRegistry, Settlers)).true;
    expect(asks(1, ruleRegistry, Colonists)).true;
    expect(asks(1, ruleRegistry, Warrior)).false;
    expect(asks(2, ruleRegistry, Settlers)).false;
  });

  it("should follow the rules when Settlers don't found cities", (): void => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(...traits());
    ruleRegistry.disableById('civ1-unit:unit/trait/Settlers/FoundsCities');

    expect(asks(1, ruleRegistry, Settlers)).false;
  });

  it('should be the Settlers class, as before, without rules to ask', (): void => {
    expect(asks(1, undefined, Settlers)).true;
    expect(asks(1, undefined, Colonists)).true;
    expect(asks(1, undefined, Warrior)).false;
    expect(asks(2, undefined, Settlers)).false;
  });
});
