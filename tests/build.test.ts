import {
  Artillery,
  Battleship,
  Bomber,
  Cannon,
  Caravan,
  Carrier,
  Catapult,
  Chariot,
  Cruiser,
  Diplomat,
  Fighter,
  Frigate,
  Horseman,
  Ironclad,
  Knight,
  MechanizedInfantry,
  Musketman,
  Nuclear,
  Rifleman,
  Sail,
  Settlers,
  Spearman,
  Submarine,
  Swordman,
  Tank,
  Transport,
  Trireme,
  Warrior,
} from '../Units';
import Advance from '@civ-clone/core-science/Advance';
import AdvancedFlight from '@civ-clone/base-science-advance-advancedflight/AdvancedFlight';
import Automobile from '@civ-clone/base-science-advance-automobile/Automobile';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import BronzeWorking from '@civ-clone/base-science-advance-bronzeworking/BronzeWorking';
import Buildable from '@civ-clone/core-city-build/Buildable';
import Chivalry from '@civ-clone/base-science-advance-chivalry/Chivalry';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Combustion from '@civ-clone/base-science-advance-combustion/Combustion';
import Conscription from '@civ-clone/base-science-advance-conscription/Conscription';
import Created from '@civ-clone/core-unit/Rules/Created';
import Effect from '@civ-clone/core-rule/Effect';
import Flight from '@civ-clone/base-science-advance-flight/Flight';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import HorsebackRiding from '@civ-clone/base-science-advance-horsebackriding/HorsebackRiding';
import Industrialization from '@civ-clone/base-science-advance-industrialization/Industrialization';
import IronWorking from '@civ-clone/base-science-advance-ironworking/IronWorking';
import LaborUnion from '@civ-clone/base-science-advance-laborunion/LaborUnion';
import Magnetism from '@civ-clone/base-science-advance-magnetism/Magnetism';
import MapMaking from '@civ-clone/base-science-advance-mapmaking/MapMaking';
import MassProduction from '@civ-clone/base-science-advance-massproduction/MassProduction';
import Mathematics from '@civ-clone/base-science-advance-mathematics/Mathematics';
import Metallurgy from '@civ-clone/base-science-advance-metallurgy/Metallurgy';
import Navigation from '@civ-clone/base-science-advance-navigation/Navigation';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { Production } from '@civ-clone/civ1-world/Yields';
import Robotics from '@civ-clone/base-science-advance-robotics/Robotics';
import Rocketry from '@civ-clone/base-science-advance-rocketry/Rocketry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SteamEngine from '@civ-clone/base-science-advance-steamengine/SteamEngine';
import Steel from '@civ-clone/base-science-advance-steel/Steel';
import TheWheel from '@civ-clone/base-science-advance-thewheel/TheWheel';
import Trade from '@civ-clone/base-science-advance-trade/Trade';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import Writing from '@civ-clone/base-science-advance-writing/Writing';
import build from '../Rules/City/build';
import buildCost from '../Rules/City/buildCost';
import buildingComplete from '../Rules/City/buildingComplete';
import { expect } from 'chai';
import setUpCity from '@civ-clone/civ1-city/tests/lib/setUpCity';
import simpleRLELoader from '@civ-clone/simple-world-generator/tests/lib/simpleRLELoader';

