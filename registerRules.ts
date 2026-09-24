import action from './Rules/Unit/action';
import activate from './Rules/Unit/activate';
import build from './Rules/City/build';
import buildCost from './Rules/City/buildCost';
import buildingComplete from './Rules/City/buildingComplete';
import created from './Rules/Unit/created';
import defeated from './Rules/Unit/defeated';
import destroyed from './Rules/Unit/destroyed';
import lostAtSea from './Rules/Unit/lostAtSea';
import moved from './Rules/Unit/moved';
import movementCost from './Rules/Unit/movementCost';
import playerAction from './Rules/Player/action';
import stowed from './Rules/Unit/stowed';
import turnEnd from './Rules/Player/turnEnd';
import unitYield from './Rules/Unit/yield';
import unsupported from './Rules/Unit/unsupported';
import validateMove from './Rules/Unit/validateMove';
import { Game, defaultGame } from '@civ-clone/core-game';

export const register = (game: Game): void =>
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
      game.strategyNotes
    ),
    ...activate(game.unitImprovements),
    ...build(game.playerResearch),
    ...buildCost(),
    ...buildingComplete(game.cityGrowth),
    ...created(game.units, game.engine),
    ...defeated(
      game.cities,
      game.rules,
      game.tileImprovements,
      game.units,
      game.engine
    ),
    ...destroyed(game.units, game.unitImprovements, game.engine),
    ...lostAtSea(game.engine),
    ...moved(
      game.transports,
      game.rules,
      game.rng,
      game.engine,
      game.cities,
      game.turn,
      game.interactions
    ),
    ...movementCost(game.tileImprovements, game.transports),
    ...playerAction(game.units),
    ...stowed(),
    ...turnEnd(
      game.units,
      game.cities,
      game.transports,
      game.strategyNotes,
      game.rules
    ),
    ...unitYield(game.unitImprovements, game.rules, game.transports),
    ...unsupported(game.engine),
    ...validateMove(game.rng)
  );

// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
register(defaultGame);

export default register;
