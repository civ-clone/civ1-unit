"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const Types_1 = require("../../Types");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const MovementCost_1 = require("@civ-clone/core-unit/Rules/MovementCost");
const getRules = (tileImprovementRegistry = TileImprovementRegistry_1.instance, transportRegistry = TransportRegistry_1.instance) => [
    ...[
        [Terrains_1.Arctic, 2],
        [Terrains_1.Desert, 1],
        [Terrains_1.Forest, 2],
        [Terrains_1.Grassland, 1],
        [Terrains_1.Hills, 2],
        [Terrains_1.Jungle, 2],
        [Terrains_1.Mountains, 3],
        [Terrains_1.Ocean, 1],
        [Terrains_1.Plains, 1],
        [Terrains_1.River, 1],
        [Terrains_1.Swamp, 2],
        [Terrains_1.Tundra, 1],
    ].map(([TerrainType, cost]) => new MovementCost_1.default(new Criterion_1.default((unit, action) => action.to().terrain() instanceof TerrainType), new Effect_1.default(() => cost))),
    new MovementCost_1.default(new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.from())
        .some((improvement) => improvement instanceof TileImprovements_1.Road)), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.to())
        .some((improvement) => improvement instanceof TileImprovements_1.Road)), new Effect_1.default(() => 1 / 3)),
    new MovementCost_1.default(new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.from())
        .some((improvement) => improvement instanceof TileImprovements_1.Railroad)), new Criterion_1.default((unit, action) => tileImprovementRegistry
        .getByTile(action.to())
        .some((improvement) => improvement instanceof TileImprovements_1.Railroad)), 
    // TODO: need to also protect against goto etc, like classic Civ does, although I'd rather that was done by evaluating
    //  the moves and if a loop is detected auto-cancelling - this is pretty primitive.
    // new Criterion((unit) => ! (unit.player() instanceof AIPlayer)),
    new Effect_1.default(() => 0)),
    new MovementCost_1.default(new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit) => {
        try {
            transportRegistry.getByUnit(unit);
            return true;
        }
        catch (e) {
            return false;
        }
    }), new Criterion_1.default((unit) => transportRegistry.getByUnit(unit).transport() instanceof Types_1.NavalTransport), new Effect_1.default(() => 0)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=movementCost.js.map