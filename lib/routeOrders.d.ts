import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RailroadTo, RoadTo } from '../Actions';
import Unit from '@civ-clone/core-unit/Unit';
export declare const routeOrders: (
  unit: Unit,
  playerResearchRegistry?: PlayerResearchRegistry
) => (typeof RoadTo | typeof RailroadTo)[];
export default routeOrders;
