import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  Bomber,
  Carrier,
  Frigate,
  Sail,
  Spearman,
  Transport,
  Trireme,
} from '../Units';
import {
  Fortified as FortifiedImprovement,
  Veteran as VeteranImprovement,
} from '../UnitImprovements';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import created from '@civ-clone/civ1-city/Rules/City/created';
import { expect } from 'chai';
import setUpCity from '@civ-clone/civ1-city/tests/lib/setUpCity';
import unitYield from '../Rules/Unit/yield';
import unitCanStow from '../Rules/Unit/canStow';

describe('unit:yield', (): void => {
  const ruleRegistry = new RuleRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry(),
    transportRegistry = new TransportRegistry();

  ruleRegistry.register(
    ...created(tileImprovementRegistry, cityBuildRegistry),
    ...unitCanStow(),
    ...unitYield(unitImprovementRegistry, ruleRegistry, transportRegistry)
  );

  (
    [
      [Defence, [], 2],
      [Defence, [FortifiedImprovement], 4],
      [Defence, [VeteranImprovement], 3],
      [Defence, [FortifiedImprovement, VeteranImprovement], 5],
      [Attack, [], 1],
      [Attack, [FortifiedImprovement], 1],
      [Attack, [VeteranImprovement], 1.5],
      [Attack, [FortifiedImprovement, VeteranImprovement], 1.5],
    ] as [typeof Yield, typeof UnitImprovement[], number][]
  ).forEach(
    ([YieldType, UnitImprovements, expectedValue]: [
      typeof Yield,
      typeof UnitImprovement[],
      number
    ]): void => {
      it(`should modify ${YieldType.name} appropriately when improvements applied to the unit`, async (): Promise<void> => {
        const player = new Player(),
          city = await setUpCity({
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

  (
    [
      [Trireme, 2],
      [Sail, 3],
      [Frigate, 4],
      [Transport, 8],
      [Carrier, 8],
    ] as [
      (
        | typeof Trireme
        | typeof Sail
        | typeof Frigate
        | typeof Transport
        | typeof Carrier
      ),
      number
    ][]
  ).forEach(([TransportType, capacity]) =>
    it(`should be possible to store ${capacity} units on a ${TransportType.name}`, async (): Promise<void> => {
      const player = new Player(),
        city = await setUpCity({
          ruleRegistry,
        }),
        unit = new TransportType(city, player, city.tile(), ruleRegistry);

      expect(unit.capacity().value()).eq(capacity);
    })
  );

  (
    [
      [Trireme, Spearman, true],
      [Trireme, Sail, false],
      [Trireme, Bomber, false],
      [Sail, Spearman, true],
      [Sail, Sail, false],
      [Sail, Bomber, false],
      [Frigate, Spearman, true],
      [Frigate, Sail, false],
      [Frigate, Bomber, false],
      [Transport, Spearman, true],
      [Transport, Sail, false],
      [Transport, Bomber, false],
      [Carrier, Spearman, false],
      [Carrier, Sail, false],
      [Carrier, Bomber, true],
    ] as [
      (
        | typeof Trireme
        | typeof Sail
        | typeof Frigate
        | typeof Transport
        | typeof Carrier
      ),
      typeof Unit,
      boolean
    ][]
  ).forEach(([TransportType, UnitType, canStow]) =>
    it(`should${canStow ? '' : ' not'} be possible to store a ${
      UnitType.name
    } on a ${TransportType.name}`, async (): Promise<void> => {
      const player = new Player(),
        city = await setUpCity({
          ruleRegistry,
        }),
        stowingUnit = new UnitType(city, player, city.tile(), ruleRegistry),
        unit = new TransportType(city, player, city.tile(), ruleRegistry);

      expect(unit.canStow(stowingUnit)).eq(canStow);
    })
  );
});