describe('CityBuild:build', () => {
  it('should include the expected `Unit`s', async () => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry();

    availableBuildItemsRegistry.register(
      Warrior as unknown as typeof Buildable
    );

    ruleRegistry.register(...buildCost());

    const cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      available = cityBuild.available();

    expect(available).length(1);

    expect(available[0].item()).equal(Warrior);
    expect(available[0].cost().value()).equal(10);

    availableBuildItemsRegistry.register(
      Spearman as unknown as typeof Buildable
    );

    const updatedAvailable = cityBuild.available();

    expect(updatedAvailable).length(2);

    expect(updatedAvailable[0].item()).equal(Warrior);
    expect(updatedAvailable[1].item()).equal(Spearman);
    expect(updatedAvailable[1].cost().value()).equal(20);
  });

  (
    [
      [Artillery, Robotics, null],
      [Battleship, Steel, null],
      [Bomber, AdvancedFlight, null],
      [Cannon, Metallurgy, Robotics],
      [Carrier, AdvancedFlight, null],
      [Caravan, Trade, null],
      [Catapult, Mathematics, Metallurgy],
      [Chariot, TheWheel, Chivalry],
      [Cruiser, Combustion, null],
      [Diplomat, Writing, null],
      [Fighter, Flight, null],
      [Frigate, Magnetism, Industrialization],
      [Horseman, HorsebackRiding, Conscription],
      [Ironclad, SteamEngine, Combustion],
      [Knight, Chivalry, Automobile],
      [MechanizedInfantry, LaborUnion, null],
      [Musketman, Gunpowder, Conscription],
      [Nuclear, Rocketry, null],
      [Rifleman, Conscription, null],
      [Sail, Navigation, Magnetism],
      [Settlers, null, null],
      [Spearman, BronzeWorking, Gunpowder],
      [Submarine, MassProduction, null],
      [Swordman, IronWorking, Conscription],
      [Tank, Automobile, null],
      [Transport, Industrialization, null],
      [Trireme, MapMaking, Navigation],
      [Warrior, null, Gunpowder],
    ] as [typeof Unit, typeof Advance | null, typeof Advance | null][]
  ).forEach(([UnitType, providedBy, obseletedBy]) => {
    it(`should be possible to build ${UnitType.name}${
      providedBy === null ? '' : ` once ${providedBy.name} has been discovered`
    }${
      obseletedBy === null
        ? ''
        : ` until ${obseletedBy.name} has been discovered`
    }`, async (): Promise<void> => {
      const ruleRegistry = new RuleRegistry(),
        availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        playerResearchRegistry = new PlayerResearchRegistry(),
        playerWorldRegistry = new PlayerWorldRegistry(),
        advanceRegistry = new AdvanceRegistry(),
        world = await simpleRLELoader(ruleRegistry)('6GO18G', 5, 5),
        // TODO: Make city coastal to allow building of boats
        city = await setUpCity({
          playerWorldRegistry,
          ruleRegistry,
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
          advanceRegistry,
          ruleRegistry
        );

      advanceRegistry.register(
        AdvancedFlight,
        Automobile,
        BronzeWorking,
        Chivalry,
        Combustion,
        Conscription,
        Flight,
        Gunpowder,
        HorsebackRiding,
        Industrialization,
        IronWorking,
        LaborUnion,
        Magnetism,
        MapMaking,
        MassProduction,
        Mathematics,
        Metallurgy,
        Navigation,
        Robotics,
        Rocketry,
        SteamEngine,
        Steel,
        TheWheel,
        Trade,
        Writing
      );

      availableBuildItemsRegistry.register(
        Artillery as unknown as typeof Buildable,
        Battleship as unknown as typeof Buildable,
        Bomber as unknown as typeof Buildable,
        Cannon as unknown as typeof Buildable,
        Caravan as unknown as typeof Buildable,
        Carrier as unknown as typeof Buildable,
        Catapult as unknown as typeof Buildable,
        Chariot as unknown as typeof Buildable,
        Cruiser as unknown as typeof Buildable,
        Diplomat as unknown as typeof Buildable,
        Fighter as unknown as typeof Buildable,
        Frigate as unknown as typeof Buildable,
        Horseman as unknown as typeof Buildable,
        Ironclad as unknown as typeof Buildable,
        Knight as unknown as typeof Buildable,
        MechanizedInfantry as unknown as typeof Buildable,
        Musketman as unknown as typeof Buildable,
        Nuclear as unknown as typeof Buildable,
        Rifleman as unknown as typeof Buildable,
        Sail as unknown as typeof Buildable,
        Settlers as unknown as typeof Buildable,
        Spearman as unknown as typeof Buildable,
        Submarine as unknown as typeof Buildable,
        Swordman as unknown as typeof Buildable,
        Tank as unknown as typeof Buildable,
        Transport as unknown as typeof Buildable,
        Trireme as unknown as typeof Buildable,
        Warrior as unknown as typeof Buildable
      );

      playerResearchRegistry.register(playerResearch);

      ruleRegistry.register(...build(playerResearchRegistry));

      if (providedBy !== null) {
        expect(
          cityBuild.available().map((buildItem) => buildItem.item())
        ).not.include(UnitType);

        playerResearch.addAdvance(providedBy);
      }

      expect(
        cityBuild.available().map((buildItem) => buildItem.item())
      ).include(UnitType);

      if (obseletedBy !== null) {
        playerResearch.addAdvance(obseletedBy);

        expect(
          cityBuild.available().map((buildItem) => buildItem.item())
        ).not.include(UnitType);
      }
    });
  });

  it('should trigger `City.shrink` when `Settlers are built', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      cityGrowthRegistry = new CityGrowthRegistry(),
      unitRegistry = new UnitRegistry(),
      city = await setUpCity({
        size: 3,
        cityGrowthRegistry,
        ruleRegistry,
      }),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      cityBuild = new CityBuild(
        city,
        availableBuildItemsRegistry,
        ruleRegistry
      );

    ruleRegistry.register(
      ...buildCost(),
      ...buildingComplete(cityGrowthRegistry),
      new Created(new Effect((unit: Unit) => unitRegistry.register(unit)))
    );

    availableBuildItemsRegistry.register(
      Settlers as unknown as typeof Buildable
    );

    expect(cityGrowth.size()).equal(3);

    cityBuild.build(Settlers as unknown as typeof Buildable);

    expect(cityBuild.cost().value()).equal(40);

    cityBuild.add(new Production(40));

    cityBuild.check();

    expect(cityGrowth.size()).equal(2);
    expect(unitRegistry.getByCity(city)).length(1);
  });
});
