import {
  AbortMove,
  Move,
  Overruled,
  Pillage,
  SneakAttack,
  SneakCaptureCity,
  SneakMove,
  SneakPillage,
} from '../Actions';
import { Bomber, Caravan, Diplomat, Settlers, Warrior } from '../Units';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Expired from '@civ-clone/core-diplomacy/Rules/Declaration/Expired';
import { Democracy, Monarchy } from '@civ-clone/library-government/Governments';
import { Irrigation, Road } from '@civ-clone/civ1-world/TileImprovements';
import AvailableGovernmentRegistry from '@civ-clone/core-government/AvailableGovernmentRegistry';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Engine from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import Government from '@civ-clone/core-government/Government';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Impassable from '@civ-clone/core-world-path/Rules/Impassable';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import World from '@civ-clone/core-world/World';
import action from '../Rules/Unit/action';
import created from '../Rules/Unit/created';
import { expect } from 'chai';
import { hasVendetta } from '@civ-clone/library-diplomacy/lib/holds';
import impassable from '../Rules/Unit/impassable';
import moveOneStep from '@civ-clone/base-unit-action-goto/lib/moveOneStep';
import moved from '../Rules/Unit/moved';
import movementCost from '../Rules/Unit/movementCost';
import unitYield from '../Rules/Unit/yield';
import validateMove from '../Rules/Unit/validateMove';

