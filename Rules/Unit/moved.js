"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Actions_1 = require("../../Actions");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const LostAtSea_1 = require("@civ-clone/core-unit-transport/Rules/LostAtSea");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const Types_1 = require("../../Types");
const Units_1 = require("../../Units");
const getRules = (transportRegistry = TransportRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, randomNumberGenerator = () => Math.random(), engine = Engine_1.instance) => [
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
        ruleRegistry.process(LostAtSea_1.LostAtSea, unit);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map