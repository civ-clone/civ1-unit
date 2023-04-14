"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Action_1 = require("@civ-clone/core-unit/Rules/Action");
const Types_1 = require("../../Types");
const Actions_1 = require("../../Actions");
const CityNameRegistry_1 = require("@civ-clone/core-civilization/CityNameRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Units_1 = require("../../Units");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Types_2 = require("@civ-clone/core-terrain/Types");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const And_1 = require("@civ-clone/core-rule/Criteria/And");
const Available_1 = require("@civ-clone/core-tile-improvement/Rules/Available");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Or_1 = require("@civ-clone/core-rule/Criteria/Or");
const Declarations_1 = require("@civ-clone/library-diplomacy/Declarations");
const isLandUnit = new Criterion_1.default((unit, to, from = unit.tile()) => unit instanceof Types_1.Land), isNavalUnit = new Criterion_1.default((unit, to, from = unit.tile()) => unit instanceof Types_1.Naval), tileHasCity = (tile, cityRegistry) => cityRegistry.getByTile(tile) !== null;
const getRules = (cityNameRegistry = CityNameRegistry_1.instance, cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance, transportRegistry = TransportRegistry_1.instance, turn = Turn_1.instance, interactionRegistry = InteractionRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => {
    const attackCriteria = [
        Action_1.isNeighbouringTile,
        Action_1.hasMovesLeft,
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
        new Criterion_1.default((unit, to) => tileHasCity(to, cityRegistry)),
        new Criterion_1.default((unit, to) => unitRegistry.getByTile(to).length === 0),
        new Criterion_1.default((unit, to) => cityRegistry.getByTile(to).player() !== unit.player()),
    ];
    return [
        new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Or_1.default(
        // `LandUnit`s can move to other `Land` `Tile`s.
        new And_1.default(isLandUnit, new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to) => to.isLand()), 
        // Either there are no units, or they're the same `Player`.
        new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit.player() === unit.player()))), new And_1.default(isNavalUnit, 
        // `Naval` `Unit`s can either move from `Water` or a friendly `City`...
        new Or_1.default(new Criterion_1.default((unit, to, from = unit.tile()) => from.isWater()), new Criterion_1.default((unit, to, from = unit.tile()) => { var _a; return ((_a = cityRegistry.getByTile(from)) === null || _a === void 0 ? void 0 : _a.player()) === unit.player(); })), 
        // ...to `Water` or a friendly `City`.
        new Or_1.default(new Criterion_1.default((unit, to) => to.isWater()), new Criterion_1.default((unit, to) => { var _a; return ((_a = cityRegistry.getByTile(to)) === null || _a === void 0 ? void 0 : _a.player()) === unit.player(); }))), new Criterion_1.default((unit) => unit instanceof Types_1.Air)), 
        // This is analogous to the original Civilization unit adjacency rules.
        // You may only move your `Unit` to the `Tile` if...
        new Or_1.default(new Criterion_1.default(
        // ...it's not a `LandUnit` (`Air`, and `Naval` `Unit`s can ignore adjacency `Rule`s)...
        (unit, to) => !(unit instanceof Types_1.Land)), 
        // new Criterion(
        //   // ...it's a `Diplomatic` `Unit`...
        //   (unit: Unit, to: Tile): boolean => unit instanceof Diplomatic
        // ),
        new Criterion_1.default(
        // ...there's not an enemy `Unit` adjacent to the current `Tile` and also the target `Tile`...
        (unit, to, from = unit.tile()) => !(from.getNeighbours().some((tile) => unitRegistry.getByTile(tile).some((tileUnit) => tileUnit instanceof Types_1.Land &&
            // Ignore `LandUnit`s in `Transport` on `Water`
            tileUnit.tile().terrain() instanceof Types_2.Land &&
            tileUnit.player() !== unit.player())) &&
            to.getNeighbours().some((tile) => unitRegistry.getByTile(tile).some((tileUnit) => tileUnit instanceof Types_1.Land &&
                // Ignore `LandUnit`s in `Transport` on `Water`
                tileUnit.tile().terrain() instanceof Types_2.Land &&
                tileUnit.player() !== unit.player())))), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .filter((tileUnit) => tileUnit.player() === unit.player()).length > 0), new Criterion_1.default((unit, to) => {
            // ...or one of your `City`s.
            const city = cityRegistry.getByTile(to);
            if (city === null) {
                return false;
            }
            return city.player() === unit.player();
        })), new Criterion_1.default((unit, to) => {
            // ...or one of your `City`s.
            const city = cityRegistry.getByTile(to);
            if (city === null) {
                return true;
            }
            return city.player() === unit.player();
        }), new Criterion_1.default((unit, to) => !unitRegistry
            .getByTile(to)
            .some((tileUnit) => tileUnit.player() !== unit.player())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Move(from, to, unit, ruleRegistry))),
        new Action_1.Action(...attackCriteria, new Criterion_1.default((unit, to) => unitRegistry.getByTile(to).every((tileUnit) => interactionRegistry
            .getByPlayers(unit.player(), tileUnit.player())
            .filter((interaction) => interaction instanceof Declarations_1.Peace)
            .every((interaction) => interaction.expired()))), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Attack(from, to, unit, ruleRegistry, unitRegistry))),
        new Action_1.Action(...attackCriteria, new Criterion_1.default((unit, to) => unitRegistry
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
        new Action_1.Action(...captureCityCriteria, new Criterion_1.default((unit, to) => {
            const city = cityRegistry.getByTile(to);
            return interactionRegistry
                .getByPlayers(unit.player(), city.player())
                .filter((interaction) => interaction instanceof Declarations_1.Peace)
                .every((interaction) => interaction.expired());
        }), new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.CaptureCity(from, to, unit, city, ruleRegistry);
        })),
        new Action_1.Action(...captureCityCriteria, new Criterion_1.default((unit, to) => {
            const city = cityRegistry.getByTile(to);
            return interactionRegistry
                .getByPlayers(unit.player(), city.player())
                .filter((interaction) => interaction instanceof Declarations_1.Peace)
                .some((interaction) => interaction.active());
        }), new Effect_1.default((unit, to, from = unit.tile()) => {
            const city = cityRegistry.getByTile(to);
            return new Actions_1.SneakCaptureCity(from, to, unit, city, city.player(), ruleRegistry);
        })),
        new Action_1.Action(Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable), new Criterion_1.default((unit, to) => tileImprovementRegistry
            .getByTile(to)
            // TODO: Pillagable(sp?)Improvement subclass? or `CanBePillaged` `Rule`...
            .filter((improvement) => [TileImprovements_1.Irrigation, TileImprovements_1.Mine, TileImprovements_1.Railroad, TileImprovements_1.Road].some((Improvement) => improvement instanceof Improvement)).length > 0), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Pillage(from, to, unit, ruleRegistry, tileImprovementRegistry, turn))),
        new Action_1.Action(Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Fortify(from, to, unit, ruleRegistry, turn, unitImprovementRegistry))),
        new Action_1.Action(Action_1.hasMovesLeft, Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Sleep(from, to, unit, ruleRegistry, turn))),
        new Action_1.Action(Action_1.hasMovesLeft, Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Disband(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.isCurrentTile, new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.NoOrders(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Units_1.Settlers), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to, from = unit.tile()) => !tileHasCity(from, cityRegistry)), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.FoundCity(from, to, unit, cityNameRegistry, ruleRegistry, workedTileRegistry))),
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
        ].map(([Improvement, ActionType, ...additionalCriteria]) => new Action_1.Action(new Criterion_1.default((unit) => unit instanceof Types_1.Worker), Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => ruleRegistry
            .get(Available_1.default)
            .some((rule) => rule.validate(from, Improvement, unit.player()))), Action_1.isCurrentTile, ...additionalCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, turn)))),
        ...[
            [Terrains_1.Jungle, Actions_1.ClearJungle],
            [Terrains_1.Forest, Actions_1.ClearForest],
            [Terrains_1.Plains, Actions_1.PlantForest],
            [Terrains_1.Swamp, Actions_1.ClearSwamp],
        ].map(([TerrainType, ActionType]) => new Action_1.Action(Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.Worker), new Criterion_1.default((unit, to, from = unit.tile()) => from.terrain() instanceof TerrainType), new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, terrainFeatureRegistry, turn)))),
        new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, isLandUnit, new Criterion_1.default((unit, to) => to.terrain() instanceof Types_2.Water), new Criterion_1.default((unit, to) => unitRegistry
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
        new Action_1.Action(Action_1.isNeighbouringTile, new Criterion_1.default((unit) => {
            try {
                transportRegistry.getByUnit(unit);
                return true;
            }
            catch (e) {
                return false;
            }
        }), new Or_1.default(new Criterion_1.default((unit, to) => !(unit instanceof Types_1.Land)), new Criterion_1.default((unit, to) => to.isLand())), new Criterion_1.default((unit, to, from = unit.tile()) => transportRegistry.getByUnit(unit).transport().tile() === from), new Effect_1.default((unit, to, from = unit.tile()) => {
            const transport = transportRegistry.getByUnit(unit).transport();
            return new Actions_1.Disembark(from, to, unit, transport, ruleRegistry);
        })),
        new Action_1.Action(Action_1.hasMovesLeft, Action_1.isCurrentTile, new Criterion_1.default((unit) => unit instanceof Types_1.NavalTransport), new Criterion_1.default((unit) => unit.hasCargo()), new Criterion_1.default((unit, to) => to.getNeighbours().some((tile) => tile.isLand())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Unload(from, to, unit, ruleRegistry))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map