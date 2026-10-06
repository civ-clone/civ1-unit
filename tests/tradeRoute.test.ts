import { Caravan, Warrior } from '../Units';
import { Gold, Trade } from '@civ-clone/library-city/Yields';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import { EstablishTradeRoute } from '../Actions';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import LandMass from '@civ-clone/core-world/LandMass';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import PlayerTreasuryRegistry from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import Priority from '@civ-clone/core-rule/Priority';
import RailroadAdvance from '@civ-clone/base-science-advance-railroad/Railroad';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TradeRouteRegistry from '@civ-clone/core-city/TradeRouteRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import Wonder from '@civ-clone/core-wonder/Wonder';
import World from '@civ-clone/core-world/World';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import action from '../Rules/Unit/action';
import { civ1Distance } from '@civ-clone/civ1-world/lib/civ1Distance';
import destroyed from '../Rules/Unit/destroyed';
import { expect } from 'chai';
import tradeRouteEstablished, {
  goodsFor,
} from '../Rules/Unit/tradeRouteEstablished';
import unitYield from '../Rules/Unit/yield';

class TestWonder extends Wonder {}

describe('Trade routes', (): void => {
  let ruleRegistry: RuleRegistry,
    cityRegistry: CityRegistry,
    unitRegistry: UnitRegistry,
    landMassRegistry: LandMassRegistry,
    tradeRouteRegistry: TradeRouteRegistry,
    playerTreasuryRegistry: PlayerTreasuryRegistry,
    playerResearchRegistry: PlayerResearchRegistry,
    building: Map<City, typeof Buildable>,
    trade: Map<City, number>,
    events: any[][],
    world: World;

  const addPlayer = (): Player => {
      const player = new Player();

      playerTreasuryRegistry.register(
        new PlayerTreasury(player, Gold, undefined, ruleRegistry)
      );
      playerResearchRegistry.register(
        new PlayerResearch(player, undefined, ruleRegistry)
      );

      return player;
    },
    addCity = (player: Player, tile: Tile, tradeValue = 0): City => {
      const city = new City(player, tile, '', ruleRegistry);

      cityRegistry.register(city);
      trade.set(city, tradeValue);

      return city;
    },
    addCaravan = (home: City, tile: Tile): Unit => {
      const unit = new Caravan(home, home.player(), tile, ruleRegistry);

      unit.moves().set(1);
      unitRegistry.register(unit);

      return unit;
    },
    canTrade = (unit: Unit, to: Tile): boolean =>
      unit.actions(to).some((action) => action instanceof EstablishTradeRoute),
    // The two halves of a 40-wide map, x 0-19 and x 20-39, as two continents.
    splitIntoContinents = (): void => {
      const halves: Tile[][] = [[], []];

      world
        .entries()
        .forEach((tile) => halves[tile.x() < 20 ? 0 : 1].push(tile));

      landMassRegistry.register(...halves.map((tiles) => new LandMass(tiles)));
    };

  beforeEach(async (): Promise<void> => {
    ruleRegistry = new RuleRegistry();
    cityRegistry = new CityRegistry();
    unitRegistry = new UnitRegistry();
    landMassRegistry = new LandMassRegistry();
    tradeRouteRegistry = new TradeRouteRegistry();
    playerTreasuryRegistry = new PlayerTreasuryRegistry();
    playerResearchRegistry = new PlayerResearchRegistry();
    building = new Map();
    trade = new Map();
    events = [];

    world = new World(new FillGenerator(30, 40, Grassland), ruleRegistry);

    await world.build();

    // Each city's trade comes from the test, so `baseTrade` reads what it sets.
    ruleRegistry.register(
      new YieldRule(
        new Priority(0),
        new Effect((city: City) => new Trade(trade.get(city) ?? 0))
      ),
      ...action(
        undefined,
        cityRegistry,
        ruleRegistry,
        undefined,
        undefined,
        unitRegistry,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        landMassRegistry,
        {
          getByCity: (city: City) => ({
            building: () =>
              building.has(city) ? { item: () => building.get(city) } : null,
          }),
        } as unknown as CityBuildRegistry
      ),
      ...tradeRouteEstablished(
        tradeRouteRegistry,
        playerTreasuryRegistry,
        playerResearchRegistry,
        landMassRegistry,
        {
          emit: (...args: any[]) => events.push(args),
        } as unknown as Engine
      ),
      ...destroyed(unitRegistry, undefined, {
        emit: () => {},
      } as unknown as Engine),
      ...unitYield(undefined, ruleRegistry)
    );
  });

  describe('when a Caravan can set up a route', (): void => {
    it('should be offered for a foreign city next to it', (): void => {
      const player = addPlayer(),
        home = addCity(player, world.get(2, 2)),
        foreign = addCity(addPlayer(), world.get(5, 5)),
        caravan = addCaravan(home, world.get(4, 4));

      expect(canTrade(caravan, foreign.tile())).to.true;
    });

    it('should not be offered for a foreign city from a ship', (): void => {
      const player = addPlayer(),
        home = addCity(player, world.get(2, 2)),
        foreign = addCity(addPlayer(), world.get(5, 5)),
        caravan = addCaravan(home, world.get(4, 4));

      world.get(4, 4).setTerrain(new Ocean());

      expect(canTrade(caravan, foreign.tile())).to.false;
    });

    it('should be offered for your own city on the same continent from 10 away', (): void => {
      const player = addPlayer(),
        home = addCity(player, world.get(0, 0)),
        nine = addCity(player, world.get(9, 1)),
        ten = addCity(player, world.get(10, 1));

      splitIntoContinents();

      expect(civ1Distance(home.tile(), nine.tile())).to.equal(9);
      expect(canTrade(addCaravan(home, world.get(8, 1)), nine.tile())).to.false;
      expect(civ1Distance(home.tile(), ten.tile())).to.equal(10);
      expect(canTrade(addCaravan(home, world.get(9, 2)), ten.tile())).to.true;
    });

    it('should be offered for your own city on another continent nearby, unless it is building a Wonder', (): void => {
      const player = addPlayer(),
        home = addCity(player, world.get(18, 5)),
        other = addCity(player, world.get(21, 5)),
        caravan = addCaravan(home, world.get(20, 5));

      splitIntoContinents();

      expect(canTrade(caravan, other.tile())).to.true;

      building.set(other, TestWonder as unknown as typeof Buildable);

      expect(canTrade(caravan, other.tile())).to.false;
    });

    it('should not be offered for its home city, without a home city, or to other units', (): void => {
      const player = addPlayer(),
        home = addCity(player, world.get(2, 2)),
        foreign = addCity(addPlayer(), world.get(5, 5)),
        caravan = addCaravan(home, world.get(2, 3)),
        homeless = new Caravan(null, player, world.get(4, 4), ruleRegistry),
        warrior = new Warrior(home, player, world.get(4, 4), ruleRegistry);

      [homeless, warrior].forEach((unit) => unit.moves().set(1));

      expect(canTrade(caravan, home.tile())).to.false;
      expect(canTrade(homeless, foreign.tile())).to.false;
      expect(canTrade(warrior, foreign.tile())).to.false;
    });
  });

  describe('the goods', (): void => {
    // Distance 20, trade 10 + 14: (20 + 10) × 24 / 24 = 30.
    const sell = (
      continents: boolean,
      railroad: boolean
    ): { gold: number; research: number; unit: Unit } => {
      const player = addPlayer(),
        other = addPlayer(),
        home = addCity(player, world.get(5, 5), 10),
        foreign = addCity(other, world.get(25, 5), 14),
        caravan = addCaravan(home, world.get(24, 5));

      if (continents) {
        splitIntoContinents();
      } else {
        // One continent holding the whole world, so both cities are found on the same one.
        landMassRegistry.register(new LandMass(world.entries()));
      }

      if (railroad) {
        playerResearchRegistry.getByPlayer(other).addAdvance(RailroadAdvance);
      }

      expect(civ1Distance(home.tile(), foreign.tile())).to.equal(20);

      const [establish] = caravan
        .actions(foreign.tile())
        .filter((action) => action instanceof EstablishTradeRoute);

      establish.perform();

      return {
        gold: playerTreasuryRegistry.getByPlayerAndType(player, Gold).value(),
        research: playerResearchRegistry.getByPlayer(player).progress().value(),
        unit: caravan,
      };
    };

    it('should sell for 30 to a foreign city on another continent, into gold and research', (): void => {
      const { gold, research, unit } = sell(true, false);

      expect(gold).to.equal(30);
      expect(research).to.equal(30);
      expect(unit.destroyed()).to.true;
      expect(events.map(([event]) => event)).to.deep.equal([
        'unit:trade-route-established',
      ]);
      expect(events[0][5]).to.equal(30);
    });

    it('should sell for half on the same continent', (): void => {
      expect(sell(false, false).gold).to.equal(15);
    });

    it('should sell for a third less when the destination knows Railroad', (): void => {
      expect(sell(false, true).gold).to.equal(10);
    });
  });

  it('should pick the goods by the counter at the end of the unit id', (): void => {
    expect(
      ['Caravan-1', 'Caravan-8', 'Caravan-a', 'Caravan-1f'].map((id) =>
        goodsFor({ id: () => id } as unknown as Unit)
      )
    ).to.deep.equal(['Silver', 'Silk', 'Wine', 'Copper']);
  });

  describe('the route', (): void => {
    const establish = (home: City, to: City): void => {
      const caravan = addCaravan(home, to.tile().getNeighbour('w')),
        [action] = caravan
          .actions(to.tile())
          .filter((action) => action instanceof EstablishTradeRoute);

      action.perform();
    };

    it('should fill empty slots, then replace the least valuable route only with a better one', (): void => {
      const player = addPlayer(),
        other = addPlayer(),
        home = addCity(player, world.get(2, 2), 4),
        first = addCity(other, world.get(6, 2), 3),
        second = addCity(other, world.get(6, 6), 5),
        third = addCity(other, world.get(6, 10), 8),
        poor = addCity(other, world.get(6, 14), 2),
        rich = addCity(other, world.get(6, 18), 6);

      [first, second, third].forEach((city) => establish(home, city));

      expect(
        tradeRouteRegistry.getByCity(home).map((route) => route.to())
      ).to.deep.equal([first, second, third]);

      // Worth 2 × 2 = 4 against the lowest, 3 × 2 = 6: not kept, though the goods still sell.
      const goldBefore = playerTreasuryRegistry
        .getByPlayerAndType(player, Gold)
        .value();

      establish(home, poor);

      expect(
        tradeRouteRegistry.getByCity(home).map((route) => route.to())
      ).to.deep.equal([first, second, third]);
      expect(
        playerTreasuryRegistry.getByPlayerAndType(player, Gold).value()
      ).to.be.greaterThan(goldBefore);

      // Worth 12 against 6: replaces the first route, in its place.
      const [firstRoute] = tradeRouteRegistry.getByCity(home);

      establish(home, rich);

      expect(
        tradeRouteRegistry.getByCity(home).map((route) => route.to())
      ).to.deep.equal([rich, second, third]);
      expect(tradeRouteRegistry.getByCity(home)[0]).to.equal(firstRoute);
    });

    it('should pay again but not add a second route to the same city', (): void => {
      const player = addPlayer(),
        home = addCity(player, world.get(2, 2), 4),
        foreign = addCity(addPlayer(), world.get(6, 2), 3);

      establish(home, foreign);

      const goldBefore = playerTreasuryRegistry
        .getByPlayerAndType(player, Gold)
        .value();

      establish(home, foreign);

      expect(tradeRouteRegistry.getByCity(home)).to.have.length(1);
      expect(
        playerTreasuryRegistry.getByPlayerAndType(player, Gold).value()
      ).to.be.greaterThan(goldBefore);
    });
  });
});
