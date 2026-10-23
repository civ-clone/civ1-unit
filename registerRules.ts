import action from './Rules/Unit/action';
import activate from './Rules/Unit/activate';
import { buildRequirements, describedRequirements } from './Requirements';
import { deriveBuildRules, navalNeedsCoastRule } from './Rules/City/build';
import buildCost from './Rules/City/buildCost';
import buildingComplete from './Rules/City/buildingComplete';
import canJoinCity from './Rules/Unit/canJoinCity';
import canStow from './Rules/Unit/canStow';
import cityCaptured from './Rules/City/captured';
import created from './Rules/Unit/created';
import defeated from './Rules/Unit/defeated';
import destroyed from './Rules/Unit/destroyed';
import detonated from './Rules/Unit/detonated';
import diplomat from './Rules/Unit/diplomat';
import expectedMovementCost from './Rules/Unit/expectedMovementCost';
import halted from './Rules/Unit/halted';
import lostAtSea from './Rules/Unit/lostAtSea';
import moved from './Rules/Unit/moved';
import movementCost from './Rules/Unit/movementCost';
import playerAction from './Rules/Player/action';
import stowed from './Rules/Unit/stowed';
import strength from './Rules/Unit/strength';
import tradeRouteEstablished from './Rules/Unit/tradeRouteEstablished';
import transferred from './Rules/Unit/transferred';
import turnEnd from './Rules/Player/turnEnd';
import unitYield from './Rules/Unit/yield';
import unsupported from './Rules/Unit/unsupported';
import validateMove from './Rules/Unit/validateMove';
import { Game, defaultGame } from '@civ-clone/core-game';

export const register = (game: Game): void => {
  game.rules.register(
    ...action(
      game.cityNames,
      game.cities,
      game.rules,
      game.tileImprovements,
      game.unitImprovements,
      game.units,
      game.terrainFeatures,
      game.transports,
      game.turn,
      game.interactions,
      game.workedTiles,
      game.pathFinders,
      game.strategyNotes,
      game.cityGrowth,
      game.landMasses,
      game.cityBuilds,
      game.cityImprovements,
      game.playerResearch,
      game.playerTreasuries,
      game.strategies,
      game.engine
    ),
    ...activate(game.unitImprovements),
    navalNeedsCoastRule()
  );

  // Which units a city may build, from the entries in `Requirements`: their rules land where the build rules always
  //  were, between the rules above and below, so nothing else moves in the order rules run (civ-clone/web-renderer#37).
  game.requirements.add(
    deriveBuildRules(game.playerResearch),
    ...buildRequirements
  );
  game.requirements.add(null, ...describedRequirements);

  game.rules.register(
    ...buildCost(),
    ...buildingComplete(game.cityGrowth),
    ...canJoinCity(game.cityGrowth),
    ...canStow(),
    ...cityCaptured(game.cities, game.units, game.cityGrowth),
    ...created(game.units, game.engine),
    ...defeated(
      game.cities,
      game.rules,
      game.tileImprovements,
      game.units,
      game.engine
    ),
    ...destroyed(
      game.units,
      game.unitImprovements,
      game.engine,
      game.transports
    ),
    ...detonated(
      game.cities,
      game.cityImprovements,
      game.cityGrowth,
      game.rules,
      game.units,
      game.engine,
      game.rng,
      game.tileImprovements
    ),
    ...expectedMovementCost(),
    ...halted(game.engine),
    ...lostAtSea(game.engine),
    ...moved(
      game.transports,
      game.rules,
      game.rng,
      game.engine,
      game.cities,
      game.turn,
      game.interactions,
      game.units
    ),
    ...movementCost(game.tileImprovements, game.transports),
    ...playerAction(game.units),
    ...stowed(),
    ...diplomat(
      game.cityBuilds,
      game.cityImprovements,
      game.cities,
      game.interactions,
      game.playerResearch,
      game.playerTreasuries,
      game.rules,
      game.turn,
      game.engine,
      game.rng
    ),
    ...transferred(game.unitImprovements, game.engine, game.strategyNotes),
    ...tradeRouteEstablished(
      game.tradeRoutes,
      game.playerTreasuries,
      game.playerResearch,
      game.landMasses,
      game.engine
    ),
    ...turnEnd(
      game.units,
      game.cities,
      game.transports,
      game.strategyNotes,
      game.rules
    ),
    ...strength(game.cities, game.cityImprovements, game.unitImprovements),
    ...unitYield(game.unitImprovements, game.rules, game.transports),
    ...unsupported(game.engine),
    ...validateMove(game.rng)
  );
};

// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
register(defaultGame);

export default register;
