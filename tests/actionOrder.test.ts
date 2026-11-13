import * as Units from '../Units';
import { Forest, Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import { Irrigation, Pollution } from '@civ-clone/civ1-world/TileImprovements';
import { Land as LandUnit, NavalTransport } from '../Types';
import { Sail, Settlers, Warrior } from '../Units';
import { readFileSync, writeFileSync } from 'fs';
import Action from '@civ-clone/core-unit/Rules/Action';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AvailableGovernmentRegistry from '@civ-clone/core-government/AvailableGovernmentRegistry';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import Advance from '@civ-clone/core-science/Advance';
import Carries from '@civ-clone/base-unit-trait-carries/Carries';
import BasePathFinder from '@civ-clone/simple-world-path/BasePathFinder';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import { Republic } from '@civ-clone/library-government/Governments';
import { Gold } from '@civ-clone/library-city/Yields';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import UnitTraits from '@civ-clone/core-unit/Rules/UnitTraits';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import World from '@civ-clone/core-world/World';
import { createRng } from '@civ-clone/core-random/Rng';
import { BronzeWorking } from '@civ-clone/library-science/Advances';
import available from '@civ-clone/civ1-world/Rules/TileImprovement/available';
import { expect } from 'chai';
import { isA, traitsOf } from '@civ-clone/core-unit/traits';
import { join } from 'path';
import register from '../registerRules';

// Pins which unit actions civ1-unit registers, in what order, and which of them each unit type is offered where, before
//  the action wiring is lifted into base packages (civ-clone/web-renderer#1008). The AI takes the first action it's
//  offered and the UI lists them in order, so the order is behaviour, not presentation.

// The 55 action rules, in the order `Rules/Unit/action.ts` registers them. civ1-wonder's `help-build-wonder` comes
//  after these in a game (plugins load in name order), but civ1-wonder isn't installed here.
const actionRuleIds = [
  'civ1-unit:unit/action/steal-technology',
  'civ1-unit:unit/action/sneak-steal-technology',
  'civ1-unit:unit/action/overruled/sneak-steal-technology',
  'civ1-unit:unit/action/establish-embassy',
  'civ1-unit:unit/action/investigate-city',
  'civ1-unit:unit/action/industrial-sabotage',
  'civ1-unit:unit/action/incite-revolt',
  'civ1-unit:unit/action/sneak-incite-revolt',
  'civ1-unit:unit/action/overruled/sneak-incite-revolt',
  'civ1-unit:unit/action/subvert-city',
  'civ1-unit:unit/action/meet-with-leader',
  'civ1-unit:unit/action/bribe-unit',
  'civ1-unit:unit/action/establish-trade-route',
  'civ1-unit:unit/action/land-aircraft',
  'civ1-unit:unit/action/move',
  'civ1-unit:unit/action/sneak-move',
  'civ1-unit:unit/action/overruled/sneak-move',
  'civ1-unit:unit/action/abort-move',
  'civ1-unit:unit/action/attack',
  'civ1-unit:unit/action/sneak-attack',
  'civ1-unit:unit/action/overruled/sneak-attack',
  'civ1-unit:unit/action/nuclear-attack',
  'civ1-unit:unit/action/sneak-nuclear-attack',
  'civ1-unit:unit/action/overruled/sneak-nuclear-attack',
  'civ1-unit:unit/action/capture-city',
  'civ1-unit:unit/action/sneak-capture-city',
  'civ1-unit:unit/action/overruled/sneak-capture-city',
  'civ1-unit:unit/action/pillage',
  'civ1-unit:unit/action/sneak-pillage',
  'civ1-unit:unit/action/overruled/sneak-pillage',
  'civ1-unit:unit/action/fortify',
  'civ1-unit:unit/action/sleep',
  'civ1-unit:unit/action/activate',
  'civ1-unit:unit/action/disband',
  'civ1-unit:unit/action/no-orders',
  'civ1-unit:unit/action/found-city',
  'civ1-unit:unit/action/join-city',
  'civ1-unit:unit/action/improvement/Irrigation',
  'civ1-unit:unit/action/improvement/Mine',
  'civ1-unit:unit/action/improvement/Road',
  'civ1-unit:unit/action/improvement/Railroad',
  'civ1-unit:unit/action/terrain/ClearJungle',
  'civ1-unit:unit/action/terrain/ClearForest',
  'civ1-unit:unit/action/terrain/PlantForest',
  'civ1-unit:unit/action/terrain/ClearSwamp',
  'civ1-unit:unit/action/clean-pollution',
  'civ1-unit:unit/action/embark',
  'civ1-unit:unit/action/disembark',
  'civ1-unit:unit/action/unload',
  'civ1-unit:unit/action/goto',
  'civ1-unit:unit/action/road-to',
  'civ1-unit:unit/action/railroad-to',
  'civ1-unit:unit/action/set-home-city',
  'civ1-unit:unit/action/explore',
  'civ1-unit:unit/action/automate',
];

// The map every scenario is played on: grassland, with the sea from column 8 eastwards. In the land scenarios the unit
//  stands at `origin`, a coastal square; `land` is its western neighbour, `sea` its eastern one and `distant` four
//  squares west. Every unit type stands there, ships included, so the naval rows of those scenarios show what a ship
//  on land (as in a coastal city) is offered. In the sea scenarios it stands at `sea` instead: a ship afloat, a land
//  unit aboard one of its player's Sails, an aircraft in flight. Each unit's home is a city of its player at `home`,
//  far from all of these.
const size = 15,
  home: [number, number] = [1, 1],
  origin: [number, number] = [7, 7],
  land: [number, number] = [6, 7],
  sea: [number, number] = [8, 7],
  openSea: [number, number] = [9, 7],
  distant: [number, number] = [3, 7];

class MapGenerator extends FillGenerator {
  #terrain: (x: number, y: number) => typeof Terrain;

  constructor(terrain: (x: number, y: number) => typeof Terrain) {
    super(size, size, Grassland);

    this.#terrain = terrain;
  }

  generate(): Promise<Terrain[]> {
    return Promise.resolve(
      new Array(size * size).fill(0).map((value, index): Terrain => {
        const [x, y] = this.indexToCoords(index);

        return new (this.#terrain(x, y))();
      })
    );
  }
}

type Setting = {
  game: Game;
  player: Player;
  world: World;
  from: Tile;
};

type Scenario = {
  name: string;
  atSea?: boolean;
  // The square the unit stands on: grassland unless this says otherwise.
  originTerrain?: typeof Terrain;
  target: (setting: Setting) => Tile;
  prepare?: (setting: Setting) => void;
};

// A player and a city as a game has them: with a treasury and research, and a city with a size and a build.
const addPlayer = (game: Game, ...advances: (typeof Advance)[]): Player => {
    const player = new Player(game.rules),
      research = new PlayerResearch(player, new AdvanceRegistry(), game.rules);

    advances.forEach((AdvanceType) => research.addAdvance(AdvanceType));

    game.playerTreasuries.register(
      new PlayerTreasury(player, Gold, undefined, game.rules)
    );
    game.playerResearch.register(research);

    return player;
  },
  addCity = (game: Game, player: Player, tile: Tile, name: string): City => {
    const city = new City(player, tile, name, game.rules);

    game.cities.register(city);
    game.cityGrowth.register(new CityGrowth(city, game.rules));
    game.cityBuilds.register(
      new CityBuild(city, new AvailableCityBuildItemsRegistry(), game.rules)
    );

    return city;
  };

const at = (world: World, [x, y]: [number, number]): Tile => world.get(x, y),
  // Another player's Warrior, or city, on the `land` square. The city's player knows an advance ours doesn't, so
  //  there's something to steal.
  foreignUnit =
    (peace = false) =>
    ({ game, player, world }: Setting): void => {
      const enemy = addPlayer(game);

      new Warrior(null, enemy, at(world, land), game.rules);

      if (peace) {
        game.interactions.register(new Peace(player, enemy, game.rules));
      }
    },
  foreignCity =
    (peace = false) =>
    ({ game, player, world }: Setting): void => {
      const enemy = addPlayer(game, BronzeWorking);

      addCity(game, enemy, at(world, land), 'Foreign');

      if (peace) {
        game.interactions.register(new Peace(player, enemy, game.rules));
      }
    },
  // treaty.test.ts's partner: a worked, irrigated square of a city whose player we're at peace with.
  partnersLand =
    (square: (setting: Setting) => Tile) =>
    (setting: Setting): void => {
      const { game, player, world } = setting,
        partner = addPlayer(game),
        city = addCity(game, partner, world.get(5, 7), 'Partner');

      game.workedTiles.register(new WorkedTile(square(setting), city));
      game.tileImprovements.register(
        new Irrigation(square(setting), game.rules)
      );
      game.interactions.register(new Peace(player, partner, game.rules));
    },
  // Our player is a Republic, whose Senate won't let it break a treaty.
  underASenate =
    (prepare: (setting: Setting) => void) =>
    (setting: Setting): void => {
      const { game, player } = setting,
        playerGovernment = new PlayerGovernment(
          player,
          new AvailableGovernmentRegistry(),
          game.rules
        );

      game.playerGovernments.register(playerGovernment);
      playerGovernment.set(new Republic());

      prepare(setting);
    },
  scenarios: Scenario[] = [
    {
      name: 'empty land neighbour',
      target: ({ world }) => at(world, land),
    },
    {
      name: 'foreign unit',
      target: ({ world }) => at(world, land),
      prepare: foreignUnit(),
    },
    {
      name: 'foreign city',
      target: ({ world }) => at(world, land),
      prepare: foreignCity(),
    },
    {
      name: 'foreign unit, at peace',
      target: ({ world }) => at(world, land),
      prepare: foreignUnit(true),
    },
    {
      name: 'foreign city, at peace',
      target: ({ world }) => at(world, land),
      prepare: foreignCity(true),
    },
    {
      name: 'foreign unit, at peace, under a Senate',
      target: ({ world }) => at(world, land),
      prepare: underASenate(foreignUnit(true)),
    },
    {
      name: 'foreign city, at peace, under a Senate',
      target: ({ world }) => at(world, land),
      prepare: underASenate(foreignCity(true)),
    },
    {
      name: 'own city',
      target: ({ world }) => at(world, land),
      prepare: ({ game, player, world }) => {
        addCity(game, player, at(world, land), 'Own');
      },
    },
    {
      name: 'water',
      target: ({ world }) => at(world, sea),
    },
    {
      name: "treaty partner's worked land",
      target: ({ world }) => at(world, land),
      prepare: partnersLand(({ world }) => at(world, land)),
    },
    {
      name: "treaty partner's worked land, under a Senate",
      target: ({ world }) => at(world, land),
      prepare: underASenate(partnersLand(({ world }) => at(world, land))),
    },
    {
      name: "own square on a treaty partner's worked land",
      target: ({ from }) => from,
      prepare: partnersLand(({ from }) => from),
    },
    {
      name: "own square on a treaty partner's worked land, under a Senate",
      target: ({ from }) => from,
      prepare: underASenate(partnersLand(({ from }) => from)),
    },
    {
      name: 'own transport with space',
      target: ({ world }) => at(world, sea),
      prepare: ({ game, player, world }) => {
        const transport = new Sail(
          null,
          player,
          at(world, sea),
          game.rules,
          game.transports
        );

        transport.moves().set(transport.movement().value());
      },
    },
    {
      // Irrigated too, so there's something to pillage.
      name: 'own polluted, irrigated square',
      target: ({ from }) => from,
      prepare: ({ game, from }) => {
        game.tileImprovements.register(new Irrigation(from, game.rules));
        game.tileImprovements.register(new Pollution(from, game.rules));
      },
    },
    {
      name: 'own forest square',
      originTerrain: Forest,
      target: ({ from }) => from,
    },
    {
      name: 'own grassland square',
      target: ({ from }) => from,
    },
    {
      name: 'distant square',
      target: ({ world }) => at(world, distant),
    },
    {
      name: 'own square in own city',
      target: ({ from }) => from,
      prepare: ({ game, player, from }) => {
        addCity(game, player, from, 'Own');
      },
    },
    {
      name: 'at sea: coastal land neighbour',
      atSea: true,
      target: ({ world }) => at(world, origin),
    },
    {
      name: 'at sea: water neighbour',
      atSea: true,
      target: ({ world }) => at(world, openSea),
    },
    {
      // A transport that can carry a Warrior has one aboard.
      name: 'at sea: own square',
      atSea: true,
      target: ({ from }) => from,
      prepare: ({ game, player, from }) => {
        const [transport] = game.units
          .getByTile(from)
          .filter((unit) => unit instanceof NavalTransport) as NavalTransport[];

        if (
          !transport ||
          !traitsOf(transport, Carries, game.rules).some((carries) =>
            carries.carries(Warrior, game.rules)
          )
        ) {
          return;
        }

        const warrior = new Warrior(null, player, from, game.rules);

        expect(transport.stow(warrior)).true;

        warrior.setBusy(new Stowed());
        warrior.setActive(false);
      },
    },
  ];

const UnitTypes = Object.values(Units) as (typeof Unit)[],
  fixturePath = join(__dirname, 'fixtures', 'actionMatrix.json');

type Cell = {
  unit: Unit;
  to: Tile;
  from: Tile;
};

// A fresh game for each unit and scenario, so no unit sees another's stack. The game's rng is seeded: nothing below
//  should draw from it, but nothing may draw from `Date.now()` either.
const setUp = async (
  scenario: Scenario,
  UnitType: typeof Unit
): Promise<Cell & { game: Game }> => {
  const game = new Game({ rng: createRng(1008) });

  register(game);

  // Which tile improvements can be built where, as civ1-world registers them in a game.
  game.rules.register(...available(game.playerResearch, game.tileImprovements));

  // `simple-world-path` registers its path finder on the default registry: GoTo needs one that knows this game.
  game.pathFinders.register(
    class extends BasePathFinder {
      constructor(unit: Unit, start: Tile, end: Tile) {
        super(unit, start, end, game.rules, game.cities, game.units);
      }
    }
  );

  const world = new World(
    new MapGenerator((x, y): typeof Terrain =>
      x >= sea[0]
        ? Ocean
        : x === origin[0] && y === origin[1] && scenario.originTerrain
        ? scenario.originTerrain
        : Grassland
    ),
    game.rules
  );

  await world.build();

  const player = addPlayer(game),
    city = addCity(game, player, at(world, home), 'Home'),
    from = at(world, scenario.atSea ? sea : origin),
    setting: Setting = { game, player, world, from },
    // A land unit at sea is aboard its player's Sail, stowed as `Embark` leaves it.
    ship =
      scenario.atSea && isA(UnitType, LandUnit)
        ? new Sail(city, player, from, game.rules, game.transports)
        : null;

  const unit = new (UnitType as unknown as new (...args: unknown[]) => Unit)(
    city,
    player,
    from,
    game.rules,
    game.transports
  );

  unit.moves().set(unit.movement().value());

  if (ship !== null) {
    expect(ship.stow(unit), `${UnitType.name} boards a Sail`).true;

    unit.setBusy(new Stowed());
    unit.setActive(false);
  }

  scenario.prepare?.(setting);

  return { game, unit, to: scenario.target(setting), from };
};

const offered = ({ unit, to, from }: Cell): string[] =>
  unit
    .actions(to, from)
    .map((unitAction: UnitAction): string => unitAction.constructor.name);

const buildMatrix = async (): Promise<
  Record<string, Record<string, string[]>>
> => {
  const matrix: Record<string, Record<string, string[]>> = {};

  for (const UnitType of UnitTypes) {
    matrix[UnitType.name] = {};

    for (const scenario of scenarios) {
      matrix[UnitType.name][scenario.name] = offered(
        await setUp(scenario, UnitType)
      );
    }
  }

  return matrix;
};

describe('unit actions', function (): void {
  // The matrix and the counter build a game for each of their 616 and 588 cells: about a second each here, more on CI.
  this.timeout(60000);

  it('should register the 55 action rules in their order', async (): Promise<void> => {
    const game = new Game({ rng: createRng(1008) });

    register(game);

    expect(game.rules.get(Action).map((rule) => rule.id())).to.deep.equal(
      actionRuleIds
    );
  });

  it('should be asked of all 28 unit types in 22 scenarios', (): void => {
    expect(UnitTypes).length(28);
    expect(scenarios).length(22);
  });

  // The offered-actions matrix: the action classes `unit.actions(to, from)` returns, in order, for each unit type and
  //  scenario. A difference from the fixture means a unit is now offered something else, or in another order: a
  //  change in behaviour. If that change is meant, regenerate the fixture and review its diff:
  //
  //    UPDATE_ACTION_MATRIX=1 npx ts-mocha tests/actionOrder.test.ts
  it('should offer each unit type the same actions as the fixture', async (): Promise<void> => {
    const matrix = await buildMatrix();

    if (process.env.UPDATE_ACTION_MATRIX) {
      writeFileSync(fixturePath, JSON.stringify(matrix, null, 2) + '\n');
    }

    expect(matrix).to.deep.equal(JSON.parse(readFileSync(fixturePath, 'utf8')));
  });

  // The fixture can't vouch for itself: these would fail if the matrix were built from a game without civ1-unit's
  //  traits, or without a path finder, and the fixture regenerated from it.
  it('should not be built from a game that has lost its traits', async (): Promise<void> => {
    const grassland = scenarios.find(
        ({ name }) => name === 'own grassland square'
      )!,
      { game, ...cell } = await setUp(grassland, Settlers);

    expect(game.rules.get(UnitTraits)).length(35);
    expect(offered(cell)).to.include('FoundCity');
    expect(offered(await setUp(grassland, Warrior))).to.include('Fortify');
    expect(offered(await setUp(grassland, Warrior))).not.to.include(
      'FoundCity'
    );
  });

  it('should offer the basic actions somewhere in the matrix', async (): Promise<void> => {
    const cell = (name: string, UnitType: typeof Unit) =>
      setUp(scenarios.find((scenario) => scenario.name === name)!, UnitType);

    expect(offered(await cell('empty land neighbour', Warrior))).to.include(
      'Move'
    );
    expect(offered(await cell('foreign unit', Warrior))).to.include('Attack');
    expect(offered(await cell('own transport with space', Warrior))).to.include(
      'Embark'
    );
    expect(offered(await cell('distant square', Settlers))).to.include.members([
      'GoTo',
      'RoadTo',
    ]);
  });

  // A deterministic stand-in for the cost of the hot path: how many plain criteria (`Criterion#validate`, not the
  //  `Criteria`/`Or` groups that call them) the action rules evaluate across the matrix's neighbour and current-square
  //  scenarios, with the rules those criteria ask in turn (canStow, civ1-world's `Available`...). Lifting a criterion
  //  must keep this exact: evaluating criteria in another order, or once more, moves it. The distant square is left
  //  out, so the count doesn't depend on the path search in simple-world-path.
  it('should validate the same number of criteria', async (): Promise<void> => {
    const cells: Cell[] = [];

    for (const UnitType of UnitTypes) {
      for (const scenario of scenarios) {
        if (scenario.name !== 'distant square') {
          cells.push(await setUp(scenario, UnitType));
        }
      }
    }

    const validate = Criterion.prototype.validate;

    let count = 0;

    Criterion.prototype.validate = function (
      this: Criterion,
      ...args: unknown[]
    ): boolean {
      count++;

      return validate.apply(this, args);
    };

    try {
      cells.forEach((cell) => offered(cell));
    } finally {
      Criterion.prototype.validate = validate;
    }

    expect(cells).length(28 * 21);
    expect(count).to.equal(135036);
  });
});
