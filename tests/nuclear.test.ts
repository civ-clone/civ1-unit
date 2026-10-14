import {
  Attack,
  NuclearAttack,
  SneakAttack,
  SneakNuclearAttack,
} from '../Actions';
import { Bomber, Nuclear, Trireme, Warrior } from '../Units';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { IRng } from '@civ-clone/core-random/Rng';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import Player from '@civ-clone/core-player/Player';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import { Pollution } from '@civ-clone/civ1-world/TileImprovements';
import { SdiDefence } from '@civ-clone/library-city/CityImprovements';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import built from '@civ-clone/civ1-world/Rules/TileImprovement/built';
import { expect } from 'chai';
import register from '../registerRules';

// civ-clone/web-renderer#129: a Nuclear unit detonates rather than fights, with v474.05's effects.
describe('nuclear', (): void => {
  // `rolls` are what the game's random number generator returns, in turn, then 0.
  const setUp = async (rolls: number[] = [], map: string = '') => {
    const rng = Object.assign((): number => rolls.shift() ?? 0, {
        calls: (): number => 0,
        restore: (): void => {},
        seed: (): number => 0,
      }) as IRng,
      game = new Game({ rng });

    register(game);
    // civ1-world's, which record a tile improvement once it's built.
    game.rules.register(...built(game.tileImprovements, game.engine));

    // A 7×7 map of Grassland, with Ocean down the first column.
    const world = new World(new FillGenerator(7, 7, Grassland), game.rules);

    await world.build();

    world
      .entries()
      .filter((tile: Tile): boolean => tile.x() === 0)
      .forEach((tile: Tile): void => tile.setTerrain(new Ocean()));

    const player = new Player(game.rules),
      enemy = new Player(game.rules),
      // Units register themselves (`civ1-unit:unit/created/register`).
      unit = (UnitType: typeof Unit, owner: Player, tile: Tile): Unit =>
        new UnitType(null, owner, tile, game.rules),
      city = (owner: Player, tile: Tile, size: number): City => {
        const created = new City(owner, tile, 'City', game.rules),
          cityGrowth = new CityGrowth(created, game.rules);

        game.cities.register(created);
        game.cityGrowth.register(cityGrowth);

        while (cityGrowth.size() < size) {
          cityGrowth.grow();
        }

        return created;
      },
      actions = (nuke: Unit, to: Tile) =>
        nuke.actions(to).map((action) => action.constructor);

    return { actions, city, enemy, game, player, unit, world };
  };

  it('is only offered against a rival unit or city, never empty land or your own units', async (): Promise<void> => {
    const { actions, city, enemy, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(3, 3));

    expect(actions(nuke, world.get(4, 3))).not.include(NuclearAttack);

    unit(Warrior, player, world.get(4, 3));

    expect(actions(nuke, world.get(4, 3))).not.include(NuclearAttack);

    unit(Warrior, enemy, world.get(2, 3));
    city(enemy, world.get(3, 4), 3);

    expect(actions(nuke, world.get(2, 3))).include(NuclearAttack);
    // An empty rival city.
    expect(actions(nuke, world.get(3, 4))).include(NuclearAttack);
  });

  it('never fights an ordinary attack', async (): Promise<void> => {
    const { actions, enemy, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(3, 3)),
      bomber = unit(Bomber, player, world.get(3, 3));

    unit(Warrior, enemy, world.get(4, 3));

    expect(actions(nuke, world.get(4, 3))).not.include(Attack);
    expect(actions(nuke, world.get(4, 3))).not.include(SneakAttack);
    expect(actions(bomber, world.get(4, 3))).include(Attack);
  });

  it('is a sneak attack on a player at peace, and breaks the treaty', async (): Promise<void> => {
    const { enemy, game, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(3, 3)),
      peace = new Peace(player, enemy);

    game.interactions.register(peace);
    unit(Warrior, enemy, world.get(4, 3));

    const actions = nuke.actions(world.get(4, 3)),
      [sneak] = actions.filter(
        (action): boolean => action instanceof SneakNuclearAttack
      ) as SneakNuclearAttack[];

    expect(
      actions.some((action): boolean => action.constructor === NuclearAttack)
    ).false;
    expect(sneak.enemy()).equal(enemy);

    nuke.action(sneak);

    expect(peace.active()).false;
  });

  it('destroys every unit in the 3×3 area, its own side too, and is used up', async (): Promise<void> => {
    const { enemy, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(3, 3)),
      target = unit(Warrior, enemy, world.get(4, 3)),
      stacked = unit(Warrior, enemy, world.get(4, 3)),
      own = unit(Warrior, player, world.get(5, 4)),
      corner = unit(Warrior, enemy, world.get(5, 2)),
      outside = unit(Warrior, enemy, world.get(6, 3));

    nuke.action(
      nuke
        .actions(target.tile())
        .find((action) => action instanceof NuclearAttack)!
    );

    [nuke, target, stacked, own, corner].forEach((areaUnit: Unit): void => {
      expect(areaUnit.destroyed()).true;
    });
    expect(outside.destroyed()).false;
  });

  it('destroys the cargo of a transport in the area once, not again as part of the stack', async (): Promise<void> => {
    const { enemy, game, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(2, 3)),
      target = unit(Warrior, enemy, world.get(1, 3)),
      trireme = new Trireme(
        null,
        enemy,
        world.get(0, 3),
        game.rules,
        game.transports
      ),
      cargo = unit(Warrior, enemy, world.get(0, 3)),
      destroyedCount = new Map<Unit, number>();

    game.units.register(trireme);
    expect((trireme as unknown as ITransport).stow(cargo)).true;
    cargo.setBusy(new Stowed());
    cargo.setActive(false);

    game.rules.register(
      new Destroyed(
        new Effect((destroyed: Unit): void => {
          destroyedCount.set(
            destroyed,
            (destroyedCount.get(destroyed) ?? 0) + 1
          );
        })
      )
    );

    nuke.action(
      nuke
        .actions(target.tile())
        .find((action) => action instanceof NuclearAttack)!
    );

    expect(trireme.destroyed()).true;
    expect(cargo.destroyed()).true;
    expect(destroyedCount.get(trireme)).equal(1);
    expect(destroyedCount.get(cargo)).equal(1);
  });

  it('spares the units in a city with SDI Defense, but still halves it', async (): Promise<void> => {
    const { city, enemy, game, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(3, 3)),
      protectedCity = city(enemy, world.get(5, 3), 7),
      defender = unit(Warrior, enemy, world.get(5, 3)),
      exposed = unit(Warrior, enemy, world.get(4, 3)),
      events: unknown[][] = [];

    game.cityImprovements.register(new SdiDefence(protectedCity, game.rules));
    game.engine.on('city:sdi-protected', (...args: unknown[]) =>
      events.push(args)
    );

    nuke.action(
      nuke
        .actions(exposed.tile())
        .find((action) => action instanceof NuclearAttack)!
    );

    expect(defender.destroyed()).false;
    expect(exposed.destroyed()).true;
    expect(game.cityGrowth.getByCity(protectedCity).size()).equal(4);
    expect(events.length).equal(1);
    expect(events[0][0] === protectedCity).true;
    expect(events[0][1] === nuke).true;
  });

  it('halves each city in the area, rounding the loss down', async (): Promise<void> => {
    const { city, enemy, game, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(3, 3)),
      sizes = [
        [world.get(4, 2), 1, 1],
        [world.get(4, 3), 2, 1],
        [world.get(5, 4), 7, 4],
        [world.get(3, 4), 8, 4],
        // Outside the area.
        [world.get(6, 3), 8, 8],
      ] as [Tile, number, number][],
      cities = sizes.map(([tile, size]) => city(enemy, tile, size));

    nuke.action(
      nuke
        .actions(world.get(4, 3))
        .find((action) => action instanceof NuclearAttack)!
    );

    cities.forEach((areaCity: City, i: number): void => {
      expect(game.cityGrowth.getByCity(areaCity).size()).equal(sizes[i][2]);
    });
  });

  it("doesn't pollute a square twice", async (): Promise<void> => {
    const { enemy, game, player, unit, world } = await setUp(),
      nuke = unit(Nuclear, player, world.get(3, 3)),
      target = unit(Warrior, enemy, world.get(4, 3)),
      events: unknown[] = [];

    new Pollution(world.get(4, 4), game.rules);

    game.engine.on('tile-improvement:built', (...args: unknown[]) =>
      events.push(args)
    );

    nuke.action(
      nuke
        .actions(target.tile())
        .find((action) => action instanceof NuclearAttack)!
    );

    expect(
      game.tileImprovements
        .getByTile(world.get(4, 4))
        .filter((improvement) => improvement instanceof Pollution).length
    ).to.equal(1);
    // Every roll is 0, so each of the other 8 land squares is polluted, once.
    expect(events.length).to.equal(8);
  });

  it('leaves fallout on 2 in 3 land squares without a city, never on Ocean', async (): Promise<void> => {
    // One roll per land square without a city, in `[tile, ...tile.getNeighbours()]` order: (1,3) is the target, with
    //  (0,*) Ocean and (2,2) a city, so five land squares are rolled for. A roll under 2/3 pollutes.
    const { city, enemy, game, player, unit, world } = await setUp([
        0.5, 0.67, 0.66, 0.9, 0,
      ]),
      nuke = unit(Nuclear, player, world.get(2, 3)),
      target = unit(Warrior, enemy, world.get(1, 3));

    city(enemy, world.get(2, 2), 2);

    const area = [target.tile(), ...target.tile().getNeighbours()],
      rolled = area.filter(
        (tile: Tile): boolean =>
          tile.isLand() && game.cities.getByTile(tile) === null
      );

    expect(rolled.length).equal(5);

    nuke.action(
      nuke
        .actions(target.tile())
        .find((action) => action instanceof NuclearAttack)!
    );

    const polluted = area.filter((tile: Tile): boolean =>
      game.tileImprovements
        .getByTile(tile)
        .some((improvement) => improvement instanceof Pollution)
    );

    expect(
      polluted.map((tile: Tile): string => `${tile.x()},${tile.y()}`)
    ).deep.equal(
      [rolled[0], rolled[2], rolled[4]].map(
        (tile: Tile): string => `${tile.x()},${tile.y()}`
      )
    );
  });
});
