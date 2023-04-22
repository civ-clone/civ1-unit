"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Units_1 = require("../../Units");
const Types_1 = require("../../Types");
const CanStow_1 = require("@civ-clone/core-unit-transport/Rules/CanStow");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Types_2 = require("@civ-clone/library-unit/Types");
const getRules = () => [
    ...[
        [Types_2.Land, Units_1.Trireme, Units_1.Sail, Units_1.Frigate, Units_1.Transport],
        [Types_1.Air, Units_1.Carrier],
    ].map(([StowableUnitType, ...transportTypes]) => new CanStow_1.default(new Criterion_1.default((transport) => transportTypes.some((TransportType) => transport instanceof TransportType)), new Effect_1.default((transport, unit) => unit instanceof StowableUnitType))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=canStow.js.map