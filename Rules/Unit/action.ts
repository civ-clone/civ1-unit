import {
  Action,
  hasMovesLeft,
  isNeighbouringTile,
} from '@civ-clone/core-unit/Rules/Action';
import { Land as LandUnit, NavalTransport } from '../../Types';
import {
  AbortMove,
  Activate,
  Attack,
  Automate,
  BribeUnit,
  BuildIrrigation,
  BuildMine,
  BuildRailroad,
  BuildRoad,
  CaptureCity,
  CleanPollution,
  ClearForest,
  ClearJungle,
  ClearSwamp,
  Disband,
  Disembark,
  Embark,
  EstablishEmbassy,
  EstablishTradeRoute,
  Explore,
  Fortify,
  FoundCity,
  GoTo,
  InciteRevolt,
  IndustrialSabotage,
  InvestigateCity,
  JoinCity,
  LandAircraft,
  MeetWithLeader,
  Move,
  NoOrders,
  NuclearAttack,
  Pillage,
  PlantForest,
  RailroadTo,
  RoadTo,
  SetHomeCity,
  Sleep,
  SneakAttack,
  SneakCaptureCity,
  SneakInciteRevolt,
  SneakMove,
  SneakNuclearAttack,
  SneakPillage,
  SneakStealTechnology,
  StealTechnology,
  SubvertCity,
  Unload,
} from '../../Actions';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityNameRegistry,
  instance as cityNameRegistryInstance,
} from '@civ-clone/core-civilization/CityNameRegistry';
import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  LandMassRegistry,
  instance as landMassRegistryInstance,
} from '@civ-clone/core-world/LandMassRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  PlayerTreasuryRegistry,
  instance as playerTreasuryRegistryInstance,
} from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { bribeCost, inciteCost } from '../../lib/diplomatCosts';
import AdvanceStolen from '@civ-clone/base-unit-action-steal-technology/AdvanceStolen';
import { Palace } from '@civ-clone/library-city/CityImprovements';
import Player from '@civ-clone/core-player/Player';
import { stealableAdvances } from './diplomat';
import {
  Forest,
  Grassland,
  Jungle,
  Plains,
  River,
  Swamp,
} from '@civ-clone/civ1-world/Terrains';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  Irrigation,
  Mine,
  Pollution,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import { Land, Water } from '@civ-clone/core-terrain/Types';
import {
  PathFinderRegistry,
  instance as pathFinderRegistryInstance,
} from '@civ-clone/core-world-path/PathFinderRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import {
  StrategyRegistry,
  instance as strategyRegistryInstance,
} from '@civ-clone/core-strategy/StrategyRegistry';
import {
  TerrainFeatureRegistry,
  instance as terrainFeatureRegistryInstance,
} from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import DelayedAction from '@civ-clone/core-unit/DelayedAction';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import Or from '@civ-clone/core-rule/Criteria/Or';
import RoutePlanner from '@civ-clone/base-unit-action-rules/lib/RoutePlanner';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import routeOrders from '../../lib/routeOrders';
import hasSenate from '../../lib/senate';
import treatyPartner from '../../lib/treatyPartner';
import { joinableCity } from '@civ-clone/base-unit-action-join-city/joinableCity';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import Wonder from '@civ-clone/core-wonder/Wonder';
import civ1Distance from '@civ-clone/civ1-world/lib/civ1Distance';
import IgnoresZoneOfControl from '@civ-clone/base-unit-trait-ignores-zone-of-control/IgnoresZoneOfControl';
import { isA } from '@civ-clone/core-unit/traits';
import zoneOfControl from '@civ-clone/base-zone-of-control/lib/zoneOfControl';
import {
  attackCriteria as buildAttackCriteria,
  captureCityCriteria as buildCaptureCityCriteria,
} from '@civ-clone/base-unit-action-rules/lib/criteria/attack';
import { tileHasCity } from '@civ-clone/base-unit-action-rules/lib/criteria/domain';
import { pillageCriteria as buildPillageCriteria } from '@civ-clone/base-unit-action-rules/lib/criteria/pillage';
import {
  bribeUnitCriteria as buildBribeUnitCriteria,
  canIncite as buildCanIncite,
  canSteal as buildCanSteal,
  diplomat,
  hasNoEmbassy as buildHasNoEmbassy,
} from '@civ-clone/base-unit-action-rules/lib/criteria/diplomat';
import domainMoveCriteria from '@civ-clone/base-unit-action-rules/lib/criteria/move';
import landing from '@civ-clone/base-unit-action-rules/lib/criteria/landing';
import nuclearCriteria from '@civ-clone/base-unit-action-rules/lib/criteria/nuclear';
import partnerCriteria from '@civ-clone/base-unit-action-rules/lib/criteria/partners';
import peaceCriteria from '@civ-clone/base-unit-action-rules/lib/criteria/peace';
import tradeRoute from '@civ-clone/base-unit-action-rules/lib/criteria/tradeRoute';
import {
  cleanPollution,
  requiresImprovement,
  terrainConversion,
  terrainJob,
} from '@civ-clone/base-unit-action-rules/lib/criteria/worker';
import orders from '@civ-clone/base-unit-action-rules/lib/criteria/orders';
import transport from '@civ-clone/base-unit-action-rules/lib/criteria/transport';
import actionRules, {
  ActionRow,
} from '@civ-clone/base-unit-action-rules/lib/actionRules';

