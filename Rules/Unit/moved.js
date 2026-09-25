"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Units_1 = require("../../Units");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Actions_1 = require("../../Actions");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const LostAtSea_1 = require("@civ-clone/core-unit-transport/Rules/LostAtSea");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const Types_1 = require("../../Types");
const Stowed_1 = require("@civ-clone/base-unit-action-embark/Busy/Stowed");
const Declarations_1 = require("@civ-clone/library-diplomacy/Declarations");
const core_random_1 = require("@civ-clone/core-random");
const getRules = (transportRegistry = TransportRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, randomNumberGenerator = core_random_1.instance, engine = Engine_1.instance, 
// No longer used: aircraft fuel is checked at the end of the turn (`Rules/Player/turnEnd`). Kept so the positional
// arguments after them still line up for existing callers.
cityRegistry = CityRegistry_1.instance, turn = Turn_1.instance, interactionRegistry = InteractionRegistry_1.instance) => [
    new Moved_1.default('civ1-unit:unit/moved/emit', new Effect_1.default((unit, action) => {
        engine.emit('unit:moved', unit, action);
    })),
    new Moved_1.default('civ1-unit:unit/moved/apply-visibility', new Effect_1.default((unit) => unit.applyVisibility())),
    new Moved_1.default('civ1-unit:unit/moved/end-moves-when-exhausted', new Criterion_1.default((unit) => unit.moves().value() < 0.3), new Effect_1.default((unit) => {
        unit.moves().set(0);
        unit.setActive(false);
    })),
    new Moved_1.default('civ1-unit:unit/moved/move-cargo', new Criterion_1.default((unit) => unit instanceof Types_1.NavalTransport), new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit.hasCargo()), new Effect_1.default((unit, action) => unit
        .cargo()
        .forEach((unit) => unit.action(action.forUnit(unit))))),
    new Moved_1.default('civ1-unit:unit/moved/disembark', new Criterion_1.default((unit, action) => action instanceof Actions_1.Disembark), new Effect_1.default((unit) => {
        const manifest = transportRegistry.getByUnit(unit);
        manifest.transport().unload(unit);
        transportRegistry.unregister(manifest);
    })),
    new Moved_1.default(
    // An aircraft takes off from a Carrier with a plain `Move`, so it keeps its moves (`Disembark` would end its turn).
    // Once it has left the Carrier's tile it is no longer aboard. A Move that takes it along with the Carrier
    // (`moved/move-cargo`) leaves it on the Carrier's tile, so doesn't unload it.
    'civ1-unit:unit/moved/take-off', new Criterion_1.default((unit) => unit instanceof Types_1.Air), new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => transportRegistry.hasUnit(unit)), new Criterion_1.default((unit) => transportRegistry.getByUnit(unit).transport().tile() !== unit.tile()), new Effect_1.default((unit) => {
        transportRegistry.getByUnit(unit).transport().unload(unit);
        if (unit.busy() instanceof Stowed_1.default) {
            unit.setBusy();
        }
    })),
    new Moved_1.default('civ1-unit:unit/moved/trireme-lost-at-sea', new Criterion_1.default((unit) => unit instanceof Units_1.Trireme), new Criterion_1.default((unit) => unit.moves().value() === 0), new Criterion_1.default((unit) => !unit.tile().isCoast()), new Criterion_1.default(() => randomNumberGenerator() <= 0.5), new Effect_1.default((unit) => {
        ruleRegistry.process(LostAtSea_1.default, unit);
    })),
    new Moved_1.default(
    // A `Bomber` drops its whole payload in one attack, so it can't attack again until next turn.
    'civ1-unit:unit/moved/bomber/end-turn-after-attack', new High_1.default(), new Criterion_1.default((unit) => unit instanceof Units_1.Bomber), new Criterion_1.default((unit, action) => action instanceof Actions_1.Attack || action instanceof Actions_1.SneakAttack), new Effect_1.default((unit) => {
        unit.moves().set(0);
        unit.setActive(false);
    })),
    new Moved_1.default('civ1-unit:unit/moved/break-peace-treaty', new Criterion_1.default((unit, action) => action instanceof Actions_1.SneakAttack || action instanceof Actions_1.SneakCaptureCity), new Effect_1.default((unit, action) => {
        const peaceTreaties = interactionRegistry
            .getByPlayers(unit.player(), action.enemy())
            .filter((interaction) => interaction instanceof Declarations_1.Peace && interaction.active());
        peaceTreaties.forEach((peaceTreaty) => peaceTreaty.expire());
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map