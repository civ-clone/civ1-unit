"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Action_1 = require("@civ-clone/core-unit/Rules/Action");
const Types_1 = require("../../Types");
const Actions_1 = require("../../Actions");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityNameRegistry_1 = require("@civ-clone/core-civilization/CityNameRegistry");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const LandMassRegistry_1 = require("@civ-clone/core-world/LandMassRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const diplomatCosts_1 = require("../../lib/diplomatCosts");
const AdvanceStolen_1 = require("@civ-clone/base-unit-action-steal-technology/AdvanceStolen");
const CityImprovements_1 = require("@civ-clone/library-city/CityImprovements");
const diplomat_1 = require("./diplomat");
const Units_1 = require("../../Units");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Types_2 = require("@civ-clone/core-terrain/Types");
const PathFinderRegistry_1 = require("@civ-clone/core-world-path/PathFinderRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const And_1 = require("@civ-clone/core-rule/Criteria/And");
const Available_1 = require("@civ-clone/core-tile-improvement/Rules/Available");
const City_1 = require("@civ-clone/core-city/City");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Or_1 = require("@civ-clone/core-rule/Criteria/Or");
const Path_1 = require("@civ-clone/core-world-path/Path");
const joinableCity_1 = require("@civ-clone/base-unit-action-join-city/joinableCity");
const Declarations_1 = require("@civ-clone/library-diplomacy/Declarations");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const civ1Distance_1 = require("@civ-clone/civ1-world/lib/civ1Distance");
const isLandUnit = new Criterion_1.default((unit, to, from = unit.tile()) => unit instanceof Types_1.Land), isNavalUnit = new Criterion_1.default((unit, to, from = unit.tile()) => unit instanceof Types_1.Naval), tileHasCity = (tile, cityRegistry) => cityRegistry.getByTile(tile) !== null;
const getRules = (cityNameRegistry = CityNameRegistry_1.instance, cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance, transportRegistry = TransportRegistry_1.instance, turn = Turn_1.instance, interactionRegistry = InteractionRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, pathFinderRegistry = PathFinderRegistry_1.instance, strategyNoteRegistry = StrategyNoteRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, landMassRegistry = LandMassRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance) => {
    // Where an aircraft moving onto `to` would land, for `land-aircraft`.
    const landsInCity = (unit, to) => { var _a; return ((_a = cityRegistry.getByTile(to)) === null || _a === void 0 ? void 0 : _a.player()) === unit.player(); }, landingTransport = (unit, to) => {
        var _a;
        const [transport] = unitRegistry
            .getByTile(to)
            .filter((tileUnit) => tileUnit instanceof Types_1.NavalTransport &&
            tileUnit.player() === unit.player() &&
            tileUnit.hasCapacity() &&
            tileUnit.canStow(unit));
        return (_a = transport) !== null && _a !== void 0 ? _a : null;
    }, canLandAircraft = (unit, to) => unit instanceof Types_1.Air &&
        (landsInCity(unit, to) || landingTransport(unit, to) !== null);
    const attackCriteria = [
        Action_1.isNeighbouringTile,
        Action_1.hasMovesLeft,
        // Diplomats and Caravans never attack: v474.05 stops them before any combat.
        new Criterion_1.default((unit) => !(unit instanceof Types_1.Diplomatic)),
        new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .some((tileUnit) => tileUnit.player() !== unit.player())),
        // Where the Unit is either...
        new Or_1.default(new And_1.default(
        // ...an Air Unit...
        new Criterion_1.default((unit) => unit instanceof Types_1.Air), 
        // ...and either...
        new Or_1.default(
        // ...not every Unit on the Tile is another Air Unit...
        new Criterion_1.default((unit, to) => !unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit instanceof Types_1.Air)), 
        // ...or the Unit is a Fighter.
        // TODO: `AirAttacker` type? This would allow Mobile SAM etc
        new Criterion_1.default((unit, to) => unit instanceof Units_1.Fighter))), new And_1.default(
        // ...or a Land Unit...
        isLandUnit, 
        // ...and either...
        new Or_1.default(
        // ...the Tile has a City....
        new Criterion_1.default((unit, to) => tileHasCity(to, cityRegistry)), 
        // ...or it's attacking another Land Unit.
        new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .some((tileUnit) => tileUnit instanceof Types_1.Land)))), new And_1.default(
        // ...or a Naval Unit...
        isNavalUnit, new Or_1.default(
        // ...that is either, not a `Submarine` (as they can only attack other `Naval` `Unit`s...
        // TODO: Add a type for this? NavalBombardier?
        new Criterion_1.default((unit, to) => !(unit instanceof Units_1.Submarine)), 
        // ...or the `Tile` is `Water`.
        new Criterion_1.default((unit, to) => to.isWater())))),
    ], captureCityCriteria = [
        Action_1.isNeighbouringTile,
        Action_1.hasMovesLeft,
        isLandUnit,
        // Diplomats and Caravans never take a city: their own actions are what they can do to a foreign city.
        new Criterion_1.default((unit) => !(unit instanceof Types_1.Diplomatic)),
        new Criterion_1.default((unit, to) => tileHasCity(to, cityRegistry)),
        new Criterion_1.default((unit, to) => unitRegistry.getByTile(to).length === 0),
        new Criterion_1.default((unit, to) => cityRegistry.getByTile(to).player() !== unit.player()),
    ];
    // Where a Caravan can set up a trade route (v474.05 `PlayerTurn.cs` L1802-L1890): any foreign city, but not from a
    //  ship; or one of its owner's own cities other than its home, 10 or more away, or on another continent while that
    //  city isn't building a Wonder (civ-clone/web-renderer#57).
    const canEstablishTradeRoute = (unit, to, from = unit.tile()) => {
        const home = unit.city(), city = cityRegistry.getByTile(to);
        if (!(unit instanceof Units_1.Caravan) || home === null || city === null) {
            return false;
        }
        if (city.player() !== unit.player()) {
            return from.isLand();
        }
        if (city === home) {
            return false;
        }
        if ((0, civ1Distance_1.default)(home.tile(), city.tile()) >= 10) {
            return true;
        }
        const building = cityBuildRegistry.getByCity(city).building();
        return (landMassRegistry.getByTile(home.tile()) !==
            landMassRegistry.getByTile(city.tile()) &&
            !(building !== null &&
                Object.prototype.isPrototypeOf.call(Wonder_1.default, building.item())));
    };
    // A Diplomat's actions on a rival's city (v474.05 `PlayerTurn.cs` L1802-L1905, civ-clone/web-renderer#58): next to
    //  it, with moves left, and not from a ship. Units in the city don't matter: the Diplomat never enters it.
    const diplomatCity = (unit, to, from = unit.tile()) => {
        const city = cityRegistry.getByTile(to);
        return unit instanceof Units_1.Diplomat &&
            from.isLand() &&
            city !== null &&
            city.player() !== unit.player()
            ? city
            : null;
    }, atPeace = (player, other) => interactionRegistry
        .getByPlayers(player, other)
        .some((interaction) => interaction instanceof Declarations_1.Peace && interaction.active()), diplomatCriteria = [
        Action_1.isNeighbouringTile,
        Action_1.hasMovesLeft,
        new Criterion_1.default((unit, to, from = unit.tile()) => diplomatCity(unit, to, from) !== null),
    ], 
    // Once per city, and only with something to take.
    canSteal = new Criterion_1.default((unit, to) => {
        const city = cityRegistry.getByTile(to);
        return (!interactionRegistry
            .entries()
            .some((interaction) => interaction instanceof AdvanceStolen_1.default &&
            interaction.city() === city) &&
            (0, diplomat_1.stealableAdvances)(unit.player(), city.player(), playerResearchRegistry)
                .length > 0);
    }), 
    // A capital can't be incited.
    canIncite = new Criterion_1.default((unit, to) => !cityImprovementRegistry
        .getByCity(cityRegistry.getByTile(to))
        .some((improvement) => improvement instanceof CityImprovements_1.Palace && !improvement.destroyed())), peaceWithOwner = new Criterion_1.default((unit, to) => atPeace(unit.player(), cityRegistry.getByTile(to).player())), costToIncite = (to) => (0, diplomatCosts_1.inciteCost)(cityRegistry.getByTile(to), cityGrowthRegistry, cityImprovementRegistry, playerTreasuryRegistry, ruleRegistry);
    return [
        // First of the Diplomat's: v474.05's computer players only ever steal, and the AI takes the first action offered.
        new Action_1.Action('civ1-unit:unit/action/steal-technology', ...diplomatCriteria, canSteal, new Criterion_1.default((unit, to) => !peaceWithOwner.validate(unit, to)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.StealTechnology(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/sneak-steal-technology', ...diplomatCriteria, canSteal, peaceWithOwner, new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.SneakStealTechnology(from, to, unit, city, city.player(), ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/industrial-sabotage', ...diplomatCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.IndustrialSabotage(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        // Offered whether or not the Diplomat's owner can afford it, so the price can be shown; the action refuses if not.
        new Action_1.Action('civ1-unit:unit/action/incite-revolt', ...diplomatCriteria, canIncite, new Criterion_1.default((unit, to) => !peaceWithOwner.validate(unit, to)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.InciteRevolt(from, to, unit, cityRegistry.getByTile(to), costToIncite(to), ruleRegistry))),
        // At peace, inciting ends the peace; subverting costs double and keeps it (v474.05 has no Senate check on either:
        //  #133 adds one).
        new Action_1.Action('civ1-unit:unit/action/sneak-incite-revolt', ...diplomatCriteria, canIncite, peaceWithOwner, new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.SneakInciteRevolt(from, to, unit, city, costToIncite(to), city.player(), ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/subvert-city', ...diplomatCriteria, canIncite, peaceWithOwner, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.SubvertCity(from, to, unit, cityRegistry.getByTile(to), costToIncite(to) * 2, ruleRegistry))),
        // A lone foreign unit, not in a city, ships and aircraft included (v474.05 `F22_0000_0639`). There's no peace
        //  check, and the Diplomat keeps its moves.
        new Action_1.Action('civ1-unit:unit/action/bribe-unit', Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Units_1.Diplomat), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to) => cityRegistry.getByTile(to) === null), new Criterion_1.default((unit, to) => {
            const units = unitRegistry.getByTile(to);
            return units.length === 1 && units[0].player() !== unit.player();
        }), new Effect_1.default((unit, to, from = unit.tile()) => {
            const [target] = unitRegistry.getByTile(to);
            return new Actions_1.BribeUnit(from, to, unit, target, (0, diplomatCosts_1.bribeCost)(target, cityImprovementRegistry, playerTreasuryRegistry, ruleRegistry), ruleRegistry);
        })),
        // Before `move`, so the arrow keys and the AI take it first, as Civ1's AI does: it always sets up the route.
        //  `move` is still offered into one of the player's own cities, so the player can choose to keep moving.
        new Action_1.Action('civ1-unit:unit/action/establish-trade-route', Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => canEstablishTradeRoute(unit, to, from)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.EstablishTradeRoute(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
        // Before `move`, so it's the first action for a tile an aircraft can land on: the arrow keys and the AI take the
        // first action. `move` is still offered there, so a GoTo (and the action menu) can fly over instead.
        new Action_1.Action('civ1-unit:unit/action/land-aircraft', Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit, to) => canLandAircraft(unit, to)), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit.player() === unit.player())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.LandAircraft(from, to, unit, 
        // A city with a Carrier in it: land in the city.
        landsInCity(unit, to) ? null : landingTransport(unit, to), ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/move', Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Or_1.default(
        // `LandUnit`s can move to other `Land` `Tile`s.
        new And_1.default(isLandUnit, new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to) => to.isLand()), 
        // Either there are no units, or they're the same `Player`.
        new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit.player() === unit.player()))), new And_1.default(isNavalUnit, 
        // `Naval` `Unit`s can either move from `Water` or a friendly `City`...
        new Or_1.default(new Criterion_1.default((unit, to, from = unit.tile()) => from.isWater()), new Criterion_1.default((unit, to, from = unit.tile()) => { var _a; return ((_a = cityRegistry.getByTile(from)) === null || _a === void 0 ? void 0 : _a.player()) === unit.player(); })), 
        // ...to `Water` or a friendly `City`.
        new Or_1.default(new Criterion_1.default((unit, to) => to.isWater()), new Criterion_1.default((unit, to) => { var _a; return ((_a = cityRegistry.getByTile(to)) === null || _a === void 0 ? void 0 : _a.player()) === unit.player(); }))), 
        // `Air` `Unit`s can move anywhere. Where they could land, `LandAircraft` is offered first, and this lets them fly
        // over instead.
        new Criterion_1.default((unit) => unit instanceof Types_1.Air)), 
        // This is analogous to the original Civilization unit adjacency rules.
        // You may only move your `Unit` to the `Tile` if...
        new Or_1.default(new Criterion_1.default(
        // ...it's not a `LandUnit` (`Air`, and `Naval` `Unit`s can ignore adjacency `Rule`s)...
        (unit, to, from) => !(unit instanceof Types_1.Land)), new Criterion_1.default(
        // ...it's a `Diplomatic` `Unit`...
        (unit, to) => unit instanceof Types_1.Diplomatic), new Criterion_1.default(
        // ...there's not an enemy `Unit` adjacent to the current `Tile` and also the target `Tile`...
        (unit, to, from = unit.tile()) => !(from.getNeighbours().some((tile) => unitRegistry.getByTile(tile).some((tileUnit) => tileUnit instanceof Types_1.Land &&
            // Ignore `LandUnit`s in `Transport` on `Water`
            tileUnit.tile().terrain() instanceof Types_2.Land &&
            tileUnit.player() !== unit.player())) &&
            to.getNeighbours().some((tile) => unitRegistry.getByTile(tile).some((tileUnit) => tileUnit instanceof Types_1.Land &&
                // Ignore `LandUnit`s in `Transport` on `Water`
                tileUnit.tile().terrain() instanceof Types_2.Land &&
                tileUnit.player() !== unit.player())))), new Criterion_1.default(
        // ...unless you're moving to a `Tile` that already has one of your `Unit`s on...
        (unit, to, from) => unitRegistry
            .getByTile(to)
            .filter((tileUnit) => tileUnit.player() === unit.player()).length > 0), new Criterion_1.default((unit, to, from) => 
        // ...or to, or from, one of your `City`s.
        [from, to]
            .map((tile) => cityRegistry.getByTile(tile))
            .some((city) => city instanceof City_1.default && city.player() === unit.player()))), new Criterion_1.default((unit, to) => {
            const city = cityRegistry.getByTile(to);
            if (city === null) {
                return true;
            }
            return city.player() === unit.player();
        }), new Criterion_1.default((unit, to) => !unitRegistry
            .getByTile(to)
            .some((tileUnit) => tileUnit.player() !== unit.player())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Move(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/attack', ...attackCriteria, new Criterion_1.default((unit, to) => unitRegistry.getByTile(to).every((tileUnit) => interactionRegistry
            .getByPlayers(unit.player(), tileUnit.player())
            .filter((interaction) => interaction instanceof Declarations_1.Peace)
            .every((interaction) => interaction.expired()))), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Attack(from, to, unit, ruleRegistry, unitRegistry))),
        new Action_1.Action('civ1-unit:unit/action/sneak-attack', ...attackCriteria, new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => interactionRegistry
            .getByPlayers(unit.player(), tileUnit.player())
            .some((interaction) => interaction instanceof Declarations_1.Peace && interaction.active()))), new Effect_1.default((unit, to, from = unit.tile()) => {
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
        new Action_1.Action('civ1-unit:unit/action/capture-city', ...captureCityCriteria, new Criterion_1.default((unit, to) => {
            const city = cityRegistry.getByTile(to);
            return interactionRegistry
                .getByPlayers(unit.player(), city.player())
                .filter((interaction) => interaction instanceof Declarations_1.Peace)
                .every((interaction) => interaction.expired());
        }), new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.CaptureCity(from, to, unit, city, ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/sneak-capture-city', ...captureCityCriteria, new Criterion_1.default((unit, to) => {
            const city = cityRegistry.getByTile(to);
            return interactionRegistry
                .getByPlayers(unit.player(), city.player())
                .filter((interaction) => interaction instanceof Declarations_1.Peace)
                .some((interaction) => interaction.active());
        }), new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.SneakCaptureCity(from, to, unit, city, city.player(), ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/pillage', Action_1.hasMovesLeft, Action_1.isCurrentTile, 
        // Every land unit but Diplomats and Caravans can pillage in Civ1, so
        // Settlers (`Worker`) can as well as the military units.
        new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable || unit instanceof Types_1.Worker), new Criterion_1.default((unit) => !(unit instanceof Types_1.Diplomatic)), new Criterion_1.default((unit, to) => tileImprovementRegistry
            .getByTile(to)
            // TODO: Pillagable(sp?)Improvement subclass? or `CanBePillaged` `Rule`...
            .filter((improvement) => [TileImprovements_1.Irrigation, TileImprovements_1.Mine, TileImprovements_1.Railroad, TileImprovements_1.Road].some((Improvement) => improvement instanceof Improvement)).length > 0), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Pillage(from, to, unit, ruleRegistry, tileImprovementRegistry, turn))),
        new Action_1.Action('civ1-unit:unit/action/fortify', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Fortify(from, to, unit, ruleRegistry, turn, unitImprovementRegistry))),
        new Action_1.Action('civ1-unit:unit/action/sleep', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Sleep(from, to, unit, ruleRegistry, turn))),
        new Action_1.Action('civ1-unit:unit/action/disband', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Disband(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/no-orders', Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.NoOrders(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/found-city', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Units_1.Settlers), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to, from = unit.tile()) => !tileHasCity(from, cityRegistry)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.FoundCity(from, to, unit, cityNameRegistry, ruleRegistry, workedTileRegistry))),
        // On one of its player's cities, where `found-city` is not offered, so the two can share a key. The size limit is a
        // `CanJoinCity` rule (`canJoinCity.ts`).
        new Action_1.Action('civ1-unit:unit/action/join-city', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Units_1.Settlers), new Criterion_1.default((unit, to, from = unit.tile()) => (0, joinableCity_1.joinableCity)(unit, from, cityRegistry, ruleRegistry) !== null), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.JoinCity(from, to, unit, (0, joinableCity_1.joinableCity)(unit, from, cityRegistry, ruleRegistry), ruleRegistry, cityGrowthRegistry))),
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
                        !tileHasCity(tile, cityRegistry))))),
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
        ].map(([Improvement, ActionType, ...additionalCriteria]) => new Action_1.Action(`civ1-unit:unit/action/improvement/${Improvement.name}`, new Criterion_1.default((unit) => unit instanceof Types_1.Worker), Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => ruleRegistry
            .get(Available_1.default)
            .some((rule) => rule.validate(from, Improvement, unit.player()))), Action_1.isCurrentTile, ...additionalCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, turn)))),
        ...[
            [Actions_1.ClearJungle, Terrains_1.Jungle],
            [Actions_1.ClearForest, Terrains_1.Forest],
            // The mine command: Civ1 turns each of these into Forest.
            [Actions_1.PlantForest, Terrains_1.Plains, Terrains_1.Grassland, Terrains_1.Jungle, Terrains_1.Swamp],
            [Actions_1.ClearSwamp, Terrains_1.Swamp],
        ].map(([ActionType, ...TerrainTypes]) => new Action_1.Action(`civ1-unit:unit/action/terrain/${ActionType.name}`, Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.Worker), new Criterion_1.default((unit, to, from = unit.tile()) => TerrainTypes.some((TerrainType) => from.terrain() instanceof TerrainType)), new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, terrainFeatureRegistry, turn)))),
        new Action_1.Action('civ1-unit:unit/action/embark', Action_1.isNeighbouringTile, Action_1.hasMovesLeft, isLandUnit, new Criterion_1.default((unit, to) => to.terrain() instanceof Types_2.Water), new Criterion_1.default((unit, to) => unitRegistry
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
        new Criterion_1.default((unit) => !(unit instanceof Types_1.Air)), new Or_1.default(new Criterion_1.default((unit, to) => !(unit instanceof Types_1.Land)), new Criterion_1.default((unit, to) => to.isLand())), new Criterion_1.default((unit, to, from = unit.tile()) => transportRegistry.getByUnit(unit).transport().tile() === from), new Effect_1.default((unit, to, from = unit.tile()) => {
            const transport = transportRegistry.getByUnit(unit).transport();
            return new Actions_1.Disembark(from, to, unit, transport, ruleRegistry);
        })),
        new Action_1.Action('civ1-unit:unit/action/unload', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.NavalTransport), new Criterion_1.default((unit) => unit.hasCargo()), new Criterion_1.default((unit, to) => to.getNeighbours().some((tile) => tile.isLand())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Unload(from, to, unit, ruleRegistry))),
        new Action_1.Action('civ1-unit:unit/action/goto', Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from) => to !== from && !to.isNeighbourOf(from)), new Criterion_1.default((unit, to, from) => {
            const [PathFinder] = pathFinderRegistry.entries();
            if (!PathFinder) {
                return false;
            }
            const path = new PathFinder(unit, from, to).generate();
            return path instanceof Path_1.default;
        }), new Effect_1.default((unit, to, from) => new Actions_1.GoTo(from, to, unit, ruleRegistry, pathFinderRegistry, strategyNoteRegistry))),
        new Action_1.Action('civ1-unit:unit/action/set-home-city', Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit, to, from) => {
            const city = cityRegistry.getByTile(from);
            if (!(city instanceof City_1.default)) {
                return false;
            }
            return city.player() === unit.player();
        }), new Effect_1.default((unit, to, from) => new Actions_1.SetHomeCity(from, to, unit, ruleRegistry, cityRegistry))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map