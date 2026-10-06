import {
  BribeUnit,
  EstablishEmbassy,
  IndustrialSabotage,
  InciteRevolt,
  InvestigateCity,
  MeetWithKing,
  SneakInciteRevolt,
  SneakStealTechnology,
  StealTechnology,
  SubvertCity,
} from '../Actions';
import { Bomber, Chariot, Diplomat, Settlers, Warrior } from '../Units';
import { Fortified, Veteran } from '../UnitImprovements';
import { Gold, Production } from '@civ-clone/library-city/Yields';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import { Palace, Temple } from '@civ-clone/library-city/CityImprovements';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AdvanceStolen from '@civ-clone/base-unit-action-steal-technology/AdvanceStolen';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import CivilDisorder from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import Effect from '@civ-clone/core-rule/Effect';
import Embassy from '@civ-clone/base-unit-action-establish-embassy/Embassy';
import Engine from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import PlayerTreasuryRegistry from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import action from '../Rules/Unit/action';
import buildCost from '../Rules/City/buildCost';
import cityCaptured from '../Rules/City/captured';
import created from '../Rules/Unit/created';
import destroyed from '../Rules/Unit/destroyed';
import diplomat from '../Rules/Unit/diplomat';
import { expect } from 'chai';
import { bribeCost, inciteCost } from '../lib/diplomatCosts';
import moved from '../Rules/Unit/moved';
import transferred from '../Rules/Unit/transferred';
import turnEnd, { turnsAloftKey } from '../Rules/Player/turnEnd';
import StrategyNote from '@civ-clone/core-strategy/StrategyNote';
import StrategyNoteRegistry from '@civ-clone/core-strategy/StrategyNoteRegistry';
import TurnEnd from '@civ-clone/core-player/Rules/TurnEnd';
import lostAtSea from '../Rules/Unit/lostAtSea';
import unitYield from '../Rules/Unit/yield';

class Alphabet extends Advance {}
class Writing extends Advance {}

