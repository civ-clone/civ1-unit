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
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const LostAtSea_1 = require("@civ-clone/core-unit-transport/Rules/LostAtSea");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const Sleeping_1 = require("@civ-clone/base-unit-action-sleep/Rules/Sleeping");
const Types_1 = require("../../Types");
const Stowed_1 = require("@civ-clone/base-unit-action-embark/Busy/Stowed");
const Declarations_1 = require("@civ-clone/library-diplomacy/Declarations");
const core_random_1 = require("@civ-clone/core-random");
const getRules = (transportRegistry = TransportRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, randomNumberGenerator = core_random_1.instance, engine = Engine_1.instance, cityRegistry = CityRegistry_1.instance, 
// No longer used: aircraft fuel is checked at the end of the turn (`Rules/Player/turnEnd`). Kept so the positional
// arguments after it still line up for existing callers.
turn = Turn_1.instance, interactionRegistry = InteractionRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => {
    // Stows each of `units` aboard `transport`, as `Embark` and `LandAircraft` do, until it is full.
    const collect = (transport, units) => units.forEach((unit) => {
        if (!transport.hasCapacity() || !transport.canStow(unit)) {
            return;
        }
        transport.stow(unit, unit.tile());
        unit.setBusy(new Stowed_1.default());
    }), 
    // The transport's own units on the tile it has just moved onto, that aren't already aboard something.
    unitsToCollect = (transport, tile = transport.tile()) => unitRegistry
        .getByTile(tile)
        .filter((unit) => unit !== transport &&
        unit.player() === transport.player() &&
        !transportRegistry.hasUnit(unit)), 
    // A transport's own move that took it onto a new tile (not one it was carried along on, and not an attack).
    transportMoved = [
        new Criterion_1.default((unit) => unit instanceof Types_1.NavalTransport),
        new Criterion_1.default((unit, action) => action instanceof Actions_1.Move),
        new Criterion_1.default((unit, action) => action.to() === unit.tile()),
    ], isOwnCity = (unit) => { var _a; return ((_a = cityRegistry.getByTile(unit.tile())) === null || _a === void 0 ? void 0 : _a.player()) === unit.player(); };
    return [
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
        // These two come after `move-cargo`, so a unit collected here isn't also sent along the move just made.
        new Moved_1.default(
        // A Carrier that moves onto its player's aircraft picks them up. Aircraft in a city have landed, so they're only
        // collected there if they are sleeping (`moved/collect-sleeping`).
        'civ1-unit:unit/moved/collect-aircraft', ...transportMoved, new Criterion_1.default((unit) => !isOwnCity(unit)), new Effect_1.default((unit) => collect(unit, unitsToCollect(unit).filter((tileUnit) => tileUnit instanceof Types_1.Air)))),
        new Moved_1.default(
        // A transport that moves into one of its player's cities picks up the units sleeping there, as in Civ1.
        'civ1-unit:unit/moved/collect-sleeping', ...transportMoved, new Criterion_1.default((unit) => isOwnCity(unit)), new Effect_1.default((unit) => collect(unit, unitsToCollect(unit).filter((tileUnit) => tileUnit.busy() instanceof Sleeping_1.default)))),
        new Moved_1.default('civ1-unit:unit/moved/disembark', new Criterion_1.default((unit, action) => action instanceof Actions_1.Disembark), new Effect_1.default((unit) => {
            const manifest = transportRegistry.getByUnit(unit);
            manifest.transport().unload(unit);
            transportRegistry.unregister(manifest);
        })),
        new Moved_1.default(
        // A unit can leave its transport with a plain `Move`, keeping its moves (`Disembark` would end its turn): an
        // aircraft taking off from a Carrier, or a unit walking off a ship in a city. Once it has left the transport's tile
        // it is no longer aboard. A Move that takes it along with the transport (`moved/move-cargo`) leaves it on the
        // transport's tile, so doesn't unload it.
        'civ1-unit:unit/moved/take-off', new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), 
        // A `Disembark` is a `Move` too, and `moved/disembark` unloads it. Every rule's criteria are checked before any
        // effect runs, so without this the unit would still look aboard here.
        new Criterion_1.default((unit, action) => !(action instanceof Actions_1.Disembark)), new Criterion_1.default((unit) => transportRegistry.hasUnit(unit)), new Criterion_1.default((unit) => transportRegistry.getByUnit(unit).transport().tile() !== unit.tile()), new Effect_1.default((unit) => {
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
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map