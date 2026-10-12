import {
  Artillery,
  Bomber,
  Catapult,
  Fighter,
  Knight,
  Sail,
  Spearman,
} from '../Units';
import { Fortified, Veteran } from '../UnitImprovements';
import {
  Grassland,
  Hills,
  Mountains,
  River,
  Swamp,
} from '@civ-clone/civ1-world/Terrains';
import { Attack } from '../Actions';
import City from '@civ-clone/core-city/City';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import { CityWalls } from '@civ-clone/library-city/CityImprovements';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import strength from '@civ-clone/core-unit/strength';
import strengthRules from '../Rules/Unit/strength';
import unitYield from '../Rules/Unit/yield';

describe('unit:strength', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      cityImprovementRegistry = new CityImprovementRegistry(),
      unitImprovementRegistry = new UnitImprovementRegistry(),
      unitRegistry = new UnitRegistry(),
      player = new Player(ruleRegistry),
      enemy = new Player(ruleRegistry),
      world = new World(new FillGenerator(5, 5, Grassland), ruleRegistry);

    ruleRegistry.register(
      ...strengthRules(
        cityRegistry,
        cityImprovementRegistry,
        unitImprovementRegistry
      ),
      ...unitYield(
        unitImprovementRegistry,
        ruleRegistry,
        new TransportRegistry()
      )
    );

    await world.build();

    const tile = world.get(2, 2),
      defend = (
        UnitType: typeof Unit,
        TerrainType: typeof Terrain = Grassland,
        UnitImprovements: (typeof UnitImprovement)[] = []
      ): Unit => {
        tile.setTerrain(new TerrainType());

        const unit = new UnitType(null, player, tile, ruleRegistry);

        UnitImprovements.forEach((UnitImprovementType): void =>
          unitImprovementRegistry.register(new UnitImprovementType(unit))
        );

        unitRegistry.register(unit);

        return unit;
      },
      attackWith = (UnitType: typeof Unit): Unit => {
        const unit = new UnitType(null, enemy, world.get(2, 3), ruleRegistry);

        unitRegistry.register(unit);

        return unit;
      },
      buildCity = (walls: boolean = false): City => {
        const city = new City(player, tile, 'City', ruleRegistry);

        cityRegistry.register(city);

        if (walls) {
          cityImprovementRegistry.register(new CityWalls(city, ruleRegistry));
        }

        return city;
      },
      defenceOf = (defender: Unit, attacker: Unit): number =>
        strength(attacker, defender, ruleRegistry)[1].value();

    return {
      attackWith,
      buildCity,
      defend,
      defenceOf,
      ruleRegistry,
      tile,
      unitRegistry,
    };
  };

  (
    [
      [Grassland, 2],
      [Swamp, 3],
      [River, 3],
      [Hills, 4],
      [Mountains, 6],
    ] as [typeof Terrain, number][]
  ).forEach(([TerrainType, expected]): void => {
    it(`should give a Spearman (2) on ${TerrainType.name} a defence of ${expected}`, async (): Promise<void> => {
      const { attackWith, defend, defenceOf } = await setUp();

      expect(
        defenceOf(defend(Spearman, TerrainType), attackWith(Knight))
      ).equal(expected);
    });
  });

  it('should give a fortified unit ×1.5, after its terrain', async (): Promise<void> => {
    const { attackWith, defend, defenceOf } = await setUp();

    expect(
      defenceOf(defend(Spearman, Hills, [Fortified]), attackWith(Knight))
    ).equal(6);
  });

  it('should apply Veteran on top', async (): Promise<void> => {
    const { attackWith, defend, defenceOf } = await setUp();

    expect(
      defenceOf(
        defend(Spearman, Hills, [Fortified, Veteran]),
        attackWith(Knight)
      )
    ).equal(9);
  });

  it('should give a unit in a city with City Walls ×3 instead of fortified, and say why', async (): Promise<void> => {
    const { attackWith, buildCity, defend, ruleRegistry } = await setUp(),
      defender = defend(Spearman, Hills, [Fortified]);

    buildCity(true);

    const [, defence] = strength(attackWith(Knight), defender, ruleRegistry);

    expect(defence.value()).equal(12);
    expect(defence.values()).deep.include([2, 'Hills']);
    expect(defence.values()).deep.include([8, 'CityWalls']);
    expect(defence.values().map(([, provider]) => provider)).not.include(
      'Fortified'
    );
  });

  it('should not count City Walls against Artillery or a Bomber, leaving the fortified bonus', async (): Promise<void> => {
    const { attackWith, buildCity, defend, defenceOf } = await setUp(),
      defender = defend(Spearman, Grassland, [Fortified]);

    buildCity(true);

    expect(defenceOf(defender, attackWith(Catapult))).equal(6);
    expect(defenceOf(defender, attackWith(Artillery))).equal(3);
    expect(defenceOf(defender, attackWith(Bomber))).equal(3);
  });

  it('should not fortify a unit in a city without walls automatically', async (): Promise<void> => {
    const { attackWith, buildCity, defend, defenceOf } = await setUp(),
      defender = defend(Spearman);

    buildCity();

    expect(defenceOf(defender, attackWith(Knight))).equal(2);
  });

  it('should give a ship no terrain or fortified bonus, except in a city with City Walls, where it gets terrain × walls', async (): Promise<void> => {
    const { attackWith, buildCity, defend, defenceOf } = await setUp(),
      defender = defend(Sail, Hills, [Fortified]);

    expect(defenceOf(defender, attackWith(Knight))).equal(1);

    buildCity(true);

    // v474.05's walls branch gives any defender but an aircraft terrain × defence × 3: Hills (×2) × Sail (1) × 3.
    expect(defenceOf(defender, attackWith(Knight))).equal(6);
  });

  it('should give an aircraft nothing, even in a city with City Walls', async (): Promise<void> => {
    const { attackWith, buildCity, defend, defenceOf } = await setUp(),
      defender = defend(Fighter, Hills);

    buildCity(true);

    expect(defenceOf(defender, attackWith(Knight))).equal(2);
  });

  it('should fight at these strengths when attacking', async (): Promise<void> => {
    const { attackWith, defend, ruleRegistry, tile, unitRegistry } =
        await setUp(),
      defender = defend(Spearman, Mountains),
      attacker = attackWith(Knight),
      defeated: Unit[] = [];

    ruleRegistry.register(
      new Defeated(new Effect((unit: Unit): number => defeated.push(unit)))
    );

    // The same roll for both sides: the stronger wins. A Knight (4) beats a Spearman (2) on Grassland, but not on
    //  Mountains (6).
    new Attack(
      attacker.tile(),
      tile,
      attacker,
      ruleRegistry,
      unitRegistry,
      () => 0.5
    ).perform();

    expect(defeated).deep.equal([attacker]);
  });
});
