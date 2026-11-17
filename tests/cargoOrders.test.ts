import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import { Carrier, Fighter, Sail, Warrior } from '../Units';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import Player from '@civ-clone/core-player/Player';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import World from '@civ-clone/core-world/World';
import { createRng } from '@civ-clone/core-random/Rng';
import { expect } from 'chai';
import register from '../registerRules';

// The orders a land unit aboard a ship at sea is given on its own square (civ-clone/web-renderer#1031). In v474.05 it
//  boards asleep, with no moves left, and on a later turn it can be picked out of the ship's stack and disbanded ('D')
//  or put back to sleep ('s'), which leaves it as it boarded.
describe('cargo at sea', (): void => {
  // Grassland in the two westernmost columns, the sea east of them.
  class MapGenerator extends FillGenerator {
    constructor() {
      super(5, 5, Grassland);
    }

    generate(): Promise<Terrain[]> {
      return Promise.resolve(
        new Array(25).fill(0).map((value, index): Terrain => {
          const [x] = this.indexToCoords(index);

          return x >= 2 ? new Ocean() : new Grassland();
        })
      );
    }
  }

  const named = (
      unit: Unit,
      name: string,
      to = unit.tile()
    ): UnitAction | undefined =>
      unit
        .actions(to)
        .find(
          (unitAction: UnitAction): boolean =>
            unitAction.constructor.name === name
        ),
    offered = (unit: Unit): string[] =>
      unit
        .actions()
        .map((unitAction: UnitAction): string => unitAction.constructor.name),
    // A Warrior that has walked aboard a Sail at sea, as `Embark` leaves it.
    setUp = async () => {
      const game = new Game({ rng: createRng(1031) });

      register(game);

      const world = new World(new MapGenerator(), game.rules);

      await world.build();

      const player = new Player(game.rules),
        sail = new Sail(
          null,
          player,
          world.get(2, 2),
          game.rules,
          game.transports
        ),
        warrior = new Warrior(
          null,
          player,
          world.get(1, 2),
          game.rules,
          game.transports
        );

      game.units.register(sail, warrior);

      warrior.action(named(warrior, 'Embark', sail.tile())!);

      expect(game.transports.hasUnit(warrior)).true;
      expect(warrior.busy()).instanceof(Stowed);

      // The next turn's moves, as the start of a turn gives every unit.
      const nextTurn = (): void =>
        [sail, warrior].forEach((unit: Unit): void =>
          unit.moves().set(unit.movement().value())
        );

      return { game, player, sail, warrior, nextTurn, world };
    };

  it('should leave a unit that has just boarded with no orders but to wait', async (): Promise<void> => {
    const { warrior } = await setUp();

    expect(warrior.moves().value()).equal(0);
    expect(offered(warrior)).to.deep.equal(['NoOrders']);
  });

  it('should offer cargo with moves Disband, but not Sleep: it is asleep aboard already', async (): Promise<void> => {
    const { nextTurn, warrior } = await setUp();

    nextTurn();

    expect(offered(warrior)).to.include('Disband');
    expect(offered(warrior)).not.to.include('Sleep');
  });

  it('should take disbanded cargo off its transport', async (): Promise<void> => {
    const { game, nextTurn, sail, warrior, world } = await setUp();

    nextTurn();

    expect(sail.cargo()).to.deep.equal([warrior]);

    warrior.action(named(warrior, 'Disband')!);

    expect(warrior.destroyed()).true;
    expect(game.transports.hasUnit(warrior)).false;
    expect(sail.cargo()).to.deep.equal([]);
    expect(sail.hasCapacity()).true;
    expect(game.units.getByTile(sail.tile())).to.deep.equal([sail]);

    // The ship sails on without it.
    sail.action(named(sail, 'Move', world.get(3, 2))!);

    expect(sail.tile()).equal(world.get(3, 2));
    expect(warrior.tile()).equal(world.get(2, 2));
  });

  it('should keep cargo aboard, asleep, as its transport sails on', async (): Promise<void> => {
    const { game, nextTurn, sail, warrior, world } = await setUp();

    nextTurn();

    sail.action(named(sail, 'Move', world.get(3, 2))!);

    expect(sail.tile()).equal(world.get(3, 2));
    expect(warrior.tile()).equal(sail.tile());
    expect(game.transports.hasUnit(warrior)).true;
    expect(sail.cargo()).to.deep.equal([warrior]);
    expect(warrior.busy()).instanceof(Stowed);
    expect(warrior.active()).false;
  });

  // An aircraft can be put to sleep aboard a Carrier: v474.05 wakes a sentried aircraft when an enemy comes near, as
  //  `Sleeping` does, and only a land unit at sea stays asleep.
  it('should still offer Sleep to an aircraft aboard a Carrier', async (): Promise<void> => {
    const { game, player, world } = await setUp(),
      carrier = new Carrier(
        null,
        player,
        world.get(3, 3),
        game.rules,
        game.transports
      ),
      fighter = new Fighter(
        null,
        player,
        world.get(3, 3),
        game.rules,
        game.transports
      );

    game.units.register(carrier, fighter);

    expect(carrier.stow(fighter)).true;

    // As `LandAircraft` leaves it, on a later turn.
    fighter.setBusy(new Stowed());
    fighter.setActive(false);
    fighter.moves().set(fighter.movement().value());

    expect(offered(fighter)).to.include('Sleep');
  });
});
