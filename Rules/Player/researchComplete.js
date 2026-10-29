"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityRegistry = CityRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance) => [
    new Complete_1.default(
    // A discovery can make what a city is building obsolete, as Gunpowder does Spearman: the city stops and its player
    //  chooses again (civ-clone/web-renderer#693). Civ1 builds it anyway; this is a deliberate change.
    'civ1-unit:player/research-complete/revalidate-builds', new Effect_1.default((playerResearch) => cityRegistry
        .getByPlayer(playerResearch.player())
        .forEach((city) => cityBuildRegistry.getByCity(city).revalidate()))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=researchComplete.js.map