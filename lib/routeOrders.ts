import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import { RailroadTo, RoadTo } from '../Actions';
import { Railroad as RailroadAdvance } from '@civ-clone/library-science/Advances';
import Terraforms from '@civ-clone/base-unit-trait-terraforms/Terraforms';
import Unit from '@civ-clone/core-unit/Unit';
import { routeOrders as routeOrderTable } from '@civ-clone/base-unit-action-build-route/lib/routeOrders';

// The route orders `unit` may be given for a distant square it has a route to (civ-clone/web-renderer#195): Road to
//  for a unit that `Terraforms`, and Railroad to once its player knows Railroad. The `road-to` and `railroad-to` actions are offered
//  by this, and `AdditionalData/routeOrders` tells a renderer which to offer, so neither has the rule twice.
const civ1RouteOrders = routeOrderTable<typeof RoadTo | typeof RailroadTo>(
  [
    [RoadTo, null],
    [RailroadTo, RailroadAdvance],
  ],
  Terraforms
);

export const routeOrders = (
  unit: Unit,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): (typeof RoadTo | typeof RailroadTo)[] =>
  civ1RouteOrders(unit, playerResearchRegistry);

export default routeOrders;
