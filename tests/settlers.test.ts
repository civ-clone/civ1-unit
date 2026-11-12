import { CHIEFTAIN_SETTLERS_RULE, SETTLERS_SHRINK_CITY_RULE } from '../RuleIds';
import {
  Chieftain,
  Emperor,
  King,
  Warlord,
} from '@civ-clone/civ1-difficulty/Difficulties';
import { Settlers, Warrior } from '../Units';
import Created from '@civ-clone/core-unit/Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Veteran } from '../UnitImprovements';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Difficulty from '@civ-clone/core-difficulty/Difficulty';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import { Production } from '@civ-clone/civ1-world/Yields';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import cityBuildingComplete from '@civ-clone/civ1-city/Rules/City/building-complete';
import cityDestroyed from '@civ-clone/civ1-city/Rules/City/destroyed';
import cityShrink from '@civ-clone/civ1-city/Rules/City/shrink';
import registerUnit from '../registerRules';

// Ids, not the objects: chai prints what it compares when an assertion fails, and a city or a unit leads to the whole
//  game, which it can't print.
// A city's Barracks as civ1-city-improvement gives them: a unit made in a city is a Veteran, as it is made.
const barracks = (game: Game): void =>
  game.rules.register(
    new Created(
      new Criterion((unit: Unit): boolean => unit.city() !== null),
      new Effect((unit: Unit): void =>
        game.unitImprovements.register(new Veteran(unit))
      )
    )
  );

const isVeteran = (game: Game, unit: Unit): boolean =>
  game.unitImprovements
    .getByUnit(unit)
    .some((improvement) => improvement instanceof Veteran);

// A unit that is Settlers too, as a ruleset might add.
class Colonists extends Settlers {}

const ids = (entities: ({ id(): string } | null)[]): (string | null)[] =>
  entities.map((entity) => entity?.id() ?? null);

