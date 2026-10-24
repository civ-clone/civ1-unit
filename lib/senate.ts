import { Democracy, Republic } from '@civ-clone/library-government/Governments';
import Player from '@civ-clone/core-player/Player';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';

/**
 * Whether `player` has a Senate, which won't let it break a peace treaty: the
 * Republic and Democracy (v474.05 `F0_29f3_0c9e`, civ-clone/web-renderer#133).
 * A player with no government yet has none.
 */
export const hasSenate = (
  player: Player,
  playerGovernmentRegistry: PlayerGovernmentRegistry
): boolean => {
  try {
    return playerGovernmentRegistry.getByPlayer(player).is(Republic, Democracy);
  } catch (e) {
    return false;
  }
};

export default hasSenate;
