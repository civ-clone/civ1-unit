"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Units_1 = require("../../Units");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Actions_1 = require("../../Actions");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const And_1 = require("@civ-clone/core-rule/Criteria/And");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const LostAtSea_1 = require("@civ-clone/core-unit-transport/Rules/LostAtSea");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const Or_1 = require("@civ-clone/core-rule/Criteria/Or");
const Types_1 = require("../../Types");
const unitMoveStore = new Map();
const getRules = (transportRegistry = TransportRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, randomNumberGenerator = () => Math.random(), engine = Engine_1.instance, cityRegistry = CityRegistry_1.instance, turn = Turn_1.instance) => [
    new Moved_1.default(new Effect_1.default((unit, action) => {
        engine.emit('unit:moved', unit, action);
    })),
    new Moved_1.default(new Effect_1.default((unit) => unit.applyVisibility())),
    new Moved_1.default(new Criterion_1.default((unit) => unit.moves().value() <= 0.1), new Effect_1.default((unit) => unit.moves().set(0))),
    new Moved_1.default(new Criterion_1.default((unit) => unit.moves().value() < 0.1), new Effect_1.default((unit) => unit.setActive(false))),
    new Moved_1.default(new Criterion_1.default((unit) => unit instanceof Types_1.NavalTransport), new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit.hasCargo()), new Effect_1.default((unit, action) => unit
        .cargo()
        .forEach((unit) => unit.action(action.forUnit(unit))))),
    new Moved_1.default(new Criterion_1.default((unit, action) => action instanceof Actions_1.Disembark), new Effect_1.default((unit) => {
        const manifest = transportRegistry.getByUnit(unit);
        manifest.transport().unload(unit);
        transportRegistry.unregister(manifest);
    })),
    new Moved_1.default(new Criterion_1.default((unit) => unit instanceof Units_1.Trireme), new Criterion_1.default((unit) => unit.moves().value() === 0), new Criterion_1.default((unit) => !unit.tile().isCoast()), new Criterion_1.default(() => randomNumberGenerator() <= 0.5), new Effect_1.default((unit) => {
        ruleRegistry.process(LostAtSea_1.default, unit);
    })),
    ...[
        [Units_1.Bomber, 1],
        [Units_1.Fighter, 0],
        [Units_1.Nuclear, 0],
    ].flatMap(([UnitType, numberOfTurns]) => [
        new Moved_1.default(new High_1.default(), new Criterion_1.default((unit) => unit instanceof UnitType), new Criterion_1.default((unit) => unit.moves().value() === 0), new Criterion_1.default((unit) => !unitMoveStore.has(unit)), new Effect_1.default((unit) => {
            unitMoveStore.set(unit, turn.value());
        })),
        new Moved_1.default(new Criterion_1.default((unit) => unit instanceof UnitType), new Criterion_1.default((unit) => unit.moves().value() === 0), new Or_1.default(
        // If the `Unit` is in a `City`....
        new Criterion_1.default((unit) => cityRegistry.getByTile(unit.tile()) !== null), 
        // ...or is being `Transport`ed.
        new Criterion_1.default((unit) => !!transportRegistry.getByUnit(unit))), new Effect_1.default((unit) => {
            unitMoveStore.delete(unit);
        })),
        new Moved_1.default(new Criterion_1.default((unit) => unit instanceof UnitType), new Criterion_1.default((unit) => unit.moves().value() === 0), new And_1.default(
        // If the `Unit` is not in a `City`....
        new Criterion_1.default((unit) => cityRegistry.getByTile(unit.tile()) === null), 
        // ...and isn't being `Transport`ed.
        new Criterion_1.default((unit) => !transportRegistry.getByUnit(unit))), new Criterion_1.default((unit) => {
            var _a;
            return ((_a = unitMoveStore.get(unit)) !== null && _a !== void 0 ? _a : turn.value()) + numberOfTurns <=
                turn.value();
        }), new Effect_1.default((unit) => {
            // TODO: New `Rule` here
            ruleRegistry.process(LostAtSea_1.default, unit);
        })),
    ]),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map