// Settlers completed in a city of size 1 (civ-clone/web-renderer#959), as v474.05 `CITYMGT.C`: held on Chieftain; on
//  any other level built, the city keeping its citizen when it is its player's only one, and removed otherwise, the
//  Settlers staying on its square.
describe('Settlers in a city of size 1 (civ-clone/web-renderer#959)', (): void => {
  // A game with this package's rules and civ1-city's for shrinking and destroying a city, at `level` (none set unless
  //  told), with a Grassland world and one player, whose cities are at `at`, the first building Settlers at `size`,
  //  and another player's cities at `foreign`, founded after the player's, or before with `foreignFirst`.
  const setUp = async ({
    level = null,
    size = 1,
    at = [[4, 4]],
    foreign = [],
    foreignFirst = false,
  }: {
    level?: typeof Difficulty | null;
    size?: number;
    at?: [number, number][];
    foreign?: [number, number][];
    foreignFirst?: boolean;
  } = {}) => {
    const game = new Game();

    // Only civ1-city's rules for a city shrinking and being destroyed: its `registerRules` would register all of them
    //  into the default game too, which the other suites here share. A city is registered with its build and growth
    //  below, as its `city/created` rules would.
    game.rules.register(
      // civ1-city's announcement of a build, to see what is said before it.
      ...cityBuildingComplete(game.engine, game.rules),
      ...cityDestroyed(
        game.tileImprovements,
        game.cities,
        game.engine,
        game.units,
        game.workedTiles,
        game.specialists,
        game.tradeRoutes,
        game.rules
      ),
      ...cityShrink(
        game.cityGrowth,
        game.playerWorlds,
        game.workedTiles,
        game.specialists,
        game.engine
      )
    );
    registerUnit(game);

    if (level !== null) {
      game.difficulty.set(level);
    }

    const world = new World(new FillGenerator(12, 12, Grassland), game.rules),
      player = new Player(game.rules),
      other = new Player(game.rules);

    await world.build();

    [player, other].forEach((each: Player): void => {
      game.players.register(each);
      game.playerWorlds.register(new PlayerWorld(each, world, game.rules));
      game.playerGovernments.register(
        new PlayerGovernment(each, game.availableGovernments, game.rules)
      );
      game.playerResearch.register(
        new PlayerResearch(each, new AdvanceRegistry(), game.rules)
      );
    });

    game.availableCityBuildItems.register(
      ...([Settlers, Warrior] as unknown as (typeof Buildable)[])
    );

    const found = (owner: Player, [x, y]: [number, number], name: string) => {
        const city = new City(owner, world.get(x, y), name, game.rules);

        game.cities.register(city);
        game.cityBuilds.register(
          new CityBuild(city, game.availableCityBuildItems, game.rules)
        );
        game.cityGrowth.register(new CityGrowth(city, game.rules));

        return city;
      },
      foundForeign = () =>
        foreign.map(
          (position, index): City => found(other, position, `Foreign ${index}`)
        ),
      foreignBefore = foreignFirst ? foundForeign() : [],
      [city, ...others] = at.map(
        (position, index): City => found(player, position, `City ${index}`)
      ),
      foreignCities = foreignFirst ? foreignBefore : foundForeign(),
      cityBuild: CityBuild = game.cityBuilds.getByCity(city),
      cityGrowth = game.cityGrowth.getByCity(city);

    for (let grown = 1; grown < size; grown++) {
      cityGrowth.grow();
    }

    cityBuild.build(Settlers as unknown as typeof Buildable);

    // Paid for, and checked, as a turn's production is.
    const produce = (shields: number = cityBuild.remaining()) => {
      cityBuild.add(new Production(shields));

      return cityBuild.check() as Unit | null;
    };

    return {
      city,
      cityBuild,
      cityGrowth,
      foreignCities,
      game,
      others,
      player,
      produce,
    };
  };

  it('should be the rules the ids name', async (): Promise<void> => {
    const { game } = await setUp();

    expect(game.rules.getById(CHIEFTAIN_SETTLERS_RULE)).not.null;
    expect(game.rules.getById(SETTLERS_SHRINK_CITY_RULE)).not.null;
  });

  describe('on Chieftain', (): void => {
    it("should hold the build, keeping the shields, which go on adding up, and say why, in the player's only city", async (): Promise<void> => {
      const { city, cityBuild, cityGrowth, game, produce } = await setUp({
        level: Chieftain,
      });

      expect(produce()).null;
      expect(produce(3)).null;

      expect(cityBuild.building()!.item()).equal(Settlers);
      expect(cityBuild.cleared()).null;
      expect(cityBuild.progress().value()).equal(43);
      expect(cityBuild.held()).eql([CHIEFTAIN_SETTLERS_RULE]);
      expect(cityGrowth.size()).equal(1);
      expect(city.destroyed()).false;
      expect(game.units.getByCity(city)).length(0);
    });

    it('should hold it with other cities too', async (): Promise<void> => {
      const { city, cityBuild, produce } = await setUp({
        level: Chieftain,
        at: [
          [4, 4],
          [8, 8],
        ],
      });

      expect(produce()).null;
      expect(cityBuild.held()).eql([CHIEFTAIN_SETTLERS_RULE]);
      expect(city.destroyed()).false;
    });

    it('should say it will wait from the moment Settlers are chosen, and not once the city is size 2', async (): Promise<void> => {
      const { cityBuild, cityGrowth } = await setUp({ level: Chieftain });

      expect(cityBuild.progress().value()).equal(0);
      expect(cityBuild.remaining()).greaterThan(0);
      expect(cityBuild.held()).eql([CHIEFTAIN_SETTLERS_RULE]);

      cityGrowth.grow();

      expect(cityBuild.held()).eql([]);
      expect(cityBuild.building()!.item()).equal(Settlers);
    });

    it('should complete it once the city has grown, which then shrinks back', async (): Promise<void> => {
      const { city, cityBuild, cityGrowth, game, produce } = await setUp({
        level: Chieftain,
      });

      expect(produce()).null;

      cityGrowth.grow();

      expect(cityBuild.held()).eql([]);

      const settlers = produce(0);

      expect(settlers).instanceof(Settlers);
      expect(cityBuild.cleared()).eql({ reason: 'completed', item: Settlers });
      expect(cityGrowth.size()).equal(1);
      expect(ids(game.units.getByCity(city))).eql(ids([settlers]));
    });

    it('should hold anything that is Settlers too', async (): Promise<void> => {
      const { cityBuild, game, produce } = await setUp({ level: Chieftain });

      game.availableCityBuildItems.register(
        Colonists as unknown as typeof Buildable
      );
      cityBuild.build(Colonists as unknown as typeof Buildable);

      expect(cityBuild.held()).eql([CHIEFTAIN_SETTLERS_RULE]);
      expect(produce()).null;
    });

    it('should not hold Settlers in a larger city, or anything else in a city of size 1', async (): Promise<void> => {
      const larger = await setUp({ level: Chieftain, size: 2 });

      expect(larger.produce()).instanceof(Settlers);
      expect(larger.cityGrowth.size()).equal(1);

      const other = await setUp({ level: Chieftain });

      other.cityBuild.build(Warrior as unknown as typeof Buildable);

      expect(other.produce()).instanceof(Warrior);
    });
  });

  (
    [
      ['Warlord', Warlord],
      ['Emperor', Emperor],
      ['King', King],
      ['no level set (King)', null],
    ] as [string, typeof Difficulty | null][]
  ).forEach(([name, level]): void => {
    describe(`on ${name}`, (): void => {
      it("should build them in the player's only city, which keeps its citizen", async (): Promise<void> => {
        const { city, cityBuild, cityGrowth, game, produce } = await setUp({
          level,
        });

        expect(cityBuild.held()).eql([]);

        const settlers = produce();

        expect(settlers).instanceof(Settlers);
        expect(city.destroyed()).false;
        expect(cityGrowth.size()).equal(1);
        expect(ids(game.units.getByCity(city))).eql(ids([settlers]));
      });

      it('should remove the city when the player has others, the Settlers staying on its square, homed in the nearest of them', async (): Promise<void> => {
        const { city, game, others, produce } = await setUp({
          level,
          at: [
            [4, 4],
            [10, 10],
            [7, 5],
            [1, 9],
          ],
          foreign: [[9, 4]],
        });
        const destroyed: City[] = [];

        game.engine.on('city:destroyed', (destroyedCity: City): void => {
          destroyed.push(destroyedCity);
        });

        const settlers = produce()!;

        expect(settlers).instanceof(Settlers);
        expect(city.destroyed()).true;
        expect(ids(destroyed)).eql(ids([city]));
        expect(settlers.destroyed()).false;
        expect(settlers.tile() === city.tile()).true;
        expect(ids([settlers.city()])).eql(ids([others[1]]));
        expect(ids(game.units.getByCity(others[1]))).eql(ids([settlers]));
        expect(ids(game.units.getByTile(city.tile()))).eql(ids([settlers]));
      });

      it("should leave the Settlers with no home when the nearest city is another player's, as v474.05 (civ-clone/web-renderer#969)", async (): Promise<void> => {
        const { city, game, others, produce } = await setUp({
          level,
          at: [
            [4, 4],
            [10, 10],
            [7, 5],
          ],
          foreign: [[5, 5]],
        });

        const settlers = produce()!;

        expect(city.destroyed()).true;
        expect(settlers.destroyed()).false;
        expect(settlers.city()).null;
        expect(ids(game.units.getByTile(city.tile()))).eql(ids([settlers]));
        others.forEach((other: City): void => {
          expect(game.units.getByCity(other)).length(0);
        });
        expect(isVeteran(game, settlers)).false;
      });

      it('should take the first of two cities as near', async (): Promise<void> => {
        const { game, others, produce } = await setUp({
          level,
          at: [
            [4, 4],
            [4, 7],
            [7, 4],
          ],
        });
        const settlers = produce()!;

        expect(ids([settlers.city()])).eql(ids([others[0]]));
        expect(ids(game.units.getByCity(others[0]))).eql(ids([settlers]));
      });

      it("should take the first founded of the player's city and another player's as near", async (): Promise<void> => {
        const ownFirst = await setUp({
          level,
          at: [
            [4, 4],
            [4, 7],
          ],
          foreign: [[7, 4]],
        });

        expect(ids([ownFirst.produce()!.city()])).eql(
          ids([ownFirst.others[0]])
        );

        const foreignFirst = await setUp({
          level,
          at: [
            [4, 4],
            [4, 7],
          ],
          foreign: [[7, 4]],
          foreignFirst: true,
        });
        const settlers = foreignFirst.produce()!;

        expect(foreignFirst.city.destroyed()).true;
        expect(settlers.destroyed()).false;
        expect(settlers.city()).null;
      });

      it('should say the city was abandoned, once, before the Settlers are announced', async (): Promise<void> => {
        const { city, game, produce } = await setUp({
          level,
          at: [
            [4, 4],
            [7, 5],
          ],
        });
        const events: [string, string, string | null][] = [];

        game.engine.on('city:abandoned', (abandoned: City, unit: Unit) =>
          events.push(['city:abandoned', abandoned.id(), unit.id()])
        );
        game.engine.on(
          'city:building-complete',
          (cityBuild: CityBuild, built: Unit) =>
            events.push([
              'city:building-complete',
              cityBuild.city().id(),
              built.id(),
            ])
        );
        game.engine.on('city:destroyed', (destroyed: City) =>
          events.push(['city:destroyed', destroyed.id(), null])
        );

        const settlers = produce()!;

        expect(events).eql([
          ['city:abandoned', city.id(), settlers.id()],
          ['city:building-complete', city.id(), settlers.id()],
          ['city:destroyed', city.id(), null],
        ]);
      });

      it('should not say a city that keeps its citizen, or only shrinks, was abandoned', async (): Promise<void> => {
        const abandoned: City[] = [];

        for (const setting of [
          {},
          {
            size: 2,
            at: [
              [4, 4],
              [7, 5],
            ] as [number, number][],
          },
        ]) {
          const { game, produce } = await setUp({ level, ...setting });

          game.engine.on('city:abandoned', (city: City) =>
            abandoned.push(city)
          );

          expect(produce()).instanceof(Settlers);
        }

        // Nor one with others that builds anything else.
        const warriors = await setUp({
          level,
          at: [
            [4, 4],
            [7, 5],
          ],
        });

        warriors.game.engine.on('city:abandoned', (city: City) =>
          abandoned.push(city)
        );
        warriors.cityBuild.build(Warrior as unknown as typeof Buildable);

        expect(warriors.produce()).instanceof(Warrior);
        expect(warriors.city.destroyed()).false;
        expect(abandoned).length(0);
      });

      it('should pass over a city already destroyed', async (): Promise<void> => {
        const { city, others, produce } = await setUp({
          level,
          at: [
            [4, 4],
            [5, 5],
            [7, 5],
          ],
        });

        others[0].destroy();

        const settlers = produce()!;

        expect(city.destroyed()).true;
        expect(ids([settlers.city()])).eql(ids([others[1]]));
      });

      it('should not say the city was abandoned while a ruleset has the Settlers not remove it', async (): Promise<void> => {
        const { city, game, produce } = await setUp({
          level,
          at: [
            [4, 4],
            [7, 5],
          ],
        });
        const abandoned: City[] = [];

        game.rules.getById(SETTLERS_SHRINK_CITY_RULE)!.disable();
        game.engine.on('city:abandoned', (city: City) => abandoned.push(city));

        expect(produce()).instanceof(Settlers);
        expect(city.destroyed()).false;
        expect(abandoned).length(0);
      });

      it('should take a citizen from a larger city, as before', async (): Promise<void> => {
        const { city, cityGrowth, game, produce } = await setUp({
          level,
          size: 3,
        });
        const settlers = produce();

        expect(cityGrowth.size()).equal(2);
        expect(ids(game.units.getByCity(city))).eql(ids([settlers]));
      });

      it('should take a citizen from a larger city with others, leaving the Settlers homed there, a Veteran from its Barracks', async (): Promise<void> => {
        const { city, cityGrowth, game, produce } = await setUp({
          level,
          size: 2,
          at: [
            [4, 4],
            [7, 5],
          ],
        });

        barracks(game);

        const settlers = produce()!;

        expect(city.destroyed()).false;
        expect(cityGrowth.size()).equal(1);
        expect(ids([settlers.city()])).eql(ids([city]));
        expect(isVeteran(game, settlers)).true;
      });

      it('should make the Settlers that outlive a removed city as new, not a Veteran from its Barracks', async (): Promise<void> => {
        const { city, game, produce } = await setUp({
          level,
          at: [
            [4, 4],
            [7, 5],
          ],
        });

        barracks(game);

        const settlers = produce()!;

        expect(city.destroyed()).true;
        expect(settlers.destroyed()).false;
        expect(isVeteran(game, settlers)).false;
      });

      it("should build them as a Veteran from its Barracks in the player's only city", async (): Promise<void> => {
        const { city, game, produce } = await setUp({ level });

        barracks(game);

        const settlers = produce()!;

        expect(city.destroyed()).false;
        expect(isVeteran(game, settlers)).true;
      });
    });
  });
});
