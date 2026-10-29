import {
  Caravan,
  Diplomat,
  MechanizedInfantry,
  Musketman,
  Rifleman,
  Settlers,
  Spearman,
  Trireme,
  Warrior,
} from '../Units';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import BronzeWorking from '@civ-clone/base-science-advance-bronzeworking/BronzeWorking';
import BuildPreferencesRegistry from '@civ-clone/core-city-build/BuildPreferencesRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Conscription from '@civ-clone/base-science-advance-conscription/Conscription';
import Created from '@civ-clone/core-city/Rules/Created';
import Engine from '@civ-clone/core-engine/Engine';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import LaborUnion from '@civ-clone/base-science-advance-laborunion/LaborUnion';
import MapMaking from '@civ-clone/base-science-advance-mapmaking/MapMaking';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { Production } from '@civ-clone/civ1-world/Yields';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Trade from '@civ-clone/base-science-advance-trade/Trade';
import Unit from '@civ-clone/core-unit/Unit';
import Writing from '@civ-clone/base-science-advance-writing/Writing';
import build from '../Rules/City/build';
import buildCost from '../Rules/City/buildCost';
import buildingComplete from '../Rules/City/buildingComplete';
import cityBuildingComplete from '@civ-clone/civ1-city/Rules/City/building-complete';
import created from '../Rules/City/created';
import { expect } from 'chai';
import researchComplete from '../Rules/Player/researchComplete';
import setUpCity from '@civ-clone/civ1-city/tests/lib/setUpCity';
import simpleRLELoader from '@civ-clone/simple-world-generator/tests/lib/simpleRLELoader';