export const getRules = (
  cityNameRegistry: CityNameRegistry = cityNameRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance,
  turn: Turn = turnInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  pathFinderRegistry: PathFinderRegistry = pathFinderRegistryInstance,
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  landMassRegistry: LandMassRegistry = landMassRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  playerTreasuryRegistry: PlayerTreasuryRegistry = playerTreasuryRegistryInstance,
  strategyRegistry: StrategyRegistry = strategyRegistryInstance,
  engine: Engine = engineInstance,
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance
): Action[] => {
  // Where an aircraft moving onto `to` would land, for `land-aircraft`.
  const { landsInCity, landingTransport, canLandAircraft } = landing({
    cityRegistry,
    unitRegistry,
  });

  // The routes the `goto`, `road-to` and `railroad-to` criteria find, kept for the actions their effects build
  //  (civ-clone/web-renderer#307). Every action's criteria are validated before any effect runs, so `goto` comes before
  //  `road-to` and `railroad-to`, which reuse its route.
  const routePlanner = new RoutePlanner({
    engine,
    pathFinderRegistry,
    ruleRegistry,
    strategyNoteRegistry,
  });

  // An attack or a capture only once any peace has expired; the sneak forms of each (and every covert action) break an
  //  active one.
  const {
      atPeace,
      allPeaceExpired,
      allAtPeace,
      ownerPeaceExpired,
      peaceWithOwner,
    } = peaceCriteria({ cityRegistry, interactionRegistry, unitRegistry }),
    // Diplomats and Caravans (`NonCombatant`) never attack: v474.05 stops them before any combat. A Nuclear unit
    //  (`Detonates`) never fights: it detonates (`nuclear-attack`, below). A unit with no attack (Settlers, a Transport)
    //  can't attack: v474.05 lets it, and it always loses (#642).
    attackCriteria = buildAttackCriteria({ cityRegistry, unitRegistry }),
    // Diplomats and Caravans never take a city: their own actions are what they can do to a foreign city.
    captureCityCriteria = buildCaptureCityCriteria({
      cityRegistry,
      unitRegistry,
    });

  // The players a Nuclear unit would attack on `to`: those with a unit there, and the owner of a city there. In
  //  v474.05 it detonates when it attacks any unit, or moves into a rival's city, and never over empty land.
  const {
    nuclearTargets,
    nuclearAttackCriteria,
    noNuclearTargetAtPeace,
    anyNuclearTargetAtPeace,
  } = nuclearCriteria({ cityRegistry, unitRegistry }, atPeace);

  // Where a Caravan can set up a trade route (v474.05 `PlayerTurn.cs` L1802-L1890): any foreign city, but not from a
  //  ship; or one of its owner's own cities other than its home, 10 or more away, or on another continent while that
  //  city isn't building a Wonder (civ-clone/web-renderer#57).
  const { tradeRouteCriteria } = tradeRoute(
    { cityRegistry },
    {
      qualifies: (home: City, city: City): boolean => {
        if (civ1Distance(home.tile(), city.tile()) >= 10) {
          return true;
        }

        const building = cityBuildRegistry.getByCity(city).building();

        return (
          landMassRegistry.getByTile(home.tile()) !==
            landMassRegistry.getByTile(city.tile()) &&
          !(
            building !== null &&
            Object.prototype.isPrototypeOf.call(Wonder, building.item())
          )
        );
      },
    }
  );

  // A Diplomat's actions on a rival's city (v474.05 `PlayerTurn.cs` L1802-L1905, civ-clone/web-renderer#58): next to
  //  it, with moves left, and not from a ship. Units in the city don't matter: the Diplomat never enters it.
  const { diplomatCriteria } = diplomat({ cityRegistry }),
    // Once per city, and only with something to take.
    canSteal = buildCanSteal(
      { cityRegistry },
      (unit: Unit, city: City): boolean =>
        !interactionRegistry
          .entries()
          .some(
            (interaction) =>
              interaction instanceof AdvanceStolen &&
              (interaction as unknown as AdvanceStolen).city() === city
          ) &&
        stealableAdvances(unit.player(), city.player(), playerResearchRegistry)
          .length > 0
    ),
    // One embassy with each civilization.
    hasNoEmbassy = buildHasNoEmbassy({ cityRegistry, interactionRegistry }),
    // A capital can't be incited.
    canIncite = buildCanIncite({ cityRegistry }, (city: City): boolean =>
      cityImprovementRegistry
        .getByCity(city)
        .some(
          (improvement) =>
            improvement instanceof Palace && !improvement.destroyed()
        )
    ),
    // A lone foreign unit, not in a city (v474.05 `F22_0000_0639`).
    bribeUnitCriteria = buildBribeUnitCriteria({ cityRegistry, unitRegistry }),
    costToIncite = (to: Tile): number =>
      inciteCost(
        cityRegistry.getByTile(to)!,
        cityGrowthRegistry,
        cityImprovementRegistry,
        playerTreasuryRegistry,
        ruleRegistry
      );

  // A treaty partner's land (#287, `treatyPartner`): v474.05 asks about a move onto it from land, unless the unit's
  //  own units are there already (`CheckPlayerTurn.cs` ~L1662-1705), and about pillaging it.
  const partnerOf = (unit: Unit, tile: Tile): Player | null =>
      treatyPartner(
        unit,
        tile,
        interactionRegistry,
        tileImprovementRegistry,
        workedTileRegistry
      ),
    // `onPartnersLand` is the first of their actions' criteria: it's the cheap one that rules most tiles out (most
    //  tiles aren't worked).
    {
      movePartner,
      onPartnersLand,
      offPartnersLand,
      pillagingPartnersLand,
      notPillagingPartnersLand,
    } = partnerCriteria({ unitRegistry }, partnerOf);

  // The owner of the city on `to`, for the overruled forms of the actions on a city.
  const cityOwner = (unit: Unit, to: Tile): Player =>
    cityRegistry.getByTile(to)!.player();

  // Every land unit but Diplomats and Caravans can pillage in Civ1, so Settlers (`Terraforms`) can as well as the
  //  military units (`Fortifies`). Kept in this shape, which the equivalence test checks: in Civ1 it is every land unit
  //  but the `NonCombatant`s.
  const pillageCriteria = buildPillageCriteria(
      { tileImprovementRegistry },
      (improvement: TileImprovement): boolean =>
        [Irrigation, Mine, Railroad, Road].some(
          (Improvement: typeof TileImprovement): boolean =>
            improvement instanceof Improvement
        )
    ),
    // This is analogous to the original Civilization unit adjacency rules.
    // You may only move your `Unit` to the `Tile` if...
    moveCriteria = domainMoveCriteria(
      { cityRegistry, unitRegistry },
      zoneOfControl(unitRegistry, {
        exemptMovers: [
          // ...it's not a `LandUnit` (`Air`, and `Naval` `Unit`s can ignore adjacency `Rule`s)...
          (unit: Unit, to: Tile, from: Tile): boolean => !isA(unit, LandUnit),
          // ...it ignores zones of control (a Diplomat or a Caravan)...
          (unit: Unit, to: Tile): boolean =>
            unit.hasTrait(IgnoresZoneOfControl),
        ],
        // ...there's not an enemy `Unit` adjacent to the current `Tile` and also the target `Tile`...
        exerts: (tileUnit: Unit, unit: Unit): boolean =>
          isA(tileUnit, LandUnit) &&
          // Ignore `LandUnit`s in `Transport` on `Water`
          tileUnit.tile().terrain() instanceof Land &&
          tileUnit.player() !== unit.player(),
        exemptMoves: [
          // ...unless you're moving to a `Tile` that already has one of your `Unit`s on...
          (unit: Unit, to: Tile, from: Tile): boolean =>
            unitRegistry
              .getByTile(to)
              .filter(
                (tileUnit: Unit): boolean => tileUnit.player() === unit.player()
              ).length > 0,
          // ...or to, or from, one of your `City`s.
          (unit: Unit, to: Tile, from: Tile): boolean =>
            [from, to]
              .map((tile) => cityRegistry.getByTile(tile))
              .some(
                (city) =>
                  city instanceof City && city.player() === unit.player()
              ),
        ],
      })
    );

  // Terrain work, boarding and leaving transports, and the orders a unit is given on its own tile.
  const {
      fortifyCriteria,
      sleepCriteria,
      activateCriteria,
      disbandCriteria,
      noOrdersCriteria,
      foundCityCriteria,
      joinCityCriteria,
      setHomeCityCriteria,
      exploreCriteria,
      automateCriteria,
    } = orders({ cityRegistry, ruleRegistry, unitImprovementRegistry }),
    { embarkCriteria, disembarkCriteria, unloadCriteria } = transport({
      transportRegistry,
      unitRegistry,
    });

  // The table, in the order the actions are offered: the AI takes the first action it's offered, and the UI lists them
  //  in this order. A Republic or Democracy can't break a treaty (#133): a row that would (`breaksTreaty`) is offered
  //  only without a Senate, and with one its `overruled/` form is offered instead, straight after it, which v474.05
  //  answers with "Overruled by the Senate. Action canceled." A blocked move has spent its cost already; a blocked
  //  attack keeps its moves (#133).
  return actionRules(
    'civ1-unit',
    [
      // First of the Diplomat's: v474.05's computer players only ever steal, and the AI takes the first action offered.
      {
        name: 'steal-technology',
        criteria: [
          ...diplomatCriteria,
          canSteal,
          new Criterion(
            (unit: Unit, to: Tile): boolean =>
              !peaceWithOwner.validate(unit, to)
          ),
        ],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new StealTechnology(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!,
            ruleRegistry
          ) as UnitAction,
      },

      {
        name: 'sneak-steal-technology',
        criteria: [...diplomatCriteria, canSteal, peaceWithOwner],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const city = cityRegistry.getByTile(to)!;

          return new SneakStealTechnology(
            from,
            to,
            unit,
            city,
            city.player(),
            ruleRegistry
          ) as unknown as UnitAction;
        },
        breaksTreaty: {
          blocked: (unit: Unit, to: Tile, from: Tile): UnitAction =>
            new SneakStealTechnology(
              from,
              to,
              unit,
              cityRegistry.getByTile(to)!,
              cityOwner(unit, to),
              ruleRegistry
            ) as unknown as UnitAction,
        },
      },

      // v474.05 has no peace check on an embassy or an investigation, and neither breaks a treaty.
      {
        name: 'establish-embassy',
        criteria: [...diplomatCriteria, hasNoEmbassy],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new EstablishEmbassy(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!,
            ruleRegistry
          ) as UnitAction,
      },

      {
        name: 'investigate-city',
        criteria: [...diplomatCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new InvestigateCity(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!,
            ruleRegistry
          ) as UnitAction,
      },

      {
        name: 'industrial-sabotage',
        criteria: [...diplomatCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new IndustrialSabotage(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!,
            ruleRegistry
          ) as UnitAction,
      },

      // Offered whether or not the Diplomat's owner can afford it, so the price can be shown; the action refuses if
      //  not.
      {
        name: 'incite-revolt',
        criteria: [
          ...diplomatCriteria,
          canIncite,
          new Criterion(
            (unit: Unit, to: Tile): boolean =>
              !peaceWithOwner.validate(unit, to)
          ),
        ],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new InciteRevolt(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!,
            costToIncite(to),
            ruleRegistry
          ) as unknown as UnitAction,
      },

      // At peace, inciting ends the peace; subverting costs double and keeps it. v474.05 has no Senate check on either;
      //  inciting gets one here (#133).
      {
        name: 'sneak-incite-revolt',
        criteria: [...diplomatCriteria, canIncite, peaceWithOwner],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const city = cityRegistry.getByTile(to)!;

          return new SneakInciteRevolt(
            from,
            to,
            unit,
            city,
            costToIncite(to),
            city.player(),
            ruleRegistry
          ) as unknown as UnitAction;
        },
        breaksTreaty: {
          blocked: (unit: Unit, to: Tile, from: Tile): UnitAction =>
            new SneakInciteRevolt(
              from,
              to,
              unit,
              cityRegistry.getByTile(to)!,
              costToIncite(to),
              cityOwner(unit, to),
              ruleRegistry
            ) as unknown as UnitAction,
        },
      },

      {
        name: 'subvert-city',
        criteria: [...diplomatCriteria, canIncite, peaceWithOwner],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new SubvertCity(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!,
            costToIncite(to) * 2,
            ruleRegistry
          ) as unknown as UnitAction,
      },

      // The Diplomat stays, with no moves left (v474.05 `F22_0000_0000`).
      {
        name: 'meet-with-leader',
        criteria: [...diplomatCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new MeetWithLeader(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!.player(),
            ruleRegistry
          ) as UnitAction,
      },

      // A lone foreign unit, not in a city, ships and aircraft included (v474.05 `F22_0000_0639`). There's no peace
      //  check, and the Diplomat keeps its moves.
      {
        name: 'bribe-unit',
        criteria: [...bribeUnitCriteria],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const [target] = unitRegistry.getByTile(to);

          return new BribeUnit(
            from,
            to,
            unit,
            target,
            bribeCost(
              target,
              cityImprovementRegistry,
              playerTreasuryRegistry,
              ruleRegistry
            ),
            ruleRegistry
          ) as unknown as UnitAction;
        },
      },

      // Before `move`, so the arrow keys and the AI take it first, as Civ1's AI does: it always sets up the route.
      //  `move` is still offered into one of the player's own cities, so the player can choose to keep moving.
      {
        name: 'establish-trade-route',
        criteria: [...tradeRouteCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new EstablishTradeRoute(
            from,
            to,
            unit,
            cityRegistry.getByTile(to)!,
            ruleRegistry
          ) as UnitAction,
      },

      // Before `move`, so it's the first action for a tile an aircraft can land on: the arrow keys and the AI take the
      // first action. `move` is still offered there, so a GoTo (and the action menu) can fly over instead.
      {
        name: 'land-aircraft',
        criteria: [
          isNeighbouringTile,
          hasMovesLeft,
          new Criterion((unit: Unit, to: Tile): boolean =>
            canLandAircraft(unit, to)
          ),
          new Criterion((unit: Unit, to: Tile): boolean =>
            unitRegistry
              .getByTile(to)
              .every(
                (tileUnit: Unit): boolean => tileUnit.player() === unit.player()
              )
          ),
        ],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new LandAircraft(
            from,
            to,
            unit,
            // A city with a Carrier in it: land in the city.
            landsInCity(unit, to) ? null : landingTransport(unit, to),
            ruleRegistry
          ) as UnitAction,
      },

      {
        name: 'move',
        criteria: [...moveCriteria, offPartnersLand],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Move(from, to, unit, ruleRegistry) as UnitAction,
      },

      // Onto a treaty partner's land (#287): Break treaty or, with a Senate, `Overruled`, then Cancel, which spends the
      //  move's cost (v474.05 takes it before asking).
      {
        name: 'sneak-move',
        criteria: [onPartnersLand, ...moveCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new SneakMove(
            from,
            to,
            unit,
            movePartner(unit, to, from)!,
            ruleRegistry
          ) as UnitAction,
        breaksTreaty: {
          blocked: (unit: Unit, to: Tile, from: Tile): UnitAction =>
            new SneakMove(
              from,
              to,
              unit,
              movePartner(unit, to, from)!,
              ruleRegistry
            ) as UnitAction,
          cost: (unit: Unit, to: Tile, from: Tile): number =>
            new Move(from, to, unit, ruleRegistry).movementCost(),
        },
      },

      {
        name: 'abort-move',
        criteria: [onPartnersLand, ...moveCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new AbortMove(
            from,
            to,
            unit,
            movePartner(unit, to, from)!,
            ruleRegistry
          ) as UnitAction,
      },

      {
        name: 'attack',
        criteria: [...attackCriteria, allPeaceExpired],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Attack(from, to, unit, ruleRegistry, unitRegistry),
      },

      {
        name: 'sneak-attack',
        criteria: [...attackCriteria, allAtPeace],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const enemies = Array.from(
            new Set(
              unitRegistry
                .getByTile(to)
                .filter((tileUnit) =>
                  interactionRegistry
                    .getByPlayers(unit.player(), tileUnit.player())
                    .some(
                      (interaction): interaction is Peace =>
                        interaction instanceof Peace && interaction.active()
                    )
                )
                .map((unit) => unit.player())
            )
          );

          if (enemies.length > 1) {
            console.warn('Multiple targets for declaring war:');
            console.warn(enemies);
            console.warn('core-unit/Rules/Unit/action.ts');
          }

          return new SneakAttack(
            from,
            to,
            unit,
            enemies[0],
            ruleRegistry,
            unitRegistry
          ) as UnitAction;
        },
        breaksTreaty: {
          blocked: (unit: Unit, to: Tile, from: Tile): UnitAction =>
            new SneakAttack(
              from,
              to,
              unit,
              unitRegistry.getByTile(to)[0].player(),
              ruleRegistry,
              unitRegistry
            ) as UnitAction,
        },
      },

      {
        name: 'nuclear-attack',
        criteria: [...nuclearAttackCriteria, noNuclearTargetAtPeace],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new NuclearAttack(from, to, unit, ruleRegistry) as UnitAction,
      },

      {
        name: 'sneak-nuclear-attack',
        criteria: [...nuclearAttackCriteria, anyNuclearTargetAtPeace],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const [enemy] = nuclearTargets(unit, to).filter(
            (player: Player): boolean => atPeace(unit.player(), player)
          );

          return new SneakNuclearAttack(
            from,
            to,
            unit,
            enemy,
            ruleRegistry
          ) as UnitAction;
        },
        breaksTreaty: {
          blocked: (unit: Unit, to: Tile, from: Tile): UnitAction =>
            new SneakNuclearAttack(
              from,
              to,
              unit,
              nuclearTargets(unit, to).filter((player: Player): boolean =>
                atPeace(unit.player(), player)
              )[0],
              ruleRegistry
            ) as UnitAction,
        },
      },

      {
        name: 'capture-city',
        criteria: [...captureCityCriteria, ownerPeaceExpired],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const city = cityRegistry.getByTile(to)!;

          return new CaptureCity(
            from,
            to,
            unit,
            city,
            ruleRegistry
          ) as UnitAction;
        },
      },

      {
        name: 'sneak-capture-city',
        criteria: [...captureCityCriteria, peaceWithOwner],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const city = cityRegistry.getByTile(to)!;

          return new SneakCaptureCity(
            from,
            to,
            unit,
            city,
            city.player(),
            ruleRegistry
          ) as UnitAction;
        },
        breaksTreaty: {
          blocked: (unit: Unit, to: Tile, from: Tile): UnitAction =>
            new SneakCaptureCity(
              from,
              to,
              unit,
              cityRegistry.getByTile(to)!,
              cityOwner(unit, to),
              ruleRegistry
            ) as UnitAction,
        },
      },

      {
        name: 'pillage',
        criteria: [...pillageCriteria, notPillagingPartnersLand],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Pillage(
            from,
            to,
            unit,
            ruleRegistry,
            tileImprovementRegistry,
            turn
          ),
      },

      // Pillaging a treaty partner's land breaks the treaty (v474.05 `CheckPlayerTurn.cs` ~L642-686).
      {
        name: 'sneak-pillage',
        criteria: [...pillageCriteria, pillagingPartnersLand],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new SneakPillage(
            from,
            to,
            unit,
            partnerOf(unit, to)!,
            ruleRegistry,
            tileImprovementRegistry,
            turn
          ) as UnitAction,
        breaksTreaty: {
          blocked: (unit: Unit, to: Tile, from: Tile): UnitAction =>
            new SneakPillage(
              from,
              to,
              unit,
              partnerOf(unit, to)!,
              ruleRegistry,
              tileImprovementRegistry,
              turn
            ) as UnitAction,
        },
      },

      {
        name: 'fortify',
        criteria: [...fortifyCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Fortify(
            from,
            to,
            unit,
            ruleRegistry,
            turn,
            unitImprovementRegistry
          ),
      },

      {
        name: 'sleep',
        criteria: [...sleepCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Sleep(from, to, unit, ruleRegistry, turn),
      },

      // Waking a unit that's asleep, fortified or busy with a job (civ-clone/web-renderer#160): its `Activate` rules
      //  (`activate.ts`) decide what that does. Not cargo: a unit `Stowed` aboard a transport is woken by unloading, and
      //  an aircraft collected by a Carrier stays active while stowed, so it would be offered this beside its own orders.
      {
        name: 'activate',
        criteria: [...activateCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Activate(from, to, unit, ruleRegistry),
      },

      {
        name: 'disband',
        criteria: [...disbandCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Disband(from, to, unit, ruleRegistry),
      },

      {
        name: 'no-orders',
        criteria: [...noOrdersCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new NoOrders(from, to, unit, ruleRegistry),
      },

      {
        name: 'found-city',
        criteria: [...foundCityCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new FoundCity(
            from,
            to,
            unit,
            cityNameRegistry,
            ruleRegistry,
            workedTileRegistry
          ),
      },

      // On one of its player's cities, where `found-city` is not offered, so the two can share a key. The size limit is
      // a `CanJoinCity` rule (`canJoinCity.ts`).
      {
        name: 'join-city',
        criteria: [...joinCityCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new JoinCity(
            from,
            to,
            unit,
            joinableCity(unit, from, cityRegistry, ruleRegistry)!,
            ruleRegistry,
            cityGrowthRegistry
          ),
      },

      // The improvements a unit builds, each with the action that builds it and what else it needs.
      ...(
        [
          [
            Irrigation,
            BuildIrrigation,
            // Water nearby: Civ1's River is a terrain, so it counts on the unit's own square as well as beside it.
            new Or(
              new Criterion(
                (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
                  from.terrain() instanceof River
              ),
              new Criterion(
                (unit: Unit, to: Tile, from: Tile = unit.tile()): boolean =>
                  from
                    .getAdjacent()
                    .some(
                      (tile: Tile): boolean =>
                        tile.terrain() instanceof River ||
                        tile.terrain() instanceof Water ||
                        (tileImprovementRegistry
                          .getByTile(tile)
                          .some(
                            (improvement: TileImprovement): boolean =>
                              improvement instanceof Irrigation
                          ) &&
                          !tileHasCity(tile, cityRegistry))
                    )
              )
            ),
          ],
          [Mine, BuildMine],
          [Road, BuildRoad],
          [
            Railroad,
            BuildRailroad,
            requiresImprovement({ tileImprovementRegistry }, Road),
          ],
        ] as [typeof TileImprovement, typeof DelayedAction, ...Criterion[]][]
      ).map(
        ([Improvement, ActionType, ...extra]: [
          typeof TileImprovement,
          typeof DelayedAction,
          ...Criterion[]
        ]): ActionRow => ({
          improvement: Improvement,
          extra,
          effect: (
            unit: Unit,
            to: Tile,
            from: Tile = unit.tile()
          ): UnitAction => new ActionType(from, to, unit, ruleRegistry, turn),
        })
      ),

      // The terrain each conversion changes.
      ...(
        [
          [ClearJungle, Jungle],
          [ClearForest, Forest],
          // The mine command: Civ1 turns each of these into Forest.
          [PlantForest, Plains, Grassland, Jungle, Swamp],
          [ClearSwamp, Swamp],
        ] as [
          (
            | typeof ClearJungle
            | typeof ClearForest
            | typeof PlantForest
            | typeof ClearSwamp
          ),
          ...(typeof Terrain)[]
        ][]
      ).map(
        ([ActionType, ...terrains]: [
          (
            | typeof ClearJungle
            | typeof ClearForest
            | typeof PlantForest
            | typeof ClearSwamp
          ),
          ...(typeof Terrain)[]
        ]): ActionRow => ({
          conversion: ActionType,
          terrains,
          effect: (
            unit: Unit,
            to: Tile,
            from: Tile = unit.tile()
          ): UnitAction =>
            new ActionType(
              from,
              to,
              unit,
              ruleRegistry,
              terrainFeatureRegistry,
              turn
            ),
        })
      ),

      // Only on a polluted tile, as v474.05's menu offers it (`GameMenus.cs` L308, civ-clone/web-renderer#32).
      {
        name: 'clean-pollution',
        criteria: cleanPollution({ tileImprovementRegistry }, Pollution),
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new CleanPollution(
            from,
            to,
            unit,
            ruleRegistry,
            tileImprovementRegistry,
            turn
          ),
      },

      {
        name: 'embark',
        criteria: [...embarkCriteria],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const [transport] = unitRegistry
            .getByTile(to)
            .filter(
              (tileUnit: Unit): boolean => tileUnit instanceof NavalTransport
            )
            .filter(
              (tileUnit: Unit): boolean =>
                (tileUnit as NavalTransport).hasCapacity() &&
                (tileUnit as NavalTransport).canStow(unit)
            );

          return new Embark(
            from,
            to,
            unit,
            transport as unknown as ITransport,
            ruleRegistry
          ) as UnitAction;
        },
      },

      // `transportRegistry.hasUnit` first, as in `movementCost.ts`: it's asked of every tile beside every unit the AI
      //  considers moving. An aircraft takes off with a plain `Move` instead (`moved/take-off` unloads it), because
      //  `Disembark` ends the unit's turn, and an aircraft that has just taken off needs its moves. `moved/take-off`
      //  also unloads a unit that walks off a ship in a city with a `Move`.
      {
        name: 'disembark',
        criteria: [...disembarkCriteria],
        effect: (
          unit: Unit,
          to: Tile,
          from: Tile = unit.tile()
        ): UnitAction => {
          const transport = transportRegistry.getByUnit(unit).transport();

          return new Disembark(
            from,
            to,
            unit,
            transport,
            ruleRegistry
          ) as UnitAction;
        },
      },

      {
        name: 'unload',
        criteria: [...unloadCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Unload(from, to, unit, ruleRegistry),
      },

      // Before `road-to` and `railroad-to`, which reuse the route it finds. The `GoTo` follows the route that was found
      //  to offer it, rather than searching for it again when it's performed (civ-clone/web-renderer#307).
      {
        name: 'goto',
        criteria: [
          hasMovesLeft,
          new Criterion(
            (unit: Unit, to: Tile, from: Tile) =>
              to !== from && !to.isNeighbourOf(from)
          ),
          routePlanner.goTo(),
        ],
        effect: routePlanner.goToEffect(GoTo),
      },

      // Road to and Railroad to (civ-clone/web-renderer#195): a worker goes to a distant square, building on each
      //  square of the way where it's offered the build. Which of them a unit may be given is `routeOrders`'s.
      ...(
        [
          [RoadTo, 'road-to'],
          [RailroadTo, 'railroad-to'],
        ] as [typeof RoadTo | typeof RailroadTo, string][]
      ).map(
        ([RouteAction, name]): ActionRow => ({
          name,
          criteria: [
            hasMovesLeft,
            new Criterion(
              (unit: Unit, to: Tile, from: Tile) =>
                to !== from && !to.isNeighbourOf(from)
            ),
            new Criterion((unit: Unit): boolean =>
              routeOrders(unit, playerResearchRegistry).includes(RouteAction)
            ),
            routePlanner.route(),
          ],
          effect: routePlanner.routeEffect(RouteAction),
        })
      ),

      {
        name: 'set-home-city',
        criteria: [...setHomeCityCriteria],
        effect: (unit: Unit, to: Tile, from: Tile): UnitAction =>
          new SetHomeCity(from, to, unit, ruleRegistry, cityRegistry),
      },

      // Standing orders, run by the game's strategies (`base-strategy-explore`, `base-strategy-terrain-work`). Offered
      //  whether or not the game has the strategy: without it, the order hands the unit straight back.
      {
        name: 'explore',
        // Land units that fight (and Diplomats and Caravans, which have `Fortifies` too) and ships. Not Settlers, which
        //  have work to do, nor aircraft, which have fuel to mind.
        criteria: [...exploreCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Explore(
            from,
            to,
            unit,
            ruleRegistry,
            strategyRegistry,
            strategyNoteRegistry,
            { pathFinderRegistry, unitRegistry }
          ),
      },

      {
        name: 'automate',
        criteria: [...automateCriteria],
        effect: (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
          new Automate(
            from,
            to,
            unit,
            ruleRegistry,
            strategyRegistry,
            strategyNoteRegistry,
            { pathFinderRegistry, unitRegistry }
          ),
      },
    ],
    {
      ruleRegistry,
      hasSenate: (player: Player): boolean =>
        hasSenate(player, playerGovernmentRegistry),
    }
  );
};

export default getRules;
