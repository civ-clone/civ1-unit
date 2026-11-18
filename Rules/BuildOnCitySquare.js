"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildOnCitySquare = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether `player` may build a tile improvement on `tile`, a city's square (civ-clone/web-renderer#1029), asked with
 * `Available`'s arguments. Any rule that answers `false` refuses it, and a rule answering `true` can't undo that: a rule
 * set allows what another refuses by superseding the refusal. With no rules, it may be built wherever it otherwise
 * could.
 */
class BuildOnCitySquare extends Rule_1.default {
}
exports.BuildOnCitySquare = BuildOnCitySquare;
exports.default = BuildOnCitySquare;
//# sourceMappingURL=BuildOnCitySquare.js.map