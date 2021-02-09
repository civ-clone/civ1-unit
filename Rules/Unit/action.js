"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Action_1 = require("@civ-clone/core-unit/Rules/Action");
const Actions_1 = require("../../Actions");
const Available_1 = require("@civ-clone/core-tile-improvement/Rules/Available");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Types_1 = require("../../Types");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const And_1 = require("@civ-clone/core-rule/Criteria/And");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Or_1 = require("@civ-clone/core-rule/Criteria/Or");
const Units_1 = require("../../Units");
const Water_1 = require("@civ-clone/core-terrain/Types/Water");
const Types_2 = require("../../Types");
const getRules = (cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, transportRegistry = TransportRegistry_1.instance) => {
    return [
        new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Or_1.default(new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to) => to.isLand()), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit.player() === unit.player()))), new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Naval), new Or_1.default(new Criterion_1.default((unit, to, from = unit.tile()) => from.isWater()), new Criterion_1.default((unit, to, from = unit.tile()) => cityRegistry
            .getByTile(from)
            .some((city) => city.player() === unit.player()))), new Or_1.default(new Criterion_1.default((unit, to) => to.isWater()), new Criterion_1.default((unit, to) => cityRegistry
            .getByTile(to)
            .some((city) => city.player() === unit.player()))))), new Or_1.default(new Criterion_1.default((unit, to) => !(unit instanceof Types_1.Land)), new Or_1.default(new Criterion_1.default((unit, to) => !cityRegistry.getByTile(to).length), new Criterion_1.default((unit, to) => cityRegistry
            .getByTile(to)
            .every((city) => city.player() === unit.player())))), 
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
        new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Or_1.default(new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to) => to.isLand())), new And_1.default(new Criterion_1.default((unit, to) => unit instanceof Types_1.Naval), new Or_1.default(new Criterion_1.default((unit, to) => to.isWater()), new And_1.default(new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .some((tileUnit) => tileUnit.player() !== unit.player())))))), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            // this will return false if there are no other units on the tile
            .some((tileUnit) => tileUnit.player() !== unit.player())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Attack(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit, to) => cityRegistry
            .getByTile(to)
            .some((city) => city.player() !== unit.player())), new Criterion_1.default((unit, to) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to) => unitRegistry.getByTile(to).length === 0), new Effect_1.default((unit, to, from = unit.tile()) => 
        // TODO: pass cityRegistry in
        new Actions_1.CaptureCity(from, to, unit, ruleRegistry /*, cityRegistry*/))),
        new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Criterion_1.default((unit, to) => tileImprovementRegistry
            .getByTile(to)
            // TODO: Pillagable(sp?)Improvement subclass? or `CanBePillaged` `Rule`...
            .filter((improvement) => [TileImprovements_1.Irrigation, TileImprovements_1.Mine, TileImprovements_1.Railroad, TileImprovements_1.Road].some((Improvement) => improvement instanceof Improvement)).length > 0), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Pillage(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_1.Fortifiable), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Fortify(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Sleep(from, to, unit, ruleRegistry))),
        new Action_1.Action(new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.NoOrders(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Units_1.Settlers), new Criterion_1.default((unit, to, from = unit.tile()) => from.isLand()), new Criterion_1.default((unit, to, from = unit.tile()) => !cityRegistry.getByTile(from).length), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.FoundCity(from, to, unit, ruleRegistry))),
        ...[
            [
                TileImprovements_1.Irrigation,
                Actions_1.BuildIrrigation,
                new Or_1.default(new Criterion_1.default((unit, to, from = unit.tile()) => from.terrain() instanceof Terrains_1.River), new Criterion_1.default((unit, to, from = unit.tile()) => from.isCoast()), new Criterion_1.default((unit, to, from = unit.tile()) => from
                    .getAdjacent()
                    .some((tile) => tile.terrain() instanceof Terrains_1.River ||
                    (tileImprovementRegistry
                        .getByTile(tile)
                        .some((improvement) => improvement instanceof TileImprovements_1.Irrigation) &&
                        !cityRegistry.getByTile(tile).length)))),
            ],
            [TileImprovements_1.Mine, Actions_1.BuildMine],
            [TileImprovements_1.Road, Actions_1.BuildRoad],
        ].map(([Improvement, ActionType, ...additionalCriteria]) => new Action_1.Action(new Criterion_1.default((unit) => unit instanceof Types_2.Worker), Action_1.hasMovesLeft, new Criterion_1.default((unit, to, from = unit.tile()) => ruleRegistry
            .get(Available_1.Available)
            .some((rule) => rule.validate(from, Improvement, unit.player()))), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Criterion_1.default((unit, to) => !tileImprovementRegistry
            .getByTile(to)
            .some((improvement) => improvement instanceof Improvement)), ...additionalCriteria, new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry)))),
        ...[
            [Terrains_1.Jungle, Actions_1.ClearJungle],
            [Terrains_1.Forest, Actions_1.ClearForest],
            [Terrains_1.Plains, Actions_1.PlantForest],
            [Terrains_1.Swamp, Actions_1.ClearSwamp],
        ].map(([TerrainType, ActionType]) => new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_2.Worker), new Criterion_1.default((unit, to, from = unit.tile()) => to === from), new Criterion_1.default((unit, to, from = unit.tile()) => from.terrain() instanceof TerrainType), new Effect_1.default((unit, to, from = unit.tile()) => new ActionType(from, to, unit, ruleRegistry)))),
        new Action_1.Action(Action_1.isNeighbouringTile, Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, to) => to.terrain() instanceof Water_1.Water), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .every((tileUnit) => tileUnit.player() === unit.player())), new Criterion_1.default((unit, to) => unitRegistry
            .getByTile(to)
            .filter((tileUnit) => tileUnit instanceof Types_2.NavalTransport)
            .some((tileUnit) => tileUnit.hasCapacity())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Embark(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.isNeighbouringTile, new Criterion_1.default((unit) => {
            try {
                transportRegistry.getByUnit(unit);
                return true;
            }
            catch (e) {
                return false;
            }
        }), new Or_1.default(new Criterion_1.default((unit, to) => !(unit instanceof Types_1.Land)), new Criterion_1.default((unit, to) => to.isLand())), new Criterion_1.default((unit, to, from = unit.tile()) => transportRegistry.getByUnit(unit).transport().tile() === from), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Disembark(from, to, unit, ruleRegistry))),
        new Action_1.Action(Action_1.hasMovesLeft, new Criterion_1.default((unit) => unit instanceof Types_2.NavalTransport), new Criterion_1.default((unit) => unit.hasCargo()), new Criterion_1.default((unit, to, from = unit.tile()) => from === to), new Criterion_1.default((unit, to) => to.getNeighbours().some((tile) => tile.isLand())), new Effect_1.default((unit, to, from = unit.tile()) => new Actions_1.Unload(from, to, unit, ruleRegistry))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map