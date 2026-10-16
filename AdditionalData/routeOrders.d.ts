import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
/**
 * The route orders (`RoadTo`, `RailroadTo`) a unit may be given for a distant square, by name, so a renderer can offer
 * them beside Go to without knowing the rule (civ-clone/web-renderer#195). The engine still decides, when one is
 * chosen, whether there is a route.
 */
export declare const getAdditionalData: (
  playerResearchRegistry?: PlayerResearchRegistry
) => AdditionalData[];
export default getAdditionalData;
