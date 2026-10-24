"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Impassable_1 = require("@civ-clone/core-world-path/Rules/Impassable");
const treatyPartner_1 = require("../../lib/treatyPartner");
const getRules = (interactionRegistry = InteractionRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    new Impassable_1.default(
    // Routes go round a treaty partner's land, so following one (a GoTo, a computer player's route) never breaks a
    //  treaty by accident (#287). Only a step from land onto land asks, as `action/sneak-move` does.
    'civ1-unit:unit/impassable/treaty-partners-land', new Criterion_1.default((unit, to, from) => from.isLand()), new Criterion_1.default((unit, to) => (0, treatyPartner_1.default)(unit, to, interactionRegistry, tileImprovementRegistry, workedTileRegistry) !== null), new Effect_1.default(() => true)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=impassable.js.map