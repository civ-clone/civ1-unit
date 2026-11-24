"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const defeated_1 = require("@civ-clone/base-unit-lifecycle/lib/defeated");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Defeated_1 = require("@civ-clone/core-unit/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const getRules = (cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, engine = Engine_1.instance) => [
    new Defeated_1.default('civ1-unit:unit/defeated/emit-and-destroy', 
    // High, so the beaten unit is destroyed, and counted as a loss to the winner, before any other package's
    //  `Defeated` rule runs: before `civ1-city` shrinks, or destroys, the city it defended, as v474.05's `battle`
    //  (`BATTLE.C`) drops the defender before `vanish` (`CONTROL.C`) removes the city. Shrinking first destroyed a
    //  defender the city supported, or every unit of a player losing its last city, by no one, so the loss went
    //  uncounted (civ-clone/web-renderer#1000).
    new High_1.default(), 
    // The action is the attack, so a listener can tell the attacker from the defender: `action.unit()` attacked.
    new Effect_1.default((0, defeated_1.emitAndDestroy)(engine, ruleRegistry))),
    new Defeated_1.default('civ1-unit:unit/defeated/destroy-stack', 
    // `Attack` processes `Defeated` for a losing attacker too; only a defeated defender takes its stack with it.
    new Criterion_1.default(defeated_1.defended), new Criterion_1.default((0, defeated_1.notInCity)(cityRegistry)), 
    // Nor on a Fortress, where only the defender dies (v474.05 `BATTLE.C`, map flag 0x20; civ-clone/web-renderer#388).
    new Criterion_1.default((unit) => !tileImprovementRegistry
        .getByTile(unit.tile())
        .some((tileImprovement) => tileImprovement instanceof TileImprovements_1.Fortress)), new Criterion_1.default((0, defeated_1.hasStack)(unitRegistry)), new Effect_1.default((0, defeated_1.destroyStack)(unitRegistry, ruleRegistry)), 
    // What a Fortress does here, for the Civilopedia.
    new Description_1.default({ type: 'spares_stack', subject: TileImprovements_1.Fortress })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map