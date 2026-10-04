import { FoundCity, JoinCity } from '../Actions';
import { Settlers, Warrior } from '../Units';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import City from '@civ-clone/core-city/City';
import { Food } from '@civ-clone/civ1-world/Yields';
import Player from '@civ-clone/core-player/Player';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import action from '../Rules/Unit/action';
import canJoinCity from '../Rules/Unit/canJoinCity';
import joinCityRefusal from '../AdditionalData/joinCityRefusal';
import created from '@civ-clone/civ1-city/Rules/City/created';
import destroyed from '../Rules/Unit/destroyed';
import { expect } from 'chai';
import foodStorage from '@civ-clone/civ1-city/Rules/City/food-storage';
import grow from '@civ-clone/civ1-city/Rules/City/grow';
import growthCost from '@civ-clone/civ1-city/Rules/City/growth-cost';
import setUpCity from '@civ-clone/civ1-city/tests/lib/setUpCity';

describe('JoinCity', (): void => {
  const ruleRegistry = new RuleRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    cityRegistry = new CityRegistry(),
    playerWorldRegistry = new PlayerWorldRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    transportRegistry = new TransportRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry(),
    unitRegistry = new UnitRegistry(),
    workedTileRegistry = new WorkedTileRegistry(ruleRegistry),
    createCity = (size: number, player?: Player): Promise<City> =>
      setUpCity({
        size,
        player,
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry,
      }),
    createUnit = (
      city: City,
      UnitType: typeof Unit = Settlers,
      player: Player = city.player()
    ): Unit => {
      const unit = new UnitType(city, player, city.tile(), ruleRegistry);

      unit.moves().set(1);
      unitRegistry.register(unit);

      return unit;
    },
    actionsOf = (unit: Unit, ActionType: typeof UnitAction): UnitAction[] =>
      unit
        .actions()
        .filter((action: UnitAction): boolean => action instanceof ActionType);

  ruleRegistry.register(
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry,
      playerWorldRegistry,
      ruleRegistry,
      undefined,
      undefined,
      workedTileRegistry
    ),
    ...foodStorage(),
    ...grow(cityGrowthRegistry, playerWorldRegistry, workedTileRegistry),
    ...growthCost(),
    ...action(
      undefined,
      cityRegistry,
      ruleRegistry,
      tileImprovementRegistry,
      unitImprovementRegistry,
      unitRegistry,
      undefined,
      transportRegistry,
      undefined,
      undefined,
      workedTileRegistry,
      undefined,
      undefined,
      cityGrowthRegistry
    ),
    ...canJoinCity(cityGrowthRegistry),
    ...destroyed(
      unitRegistry,
      unitImprovementRegistry,
      undefined,
      transportRegistry
    )
  );

  it('should let Settlers join their own city of size 9, making it size 10', async (): Promise<void> => {
    const city = await createCity(9),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      unit = createUnit(city),
      [joinCity] = actionsOf(unit, JoinCity);

    cityGrowth.add(new Food(35));

    // Checked by class, not compared: a chai diff of an action walks the whole game it belongs to.
    expect(joinCity instanceof JoinCity).to.true;
    expect(city.tilesWorked().length).to.equal(10);

    unit.action(joinCity);

    expect(cityGrowth.size()).to.equal(10);
    expect(unit.destroyed()).to.true;
    expect(unitRegistry.getByTile(city.tile()).length).to.equal(0);
    // The new citizen works a tile...
    expect(city.tilesWorked().length).to.equal(11);
    // ...the next size costs more...
    expect(cityGrowth.cost().value()).to.equal(110);
    // ...and the food box is as it was.
    expect(cityGrowth.progress().value()).to.equal(35);
  });

  it('should not let Settlers join their own city of size 10', async (): Promise<void> => {
    const city = await createCity(10),
      unit = createUnit(city);

    expect(actionsOf(unit, JoinCity).length).to.equal(0);
  });

  it("should not let Settlers join another player's city", async (): Promise<void> => {
    const city = await createCity(5),
      unit = createUnit(city, Settlers, new Player(ruleRegistry));

    expect(actionsOf(unit, JoinCity).length).to.equal(0);
  });

  it('should not let a unit that is not Settlers join a city', async (): Promise<void> => {
    const city = await createCity(5),
      unit = createUnit(city, Warrior);

    expect(actionsOf(unit, JoinCity).length).to.equal(0);
  });

  it('should not let Settlers join a city without moves left', async (): Promise<void> => {
    const city = await createCity(5),
      unit = createUnit(city);

    unit.moves().set(0);

    expect(actionsOf(unit, JoinCity).length).to.equal(0);
  });

  it('should offer only `JoinCity` in a city, and only `FoundCity` outside one', async (): Promise<void> => {
    const city = await createCity(5),
      inCity = createUnit(city),
      outside = createUnit(city);

    outside.setTile(city.tile().getNeighbour('e'));

    expect(actionsOf(inCity, JoinCity).length).to.equal(1);
    expect(actionsOf(inCity, FoundCity).length).to.equal(0);
    expect(actionsOf(outside, FoundCity).length).to.equal(1);
    expect(actionsOf(outside, JoinCity).length).to.equal(0);
  });

  describe('joinCityRefusal', (): void => {
    const [refusal] = joinCityRefusal(cityRegistry, cityGrowthRegistry),
      refusalOf = (unit: Unit) => refusal.data(unit);

    it('should say Settlers in their own city of size 10 are refused because it is too large', async (): Promise<void> => {
      const city = await createCity(10),
        unit = createUnit(city);

      expect(refusalOf(unit)).to.eql({ reason: 'too-large', size: 10 });
    });

    it('should refuse nothing in a city Settlers can join', async (): Promise<void> => {
      const city = await createCity(9),
        unit = createUnit(city);

      expect(refusalOf(unit)).to.null;
    });

    it("should refuse nothing in another player's city", async (): Promise<void> => {
      const city = await createCity(10),
        unit = createUnit(city, Settlers, new Player(ruleRegistry));

      expect(refusalOf(unit)).to.null;
    });

    it('should refuse nothing to a unit that is not Settlers', async (): Promise<void> => {
      const city = await createCity(10),
        unit = createUnit(city, Warrior);

      expect(refusalOf(unit)).to.null;
    });

    it('should refuse nothing outside a city', async (): Promise<void> => {
      const city = await createCity(10),
        unit = createUnit(city);

      unit.setTile(city.tile().getNeighbour('e'));

      expect(refusalOf(unit)).to.null;
    });
  });
});
