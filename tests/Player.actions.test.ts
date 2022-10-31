import { ActiveUnit, InactiveUnit } from '../PlayerActions';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { expect } from 'chai';
import playerAction from '../Rules/Player/action';

describe('Player.actions', (): void => {
  const ruleRegistry = new RuleRegistry(),
    unitRegistry = new UnitRegistry(),
    player = new Player(ruleRegistry);

  ruleRegistry.register(...playerAction(unitRegistry));

  it('should be possible to have `Unit` related `Player` actions', async (): Promise<void> => {
    const world = await generateWorld(
        generateGenerator(5, 5, Grassland),
        ruleRegistry
      ),
      unit = new Unit(null, player, world.get(2, 2), ruleRegistry);

    unitRegistry.register(unit);

    expect(player.actions()).length(1);
    expect(player.mandatoryActions()).length(0);
    expect(player.action()).instanceof(InactiveUnit);

    unit.setActive(true);
    unit.movement().set(1);
    unit.moves().set(1);

    expect(player.actions()).length(1);
    expect(player.mandatoryActions()).length(1);
    expect(player.action()).instanceof(ActiveUnit);

    unitRegistry.unregister(unit);
  });

  it('should de-prioritise actions related to `Unit`s that are waiting', async (): Promise<void> => {
    const world = await generateWorld(
        generateGenerator(5, 5, Grassland),
        ruleRegistry
      ),
      unit1 = new Unit(null, player, world.get(2, 2), ruleRegistry),
      unit2 = new Unit(null, player, world.get(2, 2), ruleRegistry),
      unit3 = new Unit(null, player, world.get(2, 2), ruleRegistry),
      unit4 = new Unit(null, player, world.get(2, 2), ruleRegistry);

    unitRegistry.register(unit1, unit2, unit3, unit4);

    unit1.movement().set(1);
    unit1.moves().set(1);
    unit2.movement().set(1);
    unit2.moves().set(1);
    unit3.movement().set(1);
    unit3.moves().set(1);
    unit3.setActive(false);
    unit4.movement().set(1);
    unit4.moves().set(1);
    unit4.setActive(false);

    const actions = player.actions();

    expect(actions).length(4);
    expect(actions[0]).instanceof(ActiveUnit);
    expect(actions[1]).instanceof(ActiveUnit);
    expect(actions[2]).instanceof(InactiveUnit);
    expect(actions[3]).instanceof(InactiveUnit);
    expect(actions[0].value() as Unit).equal(unit1);
    expect(actions[1].value() as Unit).equal(unit2);
    expect(actions[2].value() as Unit).equal(unit3);
    expect(actions[3].value() as Unit).equal(unit4);

    unit1.setWaiting();
    unit3.setWaiting();

    const updatedActions = player.actions();

    expect(actions[0]).instanceof(ActiveUnit);
    expect(actions[1]).instanceof(ActiveUnit);
    expect(actions[2]).instanceof(InactiveUnit);
    expect(actions[3]).instanceof(InactiveUnit);
    expect(updatedActions[0].value() as Unit).equal(unit2);
    expect(updatedActions[1].value() as Unit).equal(unit1);
    expect(updatedActions[2].value() as Unit).equal(unit4);
    expect(updatedActions[3].value() as Unit).equal(unit3);

    unitRegistry.unregister(unit1, unit2, unit3, unit4);
  });
});
