"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Destroyed_1 = require("@civ-clone/core-unit/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Stowed_1 = require("@civ-clone/base-unit-action-embark/Busy/Stowed");
const Types_1 = require("@civ-clone/core-terrain/Types");
const getRules = (unitRegistry = UnitRegistry_1.instance, unitImprovementRegistry = UnitImprovementRegistry_1.instance, engine = Engine_1.instance, transportRegistry = TransportRegistry_1.instance) => [
    new Destroyed_1.default('civ1-unit:unit/destroyed/emit', new Effect_1.default((unit, player) => {
        engine.emit('unit:destroyed', unit, player);
    })),
    new Destroyed_1.default('civ1-unit:unit/destroyed/deactivate', new Effect_1.default((unit) => {
        unit.setActive(false);
        unit.setDestroyed();
    })),
    new Destroyed_1.default('civ1-unit:unit/destroyed/remove-improvements', new Effect_1.default((unit) => unitImprovementRegistry
        .getByUnit(unit)
        .forEach((unitImprovement) => unitImprovementRegistry.unregister(unitImprovement)))),
    new Destroyed_1.default(
    // Cargo goes down with a transport lost at sea, however it was lost. In a city, it stays in the city.
    'civ1-unit:unit/destroyed/lose-cargo', new Criterion_1.default((unit) => transportRegistry.getByTransport(unit).length >
        0), new Effect_1.default((unit, player) => transportRegistry
        .getByTransport(unit)
        // A copy: unregistering changes the list.
        .slice()
        .forEach((manifest) => {
        const cargo = manifest.unit();
        transportRegistry.unregister(manifest);
        if (unit.tile().terrain() instanceof Types_1.Water) {
            if (!cargo.destroyed()) {
                cargo.destroy(player);
            }
            return;
        }
        if (cargo.busy() instanceof Stowed_1.default) {
            cargo.setBusy();
        }
    }))),
    new Destroyed_1.default(
    // Cargo destroyed on its own, or by the stack rule before its transport, is no longer aboard.
    'civ1-unit:unit/destroyed/leave-transport', new Criterion_1.default((unit) => transportRegistry.hasUnit(unit)), new Effect_1.default((unit) => transportRegistry.unregister(transportRegistry.getByUnit(unit)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=destroyed.js.map