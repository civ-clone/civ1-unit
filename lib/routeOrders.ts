import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import { RailroadTo, RoadTo } from '../Actions';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { Railroad as RailroadAdvance } from '@civ-clone/library-science/Advances';
import Unit from '@civ-clone/core-unit/Unit';
import { Worker } from '../Types';

// The route orders `unit` may be given for a distant square it has a route to (civ-clone/web-renderer#195): Road to
//  for a worker, and Railroad to once its player knows Railroad. The `road-to` and `railroad-to` actions are offered
//  by this, and `AdditionalData/routeOrders` tells a renderer which to offer, so neither has the rule twice.
export const routeOrders = (
  unit: Unit,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): (typeof RoadTo | typeof RailroadTo)[] => {
  if (!(unit instanceof Worker)) {
    return [];
  }

  // A player with no research of its own (a barbarian, say) knows nothing.
  return playerResearchRegistry
    .getBy('player', unit.player())
    .some((research: PlayerResearch): boolean =>
      research.completed(RailroadAdvance)
    )
    ? [RoadTo, RailroadTo]
    : [RoadTo];
};

export default routeOrders;