// A treaty partner's land (civ-clone/web-renderer#287) and the Senate (civ-clone/web-renderer#133).
describe('treaties', (): void => {
  let ruleRegistry: RuleRegistry,
    cityRegistry: CityRegistry,
    interactionRegistry: InteractionRegistry,
    playerGovernmentRegistry: PlayerGovernmentRegistry,
    tileImprovementRegistry: TileImprovementRegistry,
    unitImprovementRegistry: UnitImprovementRegistry,
    unitRegistry: UnitRegistry,
    workedTileRegistry: WorkedTileRegistry,
    world: World,
    player: Player,
    partner: Player,
    city: City,
    // The partner's worked, irrigated tile, and where a unit stands next to it.
    land: Tile,
    beside: Tile;

  const addUnit = (
      UnitType: typeof Unit,
      owner: Player = player,
      tile: Tile = beside
    ): Unit => {
      const unit = new UnitType(null, owner, tile, ruleRegistry);

      unit.moves().set(1);

      return unit;
    },
    actionsOf = (unit: Unit, tile: Tile = land): string[] =>
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
    atPeace = (): boolean =>
      interactionRegistry
        .getByPlayers(player, partner)
        .some(
          (interaction) =>
            interaction instanceof Peace && (interaction as Peace).active()
        ),
    setGovernment = (GovernmentType: new () => Government): void => {
      const playerGovernment = new PlayerGovernment(
        player,
        new AvailableGovernmentRegistry(),
        ruleRegistry
      );

      playerGovernmentRegistry.register(playerGovernment);
      playerGovernment.set(new GovernmentType());
    };

  beforeEach(async (): Promise<void> => {
    ruleRegistry = new RuleRegistry();
    cityRegistry = new CityRegistry();
    interactionRegistry = new InteractionRegistry();
    playerGovernmentRegistry = new PlayerGovernmentRegistry();
    tileImprovementRegistry = new TileImprovementRegistry();
    unitImprovementRegistry = new UnitImprovementRegistry();
    unitRegistry = new UnitRegistry();
    workedTileRegistry = new WorkedTileRegistry(ruleRegistry);

    world = new World(new FillGenerator(20, 20, Grassland), ruleRegistry);

    await world.build();

    const engine = {
      emit: (): void => {},
      on: (): void => {},
    } as unknown as Engine;

    ruleRegistry.register(
      ...action(
        undefined,
        cityRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        unitImprovementRegistry,
        unitRegistry,
        undefined,
        undefined,
        undefined,
        interactionRegistry,
        workedTileRegistry,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        engine,
        playerGovernmentRegistry
      ),
      ...created(unitRegistry, engine),
      ...moved(
        undefined,
        ruleRegistry,
        () => 1,
        engine,
        cityRegistry,
        undefined,
        interactionRegistry,
        unitRegistry
      ),
      ...movementCost(tileImprovementRegistry),
      ...validateMove(() => 0),
      ...unitYield(unitImprovementRegistry, ruleRegistry),
      ...impassable(
        interactionRegistry,
        tileImprovementRegistry,
        workedTileRegistry
      )
    );

    player = new Player(ruleRegistry);
    partner = new Player(ruleRegistry);
    city = new City(partner, world.get(5, 5), '', ruleRegistry);
    land = world.get(6, 5);
    beside = world.get(7, 5);

    cityRegistry.register(city);
    workedTileRegistry.register(new WorkedTile(land, city));
    tileImprovementRegistry.register(new Irrigation(land, ruleRegistry));
    interactionRegistry.register(new Peace(player, partner, ruleRegistry));
  });

  describe("moving onto a partner's land", (): void => {
    it('should offer Break treaty and Cancel, not a move', (): void => {
      const unit = addUnit(Warrior);

      expect(actionsOf(unit)).to.deep.equal(['SneakMove', 'AbortMove']);
      expect(find(unit, land, SneakMove).enemy()).to.equal(partner);
      expect(find(unit, land, AbortMove).partner()).to.equal(partner);
    });

    it('should ask Settlers too', (): void => {
      expect(actionsOf(addUnit(Settlers))).to.include('SneakMove');
    });

    it('should move, and end the treaty with no Vendetta, on Break treaty', (): void => {
      const unit = addUnit(Warrior),
        endedBy: (Player | null)[] = [];

      // Who ended it is passed on, so the player who broke it isn't told they were attacked (civ-clone/web-renderer#641).
      ruleRegistry.register(
        new Expired(
          new Criterion((): boolean => true),
          new Effect((declaration: unknown, by: Player | null): void => {
            endedBy.push(by);
          })
        )
      );

      unit.action(find(unit, land, SneakMove));

      expect(endedBy).to.deep.equal([player]);

      expect(unit.tile()).to.equal(land);
      expect(unit.moves().value()).to.equal(0);
      expect(atPeace()).to.false;
      expect(hasVendetta(partner, player, interactionRegistry)).to.false;
    });

    it("should stay put and spend the move's cost on Cancel", (): void => {
      const unit = addUnit(Warrior);

      unit.moves().set(2);
      unit.action(find(unit, land, AbortMove));

      expect(unit.tile()).to.equal(beside);
      expect(unit.moves().value()).to.equal(1);
      expect(atPeace()).to.true;
    });

    it('should cost a road step a third on Cancel', (): void => {
      const unit = addUnit(Warrior);

      tileImprovementRegistry.register(
        new Road(beside, ruleRegistry),
        new Road(land, ruleRegistry)
      );
      unit.action(find(unit, land, AbortMove));

      expect(unit.moves().value()).to.be.closeTo(2 / 3, 1e-9);
    });

    (
      [
        ['Diplomats', Diplomat],
        ['Caravans', Caravan],
        ['aircraft', Bomber],
      ] as [string, typeof Unit][]
    ).forEach(([name, UnitType]): void =>
      it(`should let ${name} move freely`, (): void => {
        const unit = addUnit(UnitType);

        expect(actionsOf(unit)).to.include('Move');
        expect(actionsOf(unit)).not.to.include('SneakMove');
        expect(actionsOf(unit)).not.to.include('AbortMove');
      })
    );

    it('should not ask with one of our own units there already', (): void => {
      const unit = addUnit(Warrior);

      addUnit(Warrior, player, land);

      expect(actionsOf(unit)).to.deep.equal(['Move']);
    });

    it("should not ask about a tile the partner's city doesn't work", (): void => {
      const unit = addUnit(Warrior);

      workedTileRegistry.unregisterByTile(land);

      expect(actionsOf(unit)).to.deep.equal(['Move']);
    });

    it('should not ask about a worked tile with no improvement', (): void => {
      const unit = addUnit(Warrior);

      tileImprovementRegistry.unregister(
        ...tileImprovementRegistry.getByTile(land)
      );

      expect(actionsOf(unit)).to.deep.equal(['Move']);
    });

    it('should not ask without a treaty', (): void => {
      const unit = addUnit(Warrior);

      interactionRegistry
        .getByPlayers(player, partner)
        .forEach((interaction) => (interaction as Peace).expire());

      expect(actionsOf(unit)).to.deep.equal(['Move']);
    });

    it("should not ask about our own city's land", (): void => {
      const unit = addUnit(Warrior, partner);

      expect(actionsOf(unit)).to.deep.equal(['Move']);
    });
  });

  describe("pillaging a partner's land", (): void => {
    it('should offer only a pillage that breaks the treaty', (): void => {
      const unit = addUnit(Warrior, player, land);

      expect(actionsOf(unit, land)).to.include('SneakPillage');
      expect(actionsOf(unit, land)).not.to.include('Pillage');
      expect(find(unit, land, SneakPillage).enemy()).to.equal(partner);
    });

    it('should end the treaty with no Vendetta', (): void => {
      const unit = addUnit(Warrior, player, land);

      unit.action(find(unit, land, SneakPillage));

      expect(atPeace()).to.false;
      expect(hasVendetta(partner, player, interactionRegistry)).to.false;
    });

    it('should pillage as usual where nobody works the tile', (): void => {
      const unit = addUnit(Warrior, player, land);

      workedTileRegistry.unregisterByTile(land);

      expect(find(unit, land, Pillage)).instanceOf(Pillage);
      expect(actionsOf(unit, land)).not.to.include('SneakPillage');
    });
  });

  describe('the Senate', (): void => {
    beforeEach((): void => setGovernment(Democracy));

    it('should overrule a move onto a partner’s land, at its cost', (): void => {
      const unit = addUnit(Warrior),
        overruled = find(unit, land, Overruled);

      expect(actionsOf(unit)).to.deep.equal(['Overruled', 'AbortMove']);
      expect(overruled.action()).instanceOf(SneakMove);
      expect(overruled.partner()).to.equal(partner);
      expect(overruled.moves()).to.equal(1);

      unit.action(overruled);

      expect(unit.tile()).to.equal(beside);
      expect(unit.moves().value()).to.equal(0);
      expect(atPeace()).to.true;
    });

    it('should overrule pillaging, keeping the unit’s moves', (): void => {
      const unit = addUnit(Warrior, player, land),
        overruled = find(unit, land, Overruled);

      expect(actionsOf(unit, land)).not.to.include('SneakPillage');
      expect(overruled.action()).instanceOf(SneakPillage);
      expect(overruled.moves()).to.equal(0);

      unit.action(overruled);

      expect(unit.moves().value()).to.equal(1);
      expect(tileImprovementRegistry.getByTile(land)).not.empty;
      expect(atPeace()).to.true;
    });

    it('should overrule a sneak attack', (): void => {
      const unit = addUnit(Warrior),
        target = world.get(8, 5);

      addUnit(Warrior, partner, target);

      expect(actionsOf(unit, target)).not.to.include('SneakAttack');
      expect(find(unit, target, Overruled).action()).instanceOf(SneakAttack);
      expect(find(unit, target, Overruled).partner()).to.equal(partner);
    });

    it('should overrule a sneak capture', (): void => {
      const unit = addUnit(Warrior, player, world.get(4, 5));

      expect(actionsOf(unit, city.tile())).not.to.include('SneakCaptureCity');
      expect(find(unit, city.tile(), Overruled).action()).instanceOf(
        SneakCaptureCity
      );
    });

    it('should leave a Monarchy free to break a treaty', (): void => {
      playerGovernmentRegistry.unregister(
        ...playerGovernmentRegistry.entries()
      );
      setGovernment(Monarchy);

      const unit = addUnit(Warrior),
        capturer = addUnit(Warrior, player, world.get(4, 5)),
        target = world.get(8, 5);

      addUnit(Warrior, partner, target);

      expect(actionsOf(unit)).to.deep.equal(['SneakMove', 'AbortMove']);
      expect(find(unit, target, SneakAttack)).instanceOf(SneakAttack);
      expect(find(capturer, city.tile(), SneakCaptureCity)).instanceOf(
        SneakCaptureCity
      );
    });
  });

  // A unit with no attack can't attack (civ-clone/web-renderer#642).
  describe('attacking with no attack', (): void => {
    it('should not let Settlers attack', (): void => {
      const unit = addUnit(Settlers),
        target = world.get(8, 5);

      addUnit(Warrior, partner, target);
      interactionRegistry
        .getByPlayers(player, partner)
        .forEach((interaction) => (interaction as Peace).expire());

      expect(actionsOf(unit, target)).to.deep.equal([]);
    });

    it('should not offer Settlers a sneak attack, or one the Senate overrules', (): void => {
      const unit = addUnit(Settlers),
        target = world.get(8, 5);

      addUnit(Warrior, partner, target);

      expect(actionsOf(unit, target)).to.deep.equal([]);

      setGovernment(Democracy);

      expect(actionsOf(unit, target)).to.deep.equal([]);
    });

    it('should still let a Warrior attack', (): void => {
      const unit = addUnit(Warrior),
        target = world.get(8, 5);

      addUnit(Warrior, partner, target);
      interactionRegistry
        .getByPlayers(player, partner)
        .forEach((interaction) => (interaction as Peace).expire());

      expect(actionsOf(unit, target)).to.include('Attack');
    });
  });

  describe('routes', (): void => {
    it("should stop a route passing over a partner's land, keeping the treaty", (): void => {
      const unit = addUnit(Warrior);

      expect(moveOneStep(unit, land, false)).to.equal('blocked');
      expect(unit.tile()).to.equal(beside);
      expect(unit.moves().value()).to.equal(1);
      expect(atPeace()).to.true;
    });

    it("should halt a route ending on a partner's land, for the player to choose", (): void => {
      const unit = addUnit(Warrior);

      expect(moveOneStep(unit, land, true)).to.equal('halted');
      expect(unit.tile()).to.equal(beside);
      expect(atPeace()).to.true;
    });

    it("should go round a partner's land", (): void => {
      const unit = addUnit(Warrior);

      expect(
        ruleRegistry.process(Impassable, unit, land, beside)
      ).to.deep.equal([true]);
    });

    it('should pass where there is no treaty', (): void => {
      const unit = addUnit(Warrior);

      interactionRegistry
        .getByPlayers(player, partner)
        .forEach((interaction) => (interaction as Peace).expire());

      expect(
        ruleRegistry.process(Impassable, unit, land, beside)
      ).to.deep.equal([]);
    });

    it('should not ask about a step off a ship', (): void => {
      const unit = addUnit(Warrior);

      expect(
        ruleRegistry.process(Impassable, unit, land, {
          isLand: () => false,
        } as unknown as Tile)
      ).to.deep.equal([]);
    });
  });

  it('should still offer a plain move elsewhere', (): void => {
    const unit = addUnit(Warrior);

    expect(find(unit, world.get(8, 5), Move)).instanceOf(Move);
  });
});