// What a city chooses by itself when its player asks it to (civ-clone/web-renderer#690, #691), and a build it can no
//  longer make (civ-clone/web-renderer#693).
describe('build preferences', (): void => {
  const setUp = async (
    units: (typeof Unit)[] = [Warrior, Spearman, Musketman],
    advances: (typeof BronzeWorking)[] = []
  ) => {
    const ruleRegistry = new RuleRegistry(),
      availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      buildPreferencesRegistry = new BuildPreferencesRegistry(),
      cityBuildRegistry = new CityBuildRegistry(),
      cityGrowthRegistry = new CityGrowthRegistry(),
      cityRegistry = new CityRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      playerWorldRegistry = new PlayerWorldRegistry(),
      // Next to the ocean at (1, 1), for the Trireme.
      world = await simpleRLELoader(ruleRegistry)('6GO18G', 5, 5),
      city = await setUpCity({
        cityGrowthRegistry,
        playerWorldRegistry,
        ruleRegistry,
        // Settlers take a citizen.
        size: 2,
        tile: world.get(2, 2),
        world,
      }),
      cityBuild = new CityBuild(
        city,
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      playerResearch = new PlayerResearch(
        city.player(),
        new AdvanceRegistry(),
        ruleRegistry
      );

    availableBuildItemsRegistry.register(
      ...(units as unknown as (typeof Buildable)[])
    );
    cityBuildRegistry.register(cityBuild);
    cityRegistry.register(city);
    playerResearchRegistry.register(playerResearch);
    advances.forEach((Advance) => playerResearch.addAdvance(Advance));

    ruleRegistry.register(
      ...build(playerResearchRegistry),
      ...buildCost(),
      ...buildingComplete(cityGrowthRegistry, buildPreferencesRegistry),
      ...created(cityBuildRegistry, buildPreferencesRegistry),
      ...researchComplete(cityRegistry, cityBuildRegistry)
    );

    const complete = (UnitType: typeof Unit): void => {
      cityBuild.build(UnitType as unknown as typeof Buildable);
      cityBuild.add(new Production(cityBuild.remaining()));
      cityBuild.check();
    };

    return {
      availableBuildItemsRegistry,
      buildPreferencesRegistry,
      city,
      cityBuild,
      complete,
      playerResearch,
      ruleRegistry,
    };
  };

  describe('keep building military units (civ-clone/web-renderer#690)', (): void => {
    it('should leave the choice to the player when it is off', async (): Promise<void> => {
      const { cityBuild, complete } = await setUp();

      complete(Warrior);

      expect(cityBuild.building()).null;
      expect(cityBuild.cleared()).eql({ reason: 'completed', item: Warrior });
    });

    [Warrior, Trireme].forEach((UnitType) =>
      it(`should build another ${UnitType.name} when it is on`, async (): Promise<void> => {
        const { buildPreferencesRegistry, city, cityBuild, complete } =
          await setUp([Warrior, Trireme], [MapMaking]);

        buildPreferencesRegistry.set(city.player(), { repeat: true });

        complete(UnitType);

        expect(cityBuild.building()!.item()).equal(UnitType);
        expect(cityBuild.progress().value()).equal(0);
        expect(cityBuild.cleared()).null;
      })
    );

    [Settlers, Diplomat, Caravan].forEach((UnitType) =>
      it(`should still ask after ${UnitType.name}`, async (): Promise<void> => {
        const { buildPreferencesRegistry, city, cityBuild, complete } =
          await setUp([UnitType], [Trade, Writing]);

        buildPreferencesRegistry.set(city.player(), { repeat: true });

        complete(UnitType);

        expect(cityBuild.building()).null;
      })
    );

    it('should already be building the next when civ1-city announces the last, so it can go unannounced', async (): Promise<void> => {
      const {
          buildPreferencesRegistry,
          city,
          cityBuild,
          complete,
          ruleRegistry,
        } = await setUp(),
        engine = new Engine(),
        buildingAtAnnouncement: unknown[] = [];

      // civ1-city's ahead of civ1-unit's, as a game registers them, so only the priority can put the repeat first.
      const unitRules = ruleRegistry.get(BuildingComplete);

      ruleRegistry.unregister(...unitRules);
      ruleRegistry.register(
        ...cityBuildingComplete(engine, ruleRegistry),
        ...unitRules
      );
      engine.on('city:building-complete', (announced: CityBuild): void => {
        buildingAtAnnouncement.push(announced.building()?.item() ?? null);
      });

      buildPreferencesRegistry.set(city.player(), { repeat: true });

      complete(Warrior);

      expect(buildingAtAnnouncement).eql([Warrior]);
    });

    it('should leave a city on Auto to choose for itself', async (): Promise<void> => {
      const { buildPreferencesRegistry, city, cityBuild, complete } =
        await setUp();

      buildPreferencesRegistry.set(city.player(), { repeat: true });
      cityBuild.setAuto(true);

      complete(Warrior);

      expect(cityBuild.building()).null;
    });

    it('should leave the choice to the player once the unit can no longer be built', async (): Promise<void> => {
      const {
        availableBuildItemsRegistry,
        buildPreferencesRegistry,
        city,
        cityBuild,
      } = await setUp();

      buildPreferencesRegistry.set(city.player(), { repeat: true });
      cityBuild.build(Warrior as unknown as typeof Buildable);
      availableBuildItemsRegistry.unregister(
        Warrior as unknown as typeof Buildable
      );
      cityBuild.add(new Production(cityBuild.remaining()));
      cityBuild.check();

      expect(cityBuild.building()).null;
      expect(cityBuild.cleared()).eql({ reason: 'completed', item: Warrior });
    });
  });

  describe('new cities build a defender (civ-clone/web-renderer#691)', (): void => {
    const units = [
      Warrior,
      Spearman,
      Musketman,
      Rifleman,
      MechanizedInfantry,
      Settlers,
    ];

    (
      [
        [[], Warrior],
        [[BronzeWorking], Spearman],
        [[BronzeWorking, Gunpowder], Musketman],
        [[Gunpowder, Conscription], Rifleman],
        [[Gunpowder, Conscription, LaborUnion], MechanizedInfantry],
      ] as [(typeof BronzeWorking)[], typeof Unit][]
    ).forEach(([advances, Expected]) =>
      it(`should start on ${Expected.name} knowing ${
        advances.map((Advance) => Advance.name).join(', ') || 'nothing'
      }`, async (): Promise<void> => {
        const { buildPreferencesRegistry, city, cityBuild, ruleRegistry } =
          await setUp(units, advances);

        buildPreferencesRegistry.set(city.player(), { firstBuild: true });
        ruleRegistry.process(Created, city);

        expect(cityBuild.building()!.item()).equal(Expected);
      })
    );

    it('should leave the choice to the player when it is off', async (): Promise<void> => {
      const { city, cityBuild, ruleRegistry } = await setUp(units);

      ruleRegistry.process(Created, city);

      expect(cityBuild.building()).null;
    });

    it('should not replace a build the ruleset has already chosen', async (): Promise<void> => {
      const { buildPreferencesRegistry, city, cityBuild, ruleRegistry } =
        await setUp(units);

      buildPreferencesRegistry.set(city.player(), { firstBuild: true });
      cityBuild.build(Settlers as unknown as typeof Buildable);
      ruleRegistry.process(Created, city);

      expect(cityBuild.building()!.item()).equal(Settlers);
    });
  });

  describe('a build that can no longer be made (civ-clone/web-renderer#693)', (): void => {
    it('should stop building Spearman when Gunpowder is discovered, and say why', async (): Promise<void> => {
      const { cityBuild, playerResearch } = await setUp(undefined, [
        BronzeWorking,
      ]);

      cityBuild.build(Spearman as unknown as typeof Buildable);
      cityBuild.add(new Production(5));
      playerResearch.addAdvance(Gunpowder);

      expect(cityBuild.building()).null;
      expect(cityBuild.progress().value()).equal(5);
      expect(cityBuild.cleared()).eql({
        reason: 'unavailable',
        item: Spearman,
      });
    });

    it('should leave a build that can still be made', async (): Promise<void> => {
      const { cityBuild, playerResearch } = await setUp(undefined, [
        BronzeWorking,
      ]);

      cityBuild.build(Spearman as unknown as typeof Buildable);
      playerResearch.addAdvance(Conscription);

      expect(cityBuild.building()!.item()).equal(Spearman);
    });
  });
});
