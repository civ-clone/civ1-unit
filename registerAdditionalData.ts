import { Game, defaultGame } from '@civ-clone/core-game';
import attackSound from './AdditionalData/attackSound';
import defenceBonus from './AdditionalData/defenceBonus';
import joinCityRefusal from './AdditionalData/joinCityRefusal';
import routeOrders from './AdditionalData/routeOrders';

export const register = (game: Game): void =>
  game.additionalData.register(
    ...defenceBonus(game.cities, game.cityImprovements, game.unitImprovements),
    ...attackSound(),
    ...joinCityRefusal(game.cities, game.cityGrowth),
    ...routeOrders(game.playerResearch)
  );

// Imported for this side effect, as `registerRules` is.
register(defaultGame);

export default register;
