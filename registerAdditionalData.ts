import { Game, defaultGame } from '@civ-clone/core-game';
import joinCityRefusal from './AdditionalData/joinCityRefusal';

export const register = (game: Game): void =>
  game.additionalData.register(
    ...joinCityRefusal(game.cities, game.cityGrowth)
  );

// Imported for this side effect, as `registerRules` is.
register(defaultGame);

export default register;
