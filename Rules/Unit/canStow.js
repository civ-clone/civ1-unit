"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const canStow_1 = require("@civ-clone/base-unit-lifecycle/lib/canStow");
const Types_1 = require("../../Types");
const CanStow_1 = require("@civ-clone/core-unit-transport/Rules/CanStow");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Types_2 = require("@civ-clone/library-unit/Types");
// What a transport carries is its `Carries` traits (`Rules/Unit/traits`): Land for the Trireme, Sail, Frigate and
//  Transport, Air for the Carrier. One rule for each domain a transport may be declared to carry, so the ids stay.
const getRules = () => [Types_2.Land, Types_1.Air].map((StowableUnitType) => new CanStow_1.default(`civ1-unit:unit/can-stow/${StowableUnitType.name}`, new Criterion_1.default((0, canStow_1.carriesDomain)(StowableUnitType)), new Effect_1.default((0, canStow_1.carriesUnit)(StowableUnitType))));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=canStow.js.map