describe('Diplomats', (): void => {
  let ruleRegistry: RuleRegistry,
    cityBuildRegistry: CityBuildRegistry,
    cityGrowthRegistry: CityGrowthRegistry,
    cityImprovementRegistry: CityImprovementRegistry,
    cityRegistry: CityRegistry,
    interactionRegistry: InteractionRegistry,
    playerResearchRegistry: PlayerResearchRegistry,
    playerTreasuryRegistry: PlayerTreasuryRegistry,
    unitImprovementRegistry: UnitImprovementRegistry,
    unitRegistry: UnitRegistry,
    strategyNoteRegistry: StrategyNoteRegistry,
    events: any[][],
    random: number[],
    world: World;

  const addPlayer = (gold = 0, ...advances: (typeof Advance)[]): Player => {
      const player = new Player(),
        treasury = new PlayerTreasury(player, Gold, undefined, ruleRegistry),
        research = new PlayerResearch(
          player,
          new AdvanceRegistry(),
          ruleRegistry
        );

      treasury.add(gold);
      advances.forEach((AdvanceType) => research.addAdvance(AdvanceType));

      playerTreasuryRegistry.register(treasury);
      playerResearchRegistry.register(research);

      return player;
    },
    gold = (player: Player): number =>
      playerTreasuryRegistry.getByPlayerAndType(player, Gold).value(),
    addCity = (player: Player, tile: Tile, size = 1): City => {
      const city = new City(player, tile, '', ruleRegistry),
        cityGrowth = new CityGrowth(city, ruleRegistry);

      cityRegistry.register(city);
      cityGrowthRegistry.register(cityGrowth);
      cityBuildRegistry.register(
        new CityBuild(city, new AvailableCityBuildItemsRegistry(), ruleRegistry)
      );

      while (cityGrowth.size() < size) {
        cityGrowth.grow();
      }

      return city;
    },
    addUnit = (
      UnitType: typeof Unit,
      player: Player,
      tile: Tile,
      city: City | null = null
    ): Unit => {
      const unit = new UnitType(city, player, tile, ruleRegistry);

      unit.moves().set(1);

      return unit;
    },
    actionsOf = (unit: Unit, tile: Tile): string[] =>
      unit
        .actions(tile)
        .map((unitAction: UnitAction): string => unitAction.constructor.name),
    find = <T>(
      unit: Unit,
      tile: Tile,
      ActionType: new (...args: any[]) => T
    ): T =>
      unit
        .actions(tile)
        .find((unitAction) => unitAction instanceof ActionType) as unknown as T,
    makePeace = (a: Player, b: Player): void =>
      interactionRegistry.register(new Peace(a, b, ruleRegistry));

  beforeEach(async (): Promise<void> => {
    ruleRegistry = new RuleRegistry();
    cityBuildRegistry = new CityBuildRegistry();
    cityGrowthRegistry = new CityGrowthRegistry();
    cityImprovementRegistry = new CityImprovementRegistry();
    cityRegistry = new CityRegistry();
    interactionRegistry = new InteractionRegistry();
    playerResearchRegistry = new PlayerResearchRegistry();
    playerTreasuryRegistry = new PlayerTreasuryRegistry();
    unitImprovementRegistry = new UnitImprovementRegistry();
    unitRegistry = new UnitRegistry();
    strategyNoteRegistry = new StrategyNoteRegistry();
    events = [];
    random = [];

    world = new World(new FillGenerator(30, 40, Grassland), ruleRegistry);

    await world.build();

    const engine = {
        emit: (...args: any[]) => events.push(args),
      } as unknown as Engine,
      rng = () => (random.length ? random.shift()! : 0);

    ruleRegistry.register(
      ...action(
        undefined,
        cityRegistry,
        ruleRegistry,
        undefined,
        unitImprovementRegistry,
        unitRegistry,
        undefined,
        undefined,
        undefined,
        interactionRegistry,
        undefined,
        undefined,
        undefined,
        cityGrowthRegistry,
        undefined,
        cityBuildRegistry,
        cityImprovementRegistry,
        playerResearchRegistry,
        playerTreasuryRegistry
      ),
      ...diplomat(
        cityBuildRegistry,
        cityImprovementRegistry,
        cityRegistry,
        interactionRegistry,
        playerResearchRegistry,
        playerTreasuryRegistry,
        ruleRegistry,
        undefined,
        engine,
        rng
      ),
      ...cityCaptured(cityRegistry, unitRegistry, cityGrowthRegistry),
      ...transferred(unitImprovementRegistry, engine, strategyNoteRegistry),
      ...turnEnd(
        unitRegistry,
        cityRegistry,
        undefined,
        strategyNoteRegistry,
        ruleRegistry
      ),
      ...lostAtSea(engine),
      ...created(unitRegistry, engine),
      ...destroyed(unitRegistry, unitImprovementRegistry, engine),
      ...moved(
        undefined,
        ruleRegistry,
        rng,
        engine,
        cityRegistry,
        undefined,
        interactionRegistry,
        unitRegistry
      ),
      ...buildCost(),
      ...unitYield(unitImprovementRegistry, ruleRegistry)
    );
  });

  describe('next to a rival city', (): void => {
    it('should be offered every Diplomat action, whether or not the city is defended', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0, Alphabet),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      addUnit(Warrior, rival, city.tile());

      expect(actionsOf(diplomatUnit, city.tile())).to.include.members([
        'EstablishEmbassy',
        'InvestigateCity',
        'StealTechnology',
        'IndustrialSabotage',
        'InciteRevolt',
        'MeetWithKing',
      ]);
      expect(actionsOf(diplomatUnit, city.tile())).to.not.include.members([
        'Attack',
        'CaptureCity',
      ]);
    });

    it('should not be offered anything on its own city, from a ship, or to anything but a Diplomat', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0, Alphabet),
        own = addCity(player, world.get(10, 10)),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5)),
        warrior = addUnit(Warrior, player, world.get(4, 4));

      expect(
        actionsOf(addUnit(Diplomat, player, world.get(9, 10)), own.tile())
      ).to.not.include('IndustrialSabotage');
      expect(actionsOf(warrior, city.tile())).to.not.include(
        'IndustrialSabotage'
      );

      world.get(4, 5).setTerrain(new Ocean());

      expect(actionsOf(diplomatUnit, city.tile())).to.deep.equal([]);
    });

    it('should not be offered stealing from a city already robbed, or with nothing new to take', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0, Alphabet),
        poor = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        poorCity = addCity(poor, world.get(5, 10)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      expect(actionsOf(diplomatUnit, city.tile())).to.include(
        'StealTechnology'
      );

      interactionRegistry.register(
        new AdvanceStolen(addPlayer(0), rival, city, ruleRegistry) as never
      );

      expect(actionsOf(diplomatUnit, city.tile())).to.not.include(
        'StealTechnology'
      );
      expect(
        actionsOf(addUnit(Diplomat, player, world.get(4, 10)), poorCity.tile())
      ).to.not.include('StealTechnology');
    });

    it('should not be offered inciting a capital', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      cityImprovementRegistry.register(new Palace(city, ruleRegistry));

      expect(actionsOf(diplomatUnit, city.tile())).to.not.include(
        'InciteRevolt'
      );
    });

    it('should be offered the sneak versions, and subverting, at peace', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0, Alphabet),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      makePeace(player, rival);

      expect(actionsOf(diplomatUnit, city.tile())).to.include.members([
        'SneakStealTechnology',
        'SneakInciteRevolt',
        'SubvertCity',
        'IndustrialSabotage',
      ]);
      expect(actionsOf(diplomatUnit, city.tile())).to.not.include.members([
        'StealTechnology',
        'InciteRevolt',
      ]);
    });
  });

  describe('the cost of a revolt', (): void => {
    it('should be (gold + 1000) / (distance + 3) × size, halved in disorder, with 16 for no Palace', (): void => {
      const rival = addPlayer(200),
        capital = addCity(rival, world.get(5, 5)),
        city = addCity(rival, world.get(10, 5), 6);

      cityImprovementRegistry.register(new Palace(capital, ruleRegistry));

      const cost = () =>
        inciteCost(
          city,
          cityGrowthRegistry,
          cityImprovementRegistry,
          playerTreasuryRegistry,
          ruleRegistry
        );

      // Distance 5: 1200 / 8 × 6.
      expect(cost()).to.equal(900);

      ruleRegistry.register(new CivilDisorder(new Effect(() => true)));

      expect(cost()).to.equal(450);

      cityImprovementRegistry
        .getByCity(capital)
        .forEach((palace) => palace.destroy());

      // Distance 16: floor(1200 / 19) × 6 = 63 × 6, halved.
      expect(cost()).to.equal(189);
    });

    it('should offer subverting at double the cost', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(200),
        city = addCity(rival, world.get(5, 5), 2),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      makePeace(player, rival);

      expect(find(diplomatUnit, city.tile(), SubvertCity).cost()).to.equal(
        find(diplomatUnit, city.tile(), SneakInciteRevolt).cost() * 2
      );
    });
  });

  describe('the cost of a bribe', (): void => {
    it('should be (gold + 750) / (distance + 2) × build cost / 10, halved unless Settlers', (): void => {
      const rival = addPlayer(0),
        chariot = addUnit(Chariot, rival, world.get(5, 5)),
        settlers = addUnit(Settlers, rival, world.get(8, 8)),
        cost = (unit: Unit) =>
          bribeCost(
            unit,
            cityImprovementRegistry,
            playerTreasuryRegistry,
            ruleRegistry
          );

      // No Palace, so distance 16: floor(750 / 18) = 41. Both cost 40 to build, so only the halving differs.
      expect(cost(chariot)).to.equal((41 * 4) / 2);
      expect(cost(settlers)).to.equal(41 * 4);
    });
  });

  describe('stealing', (): void => {
    it('should take an advance the victim has and the thief lacks, once per city, and use the Diplomat up', (): void => {
      const player = addPlayer(0, Alphabet),
        rival = addPlayer(0, Alphabet, Writing),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      find(diplomatUnit, city.tile(), StealTechnology).perform();

      expect(playerResearchRegistry.getByPlayer(player).completed(Writing)).to
        .true;
      expect(diplomatUnit.destroyed()).to.true;
      expect(
        events.find(([event]) => event === 'player:advance-stolen')
      ).to.deep.equal(['player:advance-stolen', player, rival, Writing, city]);
      expect(
        actionsOf(addUnit(Diplomat, addPlayer(0), world.get(4, 4)), city.tile())
      ).to.not.include('StealTechnology');
    });

    it('should end the peace when stealing at peace', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0, Alphabet),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      makePeace(player, rival);

      find(diplomatUnit, city.tile(), SneakStealTechnology).perform();

      expect(
        interactionRegistry
          .getByPlayers(player, rival)
          .some(
            (interaction) =>
              interaction instanceof Peace && interaction.active()
          )
      ).to.false;
    });
  });

  describe('sabotage', (): void => {
    it('should destroy an improvement (never the Palace) or empty the shield box, and use the Diplomat up', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        palace = new Palace(city, ruleRegistry),
        temple = new Temple(city, ruleRegistry),
        cityBuild = cityBuildRegistry.getByCity(city);

      cityImprovementRegistry.register(palace, temple);
      cityBuild.add(new Production(10));

      // 0.4 < 0.5: an improvement, and the only one it can pick is the Temple.
      random.push(0.4, 0);

      const first = addUnit(Diplomat, player, world.get(4, 5));

      find(first, city.tile(), IndustrialSabotage).perform();

      expect(temple.destroyed()).to.true;
      expect(palace.destroyed()).to.false;
      expect(cityBuild.progress().value()).to.equal(10);
      expect(first.destroyed()).to.true;

      // Nothing left to destroy: the shield box is emptied.
      find(
        addUnit(Diplomat, player, world.get(4, 5)),
        city.tile(),
        IndustrialSabotage
      ).perform();

      expect(cityBuild.progress().value()).to.equal(0);
    });
  });

  describe('inciting a revolt', (): void => {
    it('should cost gold, take the city, and bring the nearby units over', (): void => {
      const player = addPlayer(1000),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5), 3),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5)),
        garrison = addUnit(Warrior, rival, city.tile(), city),
        nearby = addUnit(Chariot, rival, world.get(6, 6), city),
        away = addUnit(Warrior, rival, world.get(9, 9), city),
        incite = find(diplomatUnit, city.tile(), InciteRevolt),
        cost = incite.cost();

      unitImprovementRegistry.register(
        new Veteran(nearby),
        new Fortified(garrison)
      );

      incite.perform();

      expect(city.player()).to.equal(player);
      expect(gold(player)).to.equal(1000 - cost);
      expect(diplomatUnit.destroyed()).to.true;
      expect([garrison, nearby].map((unit) => unit.player())).to.deep.equal([
        player,
        player,
      ]);
      expect([garrison, nearby].map((unit) => unit.city())).to.deep.equal([
        city,
        city,
      ]);
      expect(away.player()).to.equal(rival);
      expect(unitImprovementRegistry.getByUnit(nearby)).to.deep.equal([]);
      expect(unitImprovementRegistry.getByUnit(garrison)).to.deep.equal([]);
      expect(nearby.moves().value()).to.equal(0);
      expect(events.map(([event]) => event)).to.include('city:incited');
    });

    it('should leave the defectors from a city of size 1, which the capture destroys, with no home', (): void => {
      const player = addPlayer(1000),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5)),
        garrison = addUnit(Warrior, rival, city.tile(), city);

      find(diplomatUnit, city.tile(), InciteRevolt).perform();

      expect(garrison.player()).to.equal(player);
      expect(garrison.city()).to.null;
    });

    it('should do nothing, and keep the Diplomat, without the gold', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(5000),
        city = addCity(rival, world.get(5, 5), 3),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      find(diplomatUnit, city.tile(), InciteRevolt).perform();

      expect(city.player()).to.equal(rival);
      expect(diplomatUnit.destroyed()).to.false;
    });
  });

  describe('bribery', (): void => {
    it('should be offered for a lone unit outside a city, and not a stack', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      addUnit(Chariot, rival, world.get(5, 5));

      expect(actionsOf(diplomatUnit, world.get(5, 5))).to.include('BribeUnit');

      addUnit(Warrior, rival, world.get(5, 5));

      expect(actionsOf(diplomatUnit, world.get(5, 5))).to.not.include(
        'BribeUnit'
      );
    });

    it('should hand the unit over, homed in the nearest city if it is the briber’s, and keep the Diplomat', (): void => {
      const player = addPlayer(1000),
        rival = addPlayer(0),
        own = addCity(player, world.get(2, 5)),
        far = addCity(rival, world.get(20, 20)),
        chariot = addUnit(Chariot, rival, world.get(5, 5), far),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5)),
        bribe = find(diplomatUnit, world.get(5, 5), BribeUnit);

      bribe.perform();

      expect(chariot.player()).to.equal(player);
      expect(chariot.city()).to.equal(own);
      expect(gold(player)).to.equal(1000 - bribe.cost());
      expect(diplomatUnit.destroyed()).to.false;
      expect(diplomatUnit.moves().value()).to.equal(1);
      expect(events.map(([event]) => event)).to.include.members([
        'unit:bribed',
        'unit:transferred',
      ]);
    });

    it("should give a bribed aircraft full fuel, so it isn't lost at the end of the briber's turn", (): void => {
      const player = addPlayer(5000),
        rival = addPlayer(0),
        bomber = addUnit(Bomber, rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      // A turn out already: one more turn's end away from a city would be its last.
      strategyNoteRegistry.replace(new StrategyNote(turnsAloftKey(bomber), 1));

      find(diplomatUnit, world.get(5, 5), BribeUnit).perform();

      ruleRegistry.process(TurnEnd, player);

      expect(bomber.player()).to.equal(player);
      expect(bomber.destroyed()).to.false;
    });

    it('should leave a bribed unit with no home when the nearest city isn’t the briber’s', (): void => {
      const player = addPlayer(1000),
        rival = addPlayer(0),
        rivalCity = addCity(rival, world.get(7, 5)),
        chariot = addUnit(Chariot, rival, world.get(5, 5), rivalCity),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      addCity(player, world.get(20, 20));

      find(diplomatUnit, world.get(5, 5), BribeUnit).perform();

      expect(chariot.player()).to.equal(player);
      expect(chariot.city()).to.null;
    });
  });

  describe('embassies', (): void => {
    it('should establish a one-way embassy, use the Diplomat up, and not be offered again', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      find(diplomatUnit, city.tile(), EstablishEmbassy).perform();

      const [embassy] = interactionRegistry
        .getByPlayers(player, rival)
        .filter(
          (interaction) => interaction instanceof Embassy
        ) as unknown as Embassy[];

      expect(embassy.holder()).to.equal(player);
      expect(embassy.host()).to.equal(rival);
      expect(diplomatUnit.destroyed()).to.true;
      expect(
        events.find(([event]) => event === 'player:embassy-established')
      ).to.deep.equal(['player:embassy-established', player, rival]);
      expect(
        actionsOf(addUnit(Diplomat, player, world.get(4, 4)), city.tile())
      ).to.not.include('EstablishEmbassy');

      // The host has no embassy with the holder.
      const ownCity = addCity(player, world.get(10, 10));

      expect(
        actionsOf(addUnit(Diplomat, rival, world.get(9, 10)), ownCity.tile())
      ).to.include('EstablishEmbassy');
    });

    it('should be offered at peace, and leave the peace in place', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      makePeace(player, rival);

      find(diplomatUnit, city.tile(), EstablishEmbassy).perform();

      expect(
        interactionRegistry
          .getByPlayers(player, rival)
          .some(
            (interaction) =>
              interaction instanceof Peace && interaction.active()
          )
      ).to.true;
    });
  });

  describe('investigating a city', (): void => {
    it('should tell the client and use the Diplomat up', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      find(diplomatUnit, city.tile(), InvestigateCity).perform();

      expect(diplomatUnit.destroyed()).to.true;
      expect(
        events.find(([event]) => event === 'city:investigated')
      ).to.deep.equal(['city:investigated', city, player]);
    });
  });

  describe('meeting the king', (): void => {
    it('should tell the client, and leave the Diplomat where it is with no moves', (): void => {
      const player = addPlayer(0),
        rival = addPlayer(0),
        city = addCity(rival, world.get(5, 5)),
        diplomatUnit = addUnit(Diplomat, player, world.get(4, 5));

      find(diplomatUnit, city.tile(), MeetWithKing).perform();

      expect(diplomatUnit.destroyed()).to.false;
      expect(diplomatUnit.tile()).to.equal(world.get(4, 5));
      expect(diplomatUnit.moves().value()).to.equal(0);
      expect(
        events.find(([event]) => event === 'player:meet-with-king')
      ).to.deep.equal(['player:meet-with-king', player, rival]);
    });
  });
});
