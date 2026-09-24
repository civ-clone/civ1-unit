"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.turnsAloftKey = exports.aircraftRange = void 0;
const Units_1 = require("../../Units");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const StrategyNote_1 = require("@civ-clone/core-strategy/StrategyNote");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const LostAtSea_1 = require("@civ-clone/core-unit-transport/Rules/LostAtSea");
const TurnEnd_1 = require("@civ-clone/core-player/Rules/TurnEnd");
// How many turns each aircraft can end away from a `City` or `Carrier`, including the one it took off in. A `Bomber`
// can stay out for one turn, but must land by the end of the second.
exports.aircraftRange = [
    [Units_1.Bomber, 2],
    [Units_1.Fighter, 1],
    [Units_1.Nuclear, 1],
];
const turnsAloftKey = (unit) => (0, StrategyNote_1.generateKey)('civ1-unit:aircraft/turns-aloft', unit);
exports.turnsAloftKey = turnsAloftKey;
const getRules = (unitRegistry = UnitRegistry_1.instance, cityRegistry = CityRegistry_1.instance, transportRegistry = TransportRegistry_1.instance, strategyNoteRegistry = StrategyNoteRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new TurnEnd_1.default('civ1-unit:player/turn-end/aircraft/fuel', new Effect_1.default((player) => unitRegistry.getByPlayer(player).forEach((unit) => {
        var _a, _b, _c;
        const [, range] = (_a = exports.aircraftRange.find(([UnitType]) => unit instanceof UnitType)) !== null && _a !== void 0 ? _a : [];
        if (range === undefined || unit.destroyed()) {
            return;
        }
        // Kept as a `StrategyNote` so the count survives a save.
        const key = (0, exports.turnsAloftKey)(unit), note = strategyNoteRegistry.getByKey(key), landed = ((_b = cityRegistry.getByTile(unit.tile())) === null || _b === void 0 ? void 0 : _b.player()) === unit.player() ||
            transportRegistry.hasUnit(unit);
        if (landed) {
            if (note) {
                strategyNoteRegistry.unregister(note);
            }
            return;
        }
        const turnsAloft = ((_c = note === null || note === void 0 ? void 0 : note.value()) !== null && _c !== void 0 ? _c : 0) + 1;
        if (turnsAloft < range) {
            strategyNoteRegistry.replace(new StrategyNote_1.default(key, turnsAloft));
            return;
        }
        if (note) {
            strategyNoteRegistry.unregister(note);
        }
        // TODO: New `Rule` here
        ruleRegistry.process(LostAtSea_1.default, unit);
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turnEnd.js.map