"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Action_1 = require("@civ-clone/core-unit/Rules/Action");
const Types_1 = require("../../Types");
const Actions_1 = require("../../Actions");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityNameRegistry_1 = require("@civ-clone/core-civilization/CityNameRegistry");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const LandMassRegistry_1 = require("@civ-clone/core-world/LandMassRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const diplomatCosts_1 = require("../../lib/diplomatCosts");
const AdvanceStolen_1 = require("@civ-clone/base-unit-action-steal-technology/AdvanceStolen");
const CityImprovements_1 = require("@civ-clone/library-city/CityImprovements");
const diplomat_1 = require("./diplomat");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Types_2 = require("@civ-clone/core-terrain/Types");
const PathFinderRegistry_1 = require("@civ-clone/core-world-path/PathFinderRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const StrategyRegistry_1 = require("@civ-clone/core-strategy/StrategyRegistry");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Available_1 = require("@civ-clone/core-tile-improvement/Rules/Available");
const City_1 = require("@civ-clone/core-city/City");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Or_1 = require("@civ-clone/core-rule/Criteria/Or");
const RoutePlanner_1 = require("@civ-clone/base-unit-action-rules/lib/RoutePlanner");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const routeOrders_1 = require("../../lib/routeOrders");
const senate_1 = require("../../lib/senate");
const treatyPartner_1 = require("../../lib/treatyPartner");
const joinableCity_1 = require("@civ-clone/base-unit-action-join-city/joinableCity");
const Declarations_1 = require("@civ-clone/library-diplomacy/Declarations");
const UnitImprovements_1 = require("../../UnitImprovements");
const Stowed_1 = require("@civ-clone/base-unit-action-embark/Busy/Stowed");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const civ1Distance_1 = require("@civ-clone/civ1-world/lib/civ1Distance");
const Fortifies_1 = require("@civ-clone/base-unit-trait-fortifies/Fortifies");
const FoundsCities_1 = require("@civ-clone/base-unit-trait-founds-cities/FoundsCities");
const IgnoresZoneOfControl_1 = require("@civ-clone/base-unit-trait-ignores-zone-of-control/IgnoresZoneOfControl");
const Terraforms_1 = require("@civ-clone/base-unit-trait-terraforms/Terraforms");
const traits_1 = require("@civ-clone/core-unit/traits");
const zoneOfControl_1 = require("@civ-clone/base-zone-of-control/lib/zoneOfControl");
const attack_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/attack");
const domain_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/domain");
const treatyGate_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/treatyGate");
const pillage_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/pillage");
const diplomat_2 = require("@civ-clone/base-unit-action-rules/lib/criteria/diplomat");
const move_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/move");
const landing_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/landing");
const nuclear_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/nuclear");
const partners_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/partners");
const peace_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/peace");
const tradeRoute_1 = require("@civ-clone/base-unit-action-rules/lib/criteria/tradeRoute");
const getRules = (cityNameRegistry = CityNameRegistry_1.instance, cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance, transportRegistry = TransportRegistry_1.instance, turn = Turn_1.instance, interactionRegistry = InteractionRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, pathFinderRegistry = PathFinderRegistry_1.instance, strategyNoteRegistry = StrategyNoteRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, landMassRegistry = LandMassRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, strategyRegistry = StrategyRegistry_1.instance, engine = Engine_1.instance, playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance) => {
    // Where an aircraft moving onto `to` would land, for `land-aircraft`.
    const { landsInCity, landingTransport, canLandAircraft } = (0, landing_1.default)({
        cityRegistry,
        unitRegistry,
    });
    // The routes the `goto`, `road-to` and `railroad-to` criteria find, kept for the actions their effects build
    //  (civ-clone/web-renderer#307). Every action's criteria are validated before any effect runs, so `goto` comes before
    //  `road-to` and `railroad-to`, which reuse its route.
    const routePlanner = new RoutePlanner_1.default({
        engine,
        pathFinderRegistry,
        ruleRegistry,
        strategyNoteRegistry,
    });
    // An attack or a capture only once any peace has expired; the sneak forms of each (and every covert action) break an
    //  active one.
    const { atPeace, allPeaceExpired, allAtPeace, ownerPeaceExpired, peaceWithOwner, } = (0, peace_1.default)({ cityRegistry, interactionRegistry, unitRegistry }), 
    // Diplomats and Caravans (`NonCombatant`) never attack: v474.05 stops them before any combat. A Nuclear unit
    //  (`Detonates`) never fights: it detonates (`nuclear-attack`, below). A unit with no attack (Settlers, a Transport)
    //  can't attack: v474.05 lets it, and it always loses (#642).
    attackCriteria = (0, attack_1.attackCriteria)({ cityRegistry, unitRegistry }), 
    // Diplomats and Caravans never take a city: their own actions are what they can do to a foreign city.
    captureCityCriteria = (0, attack_1.captureCityCriteria)({
        cityRegistry,
        unitRegistry,
    });
    // The players a Nuclear unit would attack on `to`: those with a unit there, and the owner of a city there. In
    //  v474.05 it detonates when it attacks any unit, or moves into a rival's city, and never over empty land.
    const { nuclearTargets, nuclearAttackCriteria, noNuclearTargetAtPeace, anyNuclearTargetAtPeace, } = (0, nuclear_1.default)({ cityRegistry, unitRegistry }, atPeace);
    // Where a Caravan can set up a trade route (v474.05 `PlayerTurn.cs` L1802-L1890): any foreign city, but not from a
    //  ship; or one of its owner's own cities other than its home, 10 or more away, or on another continent while that
    //  city isn't building a Wonder (civ-clone/web-renderer#57).
    const { tradeRouteCriteria } = (0, tradeRoute_1.default)({ cityRegistry }, {
        qualifies: (home, city) => {
            if ((0, civ1Distance_1.default)(home.tile(), city.tile()) >= 10) {
                return true;
            }
            const building = cityBuildRegistry.getByCity(city).building();
            return (landMassRegistry.getByTile(home.tile()) !==
                landMassRegistry.getByTile(city.tile()) &&
                !(building !== null &&
                    Object.prototype.isPrototypeOf.call(Wonder_1.default, building.item())));
        },
    });
    // A Diplomat's actions on a rival's city (v474.05 `PlayerTurn.cs` L1802-L1905, civ-clone/web-renderer#58): next to
    //  it, with moves left, and not from a ship. Units in the city don't matter: the Diplomat never enters it.
    const { diplomatCriteria } = (0, diplomat_2.diplomat)({ cityRegistry }), 
    // Once per city, and only with something to take.
    canSteal = (0, diplomat_2.canSteal)({ cityRegistry }, (unit, city) => !interactionRegistry
        .entries()
        .some((interaction) => interaction instanceof AdvanceStolen_1.default &&
        interaction.city() === city) &&
        (0, diplomat_1.stealableAdvances)(unit.player(), city.player(), playerResearchRegistry)
            .length > 0), 
    // One embassy with each civilization.
    hasNoEmbassy = (0, diplomat_2.hasNoEmbassy)({ cityRegistry, interactionRegistry }), 
    // A capital can't be incited.
    canIncite = (0, diplomat_2.canIncite)({ cityRegistry }, (city) => cityImprovementRegistry
        .getByCity(city)
        .some((improvement) => improvement instanceof CityImprovements_1.Palace && !improvement.destroyed())), 
    // A lone foreign unit, not in a city (v474.05 `F22_0000_0639`).
    bribeUnitCriteria = (0, diplomat_2.bribeUnitCriteria)({ cityRegistry, unitRegistry }), costToIncite = (to) => (0, diplomatCosts_1.inciteCost)(cityRegistry.getByTile(to), cityGrowthRegistry, cityImprovementRegistry, playerTreasuryRegistry, ruleRegistry);
    // A treaty partner's land (#287, `treatyPartner`): v474.05 asks about a move onto it from land, unless the unit's
    //  own units are there already (`CheckPlayerTurn.cs` ~L1662-1705), and about pillaging it.
    const partnerOf = (unit, tile) => (0, treatyPartner_1.default)(unit, tile, interactionRegistry, tileImprovementRegistry, workedTileRegistry), 
    // `onPartnersLand` is the first of their actions' criteria: it's the cheap one that rules most tiles out (most
    //  tiles aren't worked).
    { movePartner, onPartnersLand, offPartnersLand, pillagingPartnersLand, notPillagingPartnersLand, } = (0, partners_1.default)({ unitRegistry }, partnerOf);
    // A Republic or Democracy can't break a treaty (#133): whatever would is offered as `Overruled` instead, which
    //  v474.05 answers with "Overruled by the Senate. Action canceled." A blocked move has spent its cost already; a
    //  blocked attack keeps its moves (#133).
    const { isFree, isOverruled } = (0, treatyGate_1.treatyGate)((player) => (0, senate_1.default)(player, playerGovernmentRegistry)), overruled = (0, treatyGate_1.overruled)({
        id: (name) => `civ1-unit:unit/action/overruled/${name}`,
        isOverruled,
        ruleRegistry,
    }), cityOwner = (unit, to) => cityRegistry.getByTile(to).player();
    // Every land unit but Diplomats and Caravans can pillage in Civ1, so Settlers (`Terraforms`) can as well as the
    //  military units (`Fortifies`). Kept in this shape, which the equivalence test checks: in Civ1 it is every land unit
    //  but the `NonCombatant`s.
    const pillageCriteria = (0, pillage_1.pillageCriteria)({ tileImprovementRegistry }, (improvement) => [TileImprovements_1.Irrigation, TileImprovements_1.Mine, TileImprovements_1.Railroad, TileImprovements_1.Road].some((Improvement) => improvement instanceof Improvement)), 
    // This is analogous to the original Civilization unit adjacency rules.
    // You may only move your `Unit` to the `Tile` if...
    moveCriteria = (0, move_1.default)({ cityRegistry, unitRegistry }, (0, zoneOfControl_1.default)(unitRegistry, {
        exemptMovers: [
            // ...it's not a `LandUnit` (`Air`, and `Naval` `Unit`s can ignore adjacency `Rule`s)...
            (unit, to, from) => !(0, traits_1.isA)(unit, Types_1.Land),
            // ...it ignores zones of control (a Diplomat or a Caravan)...
            (unit, to) => unit.hasTrait(IgnoresZoneOfControl_1.default),
        ],
        // ...there's not an enemy `Unit` adjacent to the current `Tile` and also the target `Tile`...
        exerts: (tileUnit, unit) => (0, traits_1.isA)(tileUnit, Types_1.Land) &&
            // Ignore `LandUnit`s in `Transport` on `Water`
            tileUnit.tile().terrain() instanceof Types_2.Land &&
            tileUnit.player() !== unit.player(),
        exemptMoves: [
            // ...unless you're moving to a `Tile` that already has one of your `Unit`s on...
            (unit, to, from) => unitRegistry
                .getByTile(to)
                .filter((tileUnit) => tileUnit.player() === unit.player()).length > 0,
            // ...or to, or from, one of your `City`s.
            (unit, to, from) => [from, to]
                .map((tile) => cityRegistry.getByTile(tile))
                .some((city) => city instanceof City_1.default && city.player() === unit.player()),
        ],
    }));
    return [
        // First of the Diplomat's: v474.05's computer players only ever steal, and the AI takes the first action offered.
        new Action_1.Action('civ1-unit:unit/action/steal-technology', ...diplomatCriteria, canSteal, new Criterion_1.default((unit, to) => !peaceWithOwner.validate(unit, to)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.StealTechnology(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/sneak-steal-technology', ...diplomatCriteria, canSteal, peaceWithOwner, isFree, new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.SneakStealTechnology(from, to, unit, city, city.player(), ruleRegistry);
        })),
        overruled('sneak-steal-technology', (unit, to, from) => new Actions_1.SneakStealTechnology(from, to, unit, cityRegistry.getByTile(to), cityOwner(unit, to), ruleRegistry), ...diplomatCriteria, canSteal, peaceWithOwner),
        // v474.05 has no peace check on an embassy or an investigation, and neither breaks a treaty.
        new Action_1.Action('civ1-unit:unit/action/establish-embassy', ...diplomatCriteria, hasNoEmbassy, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.EstablishEmbassy(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/investigate-city', ...diplomatCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.InvestigateCity(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/industrial-sabotage', ...diplomatCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.IndustrialSabotage(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        // Offered whether or not the Diplomat's owner can afford it, so the price can be shown; the action refuses if not.
        new Action_1.Action('civ1-unit:unit/action/incite-revolt', ...diplomatCriteria, canIncite, new Criterion_1.default((unit, to) => !peaceWithOwner.validate(unit, to)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.InciteRevolt(from, to, unit, cityRegistry.getByTile(to), costToIncite(to), ruleRegistry))),
        // At peace, inciting ends the peace; subverting costs double and keeps it. v474.05 has no Senate check on either;
        //  inciting gets one here (#133).
        new Action_1.Action('civ1-unit:unit/action/sneak-incite-revolt', ...diplomatCriteria, canIncite, peaceWithOwner, isFree, new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.SneakInciteRevolt(from, to, unit, city, costToIncite(to), city.player(), ruleRegistry);
        })),
        overruled('sneak-incite-revolt', (unit, to, from) => new Actions_1.SneakInciteRevolt(from, to, unit, cityRegistry.getByTile(to), costToIncite(to), cityOwner(unit, to), ruleRegistry), ...diplomatCriteria, canIncite, peaceWithOwner),
        new Action_1.Action('civ1-unit:unit/action/subvert-city', ...diplomatCriteria, canIncite, peaceWithOwner, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.SubvertCity(from, to, unit, cityRegistry.getByTile(to), costToIncite(to) * 2, ruleRegistry))),
        // The Diplomat stays, with no moves left (v474.05 `F22_0000_0000`).
        new Action_1.Action('civ1-unit:unit/action/meet-with-leader', ...diplomatCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.MeetWithLeader(from, to, unit, cityRegistry.getByTile(to).player(), ruleRegistry))),
        // A lone foreign unit, not in a city, ships and aircraft included (v474.05 `F22_0000_0639`). There's no peace
        //  check, and the Diplomat keeps its moves.
        new Action_1.Action('civ1-unit:unit/action/bribe-unit', ...bribeUnitCriteria, new Effect_1.default((unit, to, from = unit.tile()) => {
            const [target] = unitRegistry.getByTile(to);
            return new Actions_1.BribeUnit(from, to, unit, target, (0, diplomatCosts_1.bribeCost)(target, cityImprovementRegistry, playerTreasuryRegistry, ruleRegistry), ruleRegistry);
        })),
        // Before `move`, so the arrow keys and the AI take it first, as Civ1's AI does: it always sets up the route.
        //  `move` is still offered into one of the player's own cities, so the player can choose to keep moving.
        new Action_1.Action('civ1-unit:unit/action/establish-trade-route', ...tradeRouteCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.EstablishTradeRoute(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        // Before `move`, so it's the first action for a tile an aircraft can land on: the arrow keys and the AI take the
        // first action. `move` is still offered there, so a GoTo (and the action menu) can fly over instead.
        new Action_1.Action('civ1-unit:unit/action/land-aircraft', Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit, to) => canLandAircraft(unit, to)), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit.player() === unit.player())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.LandAircraft(from, to, unit, 
        // A city with a Carrier in it: land in the city.
        landsInCity(unit, to) ? null : landingTransport(unit, to), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/move', ...moveCriteria, offPartnersLand, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Move(from, to, unit, ruleRegistry))),
        // Onto a treaty partner's land (#287): Break treaty or, with a Senate, `Overruled`, then Cancel, which spends the
        //  move's cost (v474.05 takes it before asking).
        new Action_1.Action('civ1-unit:unit/action/sneak-move', onPartnersLand, ...moveCriteria, isFree, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.SneakMove(from, to, unit, movePartner(unit, to, from), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/overruled/sneak-move', onPartnersLand, ...moveCriteria, isOverruled, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Overruled(from, to, unit, new Actions_1.SneakMove(from, to, unit, movePartner(unit, to, from), ruleRegistry), new Actions_1.Move(from, to, unit, ruleRegistry).movementCost(), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/abort-move', onPartnersLand, ...moveCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.AbortMove(from, to, unit, movePartner(unit, to, from), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/attack', ...attackCriteria, allPeaceExpired, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Attack(from, to, unit, ruleRegistry, unitRegistry))),
        new Action_1.Action('civ1-unit:unit/action/sneak-attack', ...attackCriteria, allAtPeace, isFree, new Effect_1.default((unit, to, from = unit.tile()) => {
            const enemies = Array.from(new Set(unitRegistry
                .getByTile(to)
                .filter((tileUnit) => interactionRegistry
                .getByPlayers(unit.player(), tileUnit.player())
                .some((interaction) => interaction instanceof Declarations_1.Peace && interaction.active()))
                .map((unit) => unit.player())));
            if (enemies.length > 1) {
                console.warn('Multiple targets for declaring war:');
                console.warn(enemies);
                console.warn('core-unit/Rules/Unit/action.ts');
            }
            return new Actions_1.SneakAttack(from, to, unit, enemies[0], ruleRegistry, unitRegistry);
        })),
        overruled('sneak-attack', (unit, to, from) => new Actions_1.SneakAttack(from, to, unit, unitRegistry.getByTile(to)[0].player(), ruleRegistry, unitRegistry), ...attackCriteria, allAtPeace),
        new Action_1.Action('civ1-unit:unit/action/nuclear-attack', ...nuclearAttackCriteria, noNuclearTargetAtPeace, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.NuclearAttack(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/sneak-nuclear-attack', ...nuclearAttackCriteria, anyNuclearTargetAtPeace, isFree, new Effect_1.default((unit, to, from = unit.tile()) => {
            const [enemy] = nuclearTargets(unit, to).filter((player) => atPeace(unit.player(), player));
            return new Actions_1.SneakNuclearAttack(from, to, unit, enemy, ruleRegistry);
        })),
        overruled('sneak-nuclear-attack', (unit, to, from) => new Actions_1.SneakNuclearAttack(from, to, unit, nuclearTargets(unit, to).filter((player) => atPeace(unit.player(), player))[0], ruleRegistry), ...nuclearAttackCriteria, anyNuclearTargetAtPeace),
        new Action_1.Action('civ1-unit:unit/action/capture-city', ...captureCityCriteria, ownerPeaceExpired, new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.CaptureCity(from, to, unit, city, ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/sneak-capture-city', ...captureCityCriteria, peaceWithOwner, isFree, new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.SneakCaptureCity(from, to, unit, city, city.player(), ruleRegistry);
        })),
        overruled('sneak-capture-city', (unit, to, from) => new Actions_1.SneakCaptureCity(from, to, unit, cityRegistry.getByTile(to), cityOwner(unit, to), ruleRegistry), ...captureCityCriteria, peaceWithOwner),
        new Action_1.Action('civ1-unit:unit/action/pillage', ...pillageCriteria, notPillagingPartnersLand, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Pillage(from, to, unit, ruleRegistry, tileImprovementRegistry, turn))),
        // Pillaging a treaty partner's land breaks the treaty (v474.05 `CheckPlayerTurn.cs` ~L642-686).
        new Action_1.Action('civ1-unit:unit/action/sneak-pillage', ...pillageCriteria, pillagingPartnersLand, isFree, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.SneakPillage(from, to, unit, partnerOf(unit, to), ruleRegistry, tileImprovementRegistry, turn))),
        overruled('sneak-pillage', (unit, to, from) => new Actions_1.SneakPillage(from, to, unit, partnerOf(unit, to), ruleRegistry, tileImprovementRegistry, turn), ...pillageCriteria, pillagingPartnersLand),
        new Action_1.Action('civ1-unit:unit/action/fortify', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit.hasTrait(Fortifies_1.default)), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Fortify(from, to, unit, ruleRegistry, turn, unitImprovementRegistry))),
        new Action_1.Action('civ1-unit:unit/action/sleep', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Sleep(from, to, unit, ruleRegistry, turn))),
        new Action_1.Action(
        // Waking a unit that's asleep, fortified or busy with a job (civ-clone/web-renderer#160): its `Activate` rules
        //  (`activate.ts`) decide what that does. Not cargo: a unit `Stowed` aboard a transport is woken by unloading, and
        //  an aircraft collected by a Carrier stays active while stowed, so it would be offered this beside its own orders.
        'civ1-unit:unit/action/activate', Action_1.isCurrentTile, new Criterion_1.default((unit) => !(unit.busy() instanceof Stowed_1.default) &&
            (unit.busy() !== null ||
                unitImprovementRegistry
                    .getByUnit(unit)
                    .some((unitImprovement) => unitImprovement instanceof UnitImprovements_1.Fortified))), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Activate(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/disband', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Disband(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/no-orders', Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.NoOrders(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/found-city', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit.hasTrait(FoundsCities_1.default)), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to, from = unit.tile()) => !(0, domain_1.tileHasCity)(from, cityRegistry)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.FoundCity(from, to, unit, cityNameRegistry, ruleRegistry, workedTileRegistry))),
        // On one of its player's cities, where `found-city` is not offered, so the two can share a key. The size limit is a
        // `CanJoinCity` rule (`canJoinCity.ts`).
        new Action_1.Action('civ1-unit:unit/action/join-city', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit.hasTrait(FoundsCities_1.default)), new Criterion_1.default((unit, to, from = unit.tile()) => (0, joinableCity_1.joinableCity)(unit, from, cityRegistry, ruleRegistry) !== null), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.JoinCity(from, to, unit, (0, joinableCity_1.joinableCity)(unit, from, cityRegistry, ruleRegistry), ruleRegistry, cityGrowthRegistry))),
        ...[
            [
                TileImprovements_1.Irrigation,
                Actions_1.BuildIrrigation,
                new Or_1.default(new Criterion_1.default((unit, to, from = unit.tile()) => from.terrain() instanceof Terrains_1.River), new Criterion_1.default((unit, to, from = unit.tile()) => from
                    .getAdjacent()
                    .some((tile) => tile.terrain() instanceof Terrains_1.River ||
                    tile.terrain() instanceof Types_2.Water ||
                    (tileImprovementRegistry
                        .getByTile(tile)
                        .some((improvement) => improvement instanceof TileImprovements_1.Irrigation) &&
                        !(0, domain_1.tileHasCity)(tile, cityRegistry))))),
            ],
            [TileImprovements_1.Mine, Actions_1.BuildMine],
            [TileImprovements_1.Road, Actions_1.BuildRoad],
            [
                TileImprovements_1.Railroad,
                Actions_1.BuildRailroad,
                new Criterion_1.default((unit, to) => tileImprovementRegistry
                    .getByTile(to)
                    .some((tileImprovement) => tileImprovement instanceof TileImprovements_1.Road)),
            ],
        ].map(([Improvement, ActionType, ...additionalCriteria]) => new Action_1.Action(`civ1-unit:unit/action/improvement/${Improvement.name}`, new Criterion_1.default((unit) => unit.hasTrait(Terraforms_1.default)), Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => ruleRegistry
            .get(Available_1.default)
            .some((rule) => rule.validate(from, Improvement, unit.player()))), Action_1.isCurrentTile, ...additionalCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, turn)))),
        ...[
            [Actions_1.ClearJungle, Terrains_1.Jungle],
            [Actions_1.ClearForest, Terrains_1.Forest],
            // The mine command: Civ1 turns each of these into Forest.
            [Actions_1.PlantForest, Terrains_1.Plains, Terrains_1.Grassland, Terrains_1.Jungle, Terrains_1.Swamp],
            [Actions_1.ClearSwamp, Terrains_1.Swamp],
        ].map(([ActionType, ...TerrainTypes]) => new Action_1.Action(`civ1-unit:unit/action/terrain/${ActionType.name}`, Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit.hasTrait(Terraforms_1.default)), new Criterion_1.default((unit, to, from = unit.tile()) => TerrainTypes.some((TerrainType) => from.terrain() instanceof TerrainType)), new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, terrainFeatureRegistry, turn)))),
        // Only on a polluted tile, as v474.05's menu offers it (`GameMenus.cs` L308, civ-clone/web-renderer#32).
        new Action_1.Action('civ1-unit:unit/action/clean-pollution', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit.hasTrait(Terraforms_1.default)), new Criterion_1.default((unit, to, from = unit.tile()) => tileImprovementRegistry
            .getByTile(from)
            .some((improvement) => improvement instanceof TileImprovements_1.Pollution)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.CleanPollution(from, to, unit, ruleRegistry, tileImprovementRegistry, turn))),
        new Action_1.Action('civ1-unit:unit/action/embark', Action_1.isNeighbouringTile, Action_1.hasMovesLeft, domain_1.isLandUnit, new Criterion_1.default((unit, to) => to.terrain() instanceof Types_2.Water), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit.player() === unit.player())), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .filter((tileUnit) => tileUnit instanceof Types_1.NavalTransport)
            .some((tileUnit) => tileUnit.hasCapacity() &&
            tileUnit.canStow(unit))), new Effect_1.default((unit, to, from = unit.tile()) => {
            const [transport] = unitRegistry
                .getByTile(to)
                .filter((tileUnit) => tileUnit instanceof Types_1.NavalTransport)
                .filter((tileUnit) => tileUnit.hasCapacity() &&
                tileUnit.canStow(unit));
            return new Actions_1.Embark(from, to, unit, transport, ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/disembark', Action_1.isNeighbouringTile, 
        // `hasUnit`, not `getByUnit` in a `try`, as in `movementCost.ts`: the
        // answer is nearly always "no", and `getByUnit` gives it by throwing.
        // It is asked of every tile beside every unit the AI considers moving.
        new Criterion_1.default((unit) => transportRegistry.hasUnit(unit)), 
        // An aircraft takes off with a plain `Move` instead (`moved/take-off` unloads it), because `Disembark` ends the
        // unit's turn, and an aircraft that has just taken off needs its moves. `moved/take-off` also unloads a unit
        // that walks off a ship in a city with a `Move`.
        new Criterion_1.default((unit) => !(0, traits_1.isA)(unit, Types_1.Air)), new Or_1.default(new Criterion_1.default((unit, to) => !(0, traits_1.isA)(unit, Types_1.Land)), new Criterion_1.default((unit, to) => to.isLand())), new Criterion_1.default((unit, to, from = unit.tile()) => transportRegistry.getByUnit(unit).transport().tile() === from), new Effect_1.default((unit, to, from = unit.tile()) => {
            const transport = transportRegistry.getByUnit(unit).transport();
            return new Actions_1.Disembark(from, to, unit, transport, ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/unload', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.NavalTransport), new Criterion_1.default((unit) => unit.hasCargo()), new Criterion_1.default((unit, to) => to.getNeighbours().some((tile) => tile.isLand())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Unload(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/goto', Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from) => to !== from && !to.isNeighbourOf(from)), routePlanner.goTo(), 
        // The `GoTo` follows the route that was found to offer it, rather than searching for it again when it's
        //  performed (civ-clone/web-renderer#307).
        routePlanner.goToEffect(Actions_1.GoTo)),
        // Road to and Railroad to (civ-clone/web-renderer#195): a worker goes to a distant square, building on each square
        //  of the way where it's offered the build. Which of them a unit may be given is `routeOrders`'s.
        ...[
            [Actions_1.RoadTo, 'road-to'],
            [Actions_1.RailroadTo, 'railroad-to'],
        ].map(([RouteAction, name]) => new Action_1.Action(`civ1-unit:unit/action/${name}`, Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from) => to !== from && !to.isNeighbourOf(from)), new Criterion_1.default((unit) => (0, routeOrders_1.default)(unit, playerResearchRegistry).includes(RouteAction)), routePlanner.route(), routePlanner.routeEffect(RouteAction))),
        new Action_1.Action('civ1-unit:unit/action/set-home-city', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit, to, from) => {
            const city = cityRegistry.getByTile(from);
            if (!(city instanceof City_1.default)) {
                return false;
            }
            return city.player() === unit.player();
        }), new Effect_1.default((unit, to, from) => new Actions_1.SetHomeCity(from, to, unit, ruleRegistry, cityRegistry))),
        // Standing orders, run by the game's strategies (`base-strategy-explore`, `base-strategy-terrain-work`). Offered
        //  whether or not the game has the strategy: without it, the order hands the unit straight back.
        new Action_1.Action('civ1-unit:unit/action/explore', Action_1.hasMovesLeft, Action_1.isCurrentTile, 
        // Land units that fight (and Diplomats and Caravans, which have `Fortifies` too) and ships. Not Settlers, which
        //  have work to do, nor aircraft, which have fuel to mind.
        new Criterion_1.default((unit) => unit.hasTrait(Fortifies_1.default) || (0, traits_1.isA)(unit, Types_1.Naval)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Explore(from, to, unit, ruleRegistry, strategyRegistry, strategyNoteRegistry, { pathFinderRegistry, unitRegistry }))),
        new Action_1.Action('civ1-unit:unit/action/automate', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit.hasTrait(Terraforms_1.default)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Automate(from, to, unit, ruleRegistry, strategyRegistry, strategyNoteRegistry, { pathFinderRegistry, unitRegistry }))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map