"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Action_1 = require("@civ-clone/core-unit/Rules/Action");
const Actions_1 = require("../../Actions");
const Available_1 = require("@civ-clone/core-tile-improvement/Rules/Available");
const CityNameRegistry_1 = require("@civ-clone/core-civilization/CityNameRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Types_1 = require("../../Types");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const And_1 = require("@civ-clone/core-rule/Criteria/And");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Or_1 = require("@civ-clone/core-rule/Criteria/Or");
const Units_1 = require("../../Units");
const Water_1 = require("@civ-clone/core-terrain/Types/Water");
const Types_2 = require("../../Types");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const noCityOrMatchesPlayer = (negate = false, cityRegistry = CityRegistry_1.instance) => new Criterion_1.default((unit, to, from = unit.tile()) => {
    const city = cityRegistry.getByTile(from);
    if (city === null) {
        return true;
    }
    const matches = city.player() === unit.player();
    if (negate) {
        return !matches;
    }
    return matches;
});
const getRules = (cityNameRegistry = CityNameRegistry_1.instance, cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance, transportRegistry = TransportRegistry_1.instance, turn = Turn_1.instance) => [
    new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Or_1.default(
    // `LandUnit`s can move to other `Land` `Tile`s.
    new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to) => to.isLand()), 
    // Either there are no units, or they're the same `Player`.
    new Criterion_1.default((unit, to) => unitRegistry
        .getByTile(to)
        .every((tileUnit) => tileUnit.player() === unit.player()))), new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Naval), 
    // `Naval` `Unit`s can either move from `Water` or a friendly `City`...
    new Or_1.default(new Criterion_1.default((unit, to, from = unit.tile()) => from.isWater()), noCityOrMatchesPlayer()), 
    // ...to `Water` or a friendly `City`.
    new Or_1.default(new Criterion_1.default((unit, to) => to.isWater()), noCityOrMatchesPlayer())), new Criterion_1.default((unit) => unit instanceof Types_1.Air)), new Or_1.default(new Criterion_1.default((unit, to) => !(unit instanceof Types_1.Land)), noCityOrMatchesPlayer()), 
    // This is analogous to the original Civilization unit adjacency rules
    new Or_1.default(new Criterion_1.default((unit, to) => !(unit instanceof Types_1.Land)), new Criterion_1.default((unit, to, from = unit.tile()) => !(from
        .getNeighbours()
        .some((tile) => unitRegistry
        .getByTile(tile)
        .some((tileUnit) => tileUnit.player() !== unit.player())) &&
        to
            .getNeighbours()
            .some((tile) => unitRegistry
            .getByTile(tile)
            .some((tileUnit) => tileUnit.player() !== unit.player()))))), new Criterion_1.default((unit, to) => unitRegistry
        .getByTile(to)
        .every((tileUnit) => tileUnit.player() === unit.player())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Move(from, to, unit, ruleRegistry))),
    new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Or_1.default(new Criterion_1.default((unit) => unit instanceof Types_1.Air), new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to) => to.isLand())), new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Naval), new Or_1.default(new Criterion_1.default((unit, to) => to.isWater()), new And_1.default(new Criterion_1.default((unit, to) => unitRegistry
        .getByTile(to)
        .some((tileUnit) => tileUnit.player() !== unit.player())))))), new Criterion_1.default((unit, to) => unitRegistry
        .getByTile(to)
        // this will return false if there are no other units on the tile
        .some((tileUnit) => tileUnit.player() !== unit.player())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Attack(from, to, unit, ruleRegistry, unitRegistry))),
    new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit, to) => cityRegistry.getByTile(to) !== null), new Criterion_1.default((unit, to) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to) => unitRegistry.getByTile(to).length === 0), new Effect_1.default((unit, to, from = unit.tile()) => {
        const city = cityRegistry.getByTile(to);
        return new Actions_1.CaptureCity(from, to, unit, city, ruleRegistry);
    })),
    new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Criterion_1.default((unit, to) => tileImprovementRegistry
        .getByTile(to)
        // TODO: Pillagable(sp?)Improvement subclass? or `CanBePillaged` `Rule`...
        .filter((improvement) => [TileImprovements_1.Irrigation, TileImprovements_1.Mine, TileImprovements_1.Railroad, TileImprovements_1.Road].some((Improvement) => improvement instanceof Improvement)).length > 0), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Pillage(from, to, unit, ruleRegistry, tileImprovementRegistry, turn))),
    new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Fortify(from, to, unit, ruleRegistry, turn, unitImprovementRegistry))),
    new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Sleep(from, to, unit, ruleRegistry, turn))),
    new Action_1.Action(new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.NoOrders(from, to, unit, ruleRegistry))),
    new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Units_1.Settlers), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to, from = unit.tile()) => cityRegistry.getByTile(from) === null), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.FoundCity(from, to, unit, cityNameRegistry, ruleRegistry))),
    ...[
        [
            TileImprovements_1.Irrigation,
            Actions_1.BuildIrrigation,
            new Or_1.default(new Criterion_1.default((unit, to, from = unit.tile()) => from.terrain() instanceof Terrains_1.River), new Criterion_1.default((unit, to, from = unit.tile()) => from
                .getAdjacent()
                .some((tile) => tile.terrain() instanceof Terrains_1.River ||
                tile.terrain() instanceof Water_1.Water ||
                (tileImprovementRegistry
                    .getByTile(tile)
                    .some((improvement) => improvement instanceof TileImprovements_1.Irrigation) &&
                    cityRegistry.getByTile(tile) === null)))),
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
    ].map(([Improvement, ActionType, ...additionalCriteria]) => new Action_1.Action(new Criterion_1.default((unit) => unit instanceof Types_2.Worker), Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => ruleRegistry
        .get(Available_1.Available)
        .some((rule) => rule.validate(from, Improvement, unit.player()))), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Criterion_1.default((unit, to) => !tileImprovementRegistry
        .getByTile(to)
        .some((improvement) => improvement instanceof Improvement)), ...additionalCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, turn)))),
    ...[
        [Terrains_1.Jungle, Actions_1.ClearJungle],
        [Terrains_1.Forest, Actions_1.ClearForest],
        [Terrains_1.Plains, Actions_1.PlantForest],
        [Terrains_1.Swamp, Actions_1.ClearSwamp],
    ].map(([TerrainType, ActionType]) => new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_2.Worker), new Criterion_1.default((unit, to, from = unit.tile()) => to === from), new Criterion_1.default((unit, to, from = unit.tile()) => from.terrain() instanceof TerrainType), new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry, terrainFeatureRegistry, turn)))),
    new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to) => to.terrain() instanceof Water_1.Water), new Criterion_1.default((unit, to) => unitRegistry
        .getByTile(to)
        .every((tileUnit) => tileUnit.player() === unit.player())), new Criterion_1.default((unit, to) => unitRegistry
        .getByTile(to)
        .filter((tileUnit) => tileUnit instanceof Types_2.NavalTransport)
        .some((tileUnit) => tileUnit.hasCapacity() &&
        tileUnit.canStow(unit))), new Effect_1.default((unit, to, from = unit.tile()) => {
        const [transport] = unitRegistry
            .getByTile(to)
            .filter((tileUnit) => tileUnit instanceof Types_2.NavalTransport)
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
    new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_2.NavalTransport), new Criterion_1.default((unit) => unit.hasCargo()), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Criterion_1.default((unit, to) => to.getNeighbours().some((tile) => tile.isLand())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Unload(from, to, unit, ruleRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map