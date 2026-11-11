import { Engine } from '@civ-clone/core-engine/Engine';
import { LandMassRegistry } from '@civ-clone/core-world/LandMassRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { TradeRouteRegistry } from '@civ-clone/core-city/TradeRouteRegistry';
import TradeRouteEstablished from '@civ-clone/base-unit-action-establish-trade-route/Rules/TradeRouteEstablished';
import Unit from '@civ-clone/core-unit/Unit';
export declare const goods: string[];
export declare const goodsFor: (unit: Unit) => string;
export declare const routesPerCity = 3;
export declare const getRules: (
  tradeRouteRegistry?: TradeRouteRegistry,
  playerTreasuryRegistry?: PlayerTreasuryRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  landMassRegistry?: LandMassRegistry,
  engine?: Engine
) => TradeRouteEstablished[];
export default getRules;
