import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import Unit from '@civ-clone/core-unit/Unit';
import routeOrders from '../lib/routeOrders';
import { typeNameOf } from '@civ-clone/core-data-object/DataObject';

/**
 * The route orders (`RoadTo`, `RailroadTo`) a unit may be given for a distant square, by name, so a renderer can offer
 * them beside Go to without knowing the rule (civ-clone/web-renderer#195). The engine still decides, when one is
 * chosen, whether there is a route.
 */
export const getAdditionalData = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): AdditionalData[] => [
  new AdditionalData(Unit, 'routeOrders', (unit: Unit): string[] =>
    routeOrders(unit, playerResearchRegistry).map((Order) => typeNameOf(Order))
  ),
];

export default getAdditionalData;
