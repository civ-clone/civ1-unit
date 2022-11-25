import { BuildIrrigation, Fortify } from '../Actions';
import { Settlers, Warrior } from '../Units';
import Action from '@civ-clone/core-unit/Action';
import Busy from '@civ-clone/core-unit/Rules/Busy';
import CityNameRegistry from '@civ-clone/core-civilization/CityNameRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import { Fortified } from '../UnitImprovements';
import { River } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TerrainFeatureRegistry from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import action from '../Rules/Unit/action';
import activate from '../Rules/Unit/activate';
import available from '@civ-clone/civ1-world/Rules/TileImprovement/available';
import created from '../Rules/Unit/created';
import { expect } from 'chai';
import StaticWorldGenerator from '@civ-clone/simple-world-generator/tests/lib/StaticWorldGenerator';
import unitYield from '../Rules/Unit/yield';

describe('unit:activate', () => {
  const ruleRegistry = new RuleRegistry(),
    cityNameRegistry = new CityNameRegistry(),
    cityRegistry = new CityRegistry(),
    terrainFeatureRegistry = new TerrainFeatureRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    unitRegistry = new UnitRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry(),
    playerResearchRegistry = new PlayerResearchRegistry(),
    transportRegistry = new TransportRegistry();

  ruleRegistry.register(
    ...action(
      cityNameRegistry,
      cityRegistry,
      ruleRegistry,
      tileImprovementRegistry,
      unitImprovementRegistry,
      unitRegistry,
      terrainFeatureRegistry,
      transportRegistry
    ),
    ...activate(unitImprovementRegistry),
    ...available(playerResearchRegistry, tileImprovementRegistry),
    ...created(unitRegistry),
    ...unitYield(unitImprovementRegistry)
  );

  (
    [[Warrior, Fortify, Fortified]] as [
      typeof Unit,
      typeof Action,
      typeof UnitImprovement
    ][]
  ).forEach(([UnitType, ActionType, UnitImprovementType]) => {
    it(`should clear ${UnitImprovementType.name} when activated`, async () => {
      const player = new Player(),
        world = new World(new StaticWorldGenerator(), ruleRegistry);

      await world.build();

      const unit = new UnitType(null, player, world.get(0, 0), ruleRegistry),
        [action] = unit
          .actions()
          .filter((action: Action): boolean => action instanceof ActionType);

      expect(action).to.instanceof(ActionType);

      unitRegistry.register(unit);

      expect(
        unitImprovementRegistry
          .getByUnit(unit)
          .some(
            (improvement: UnitImprovement): boolean =>
              improvement instanceof UnitImprovementType
          )
      ).to.false;

      unit.action(action);

      expect(unit.busy()).to.not.null;

      (unit.busy() as Busy).process(unitImprovementRegistry);

      expect(
        unitImprovementRegistry
          .getByUnit(unit)
          .some(
            (improvement: UnitImprovement): boolean =>
              improvement instanceof UnitImprovementType
          )
      ).to.true;

      unit.activate();

      expect(
        unitImprovementRegistry
          .getByUnit(unit)
          .some(
            (improvement: UnitImprovement): boolean =>
              improvement instanceof UnitImprovementType
          )
      ).to.false;
    });
  });

  ([[Settlers, BuildIrrigation]] as [typeof Unit, typeof Action][]).forEach(
    ([UnitType, ActionType]) => {
      it(`should set Busy when triggered`, async () => {
        const player = new Player(),
          world = new World(new StaticWorldGenerator(), ruleRegistry);

        playerResearchRegistry.register(new PlayerResearch(player));
        await world.build();

        const unit = new UnitType(null, player, world.get(18, 0), ruleRegistry),
          [action] = unit
            .actions()
            .filter((action: Action): boolean => action instanceof ActionType);

        expect(unit.tile().terrain()).to.instanceof(River);

        expect(action).to.instanceof(ActionType);

        unitRegistry.register(unit);
        unit.action(action);

        expect(unit.busy()).to.not.null;

        unit.activate();

        expect(unit.busy()).to.null;
      });
    }
  );
});
