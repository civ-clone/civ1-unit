"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Defeated_1 = require("@civ-clone/core-unit/Rules/Defeated");
const Destroyed_1 = require("@civ-clone/core-unit/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, engine = Engine_1.instance) => [
    new Defeated_1.default(new Effect_1.default((unit, by) => {
        engine.emit('unit:defeated', unit, by);
        ruleRegistry.process(Destroyed_1.default, unit, by.player());
    })),
    new Defeated_1.default(new Criterion_1.default((unit) => cityRegistry.getByTile(unit.tile()) === null), 
    // TODO: Add `Fortress`es
    // new Criterion((unit: Unit) =>
    //   !tileImprovementRegistry.getByTile(unit.tile())
    //     .some((tileImprovement) => tileImprovement instanceof Fortress)
    // ),
    new Criterion_1.default((unit) => unitRegistry
        .getByTile(unit.tile())
        .filter((tileUnit) => tileUnit !== unit && tileUnit.player() === unit.player()).length > 0), new Effect_1.default((unit, by) => unitRegistry.getByTile(unit.tile()).forEach((tileUnit) => {
        if (!(tileUnit !== unit && tileUnit.player() === unit.player())) {
            return;
        }
        ruleRegistry.process(Destroyed_1.default, unit, by.player());
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map