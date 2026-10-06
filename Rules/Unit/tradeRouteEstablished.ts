import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  LandMassRegistry,
  instance as landMassRegistryInstance,
} from '@civ-clone/core-world/LandMassRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  PlayerTreasuryRegistry,
  instance as playerTreasuryRegistryInstance,
} from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import {
  TradeRouteRegistry,
  instance as tradeRouteRegistryInstance,
} from '@civ-clone/core-city/TradeRouteRegistry';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Flight from '@civ-clone/base-science-advance-flight/Flight';
import { Gold } from '@civ-clone/library-city/Yields';
import Player from '@civ-clone/core-player/Player';
import Railroad from '@civ-clone/base-science-advance-railroad/Railroad';
import Research from '@civ-clone/core-science/Yields/Research';
import TradeRoute from '@civ-clone/core-city/TradeRoute';
import TradeRouteEstablished from '@civ-clone/base-unit-action-establish-trade-route/Rules/TradeRouteEstablished';
import Unit from '@civ-clone/core-unit/Unit';
import baseTrade from '../../lib/baseTrade';
import civ1Distance from '@civ-clone/civ1-world/lib/civ1Distance';

// What the goods are said to be, picked by the unit (v474.05 picks by unit slot & 7).
export const goods = [
  'Silk',
  'Silver',
  'Wine',
  'Copper',
  'Gems',
  'Dye',
  'Salt',
  'Spice',
];

export const goodsFor = (unit: Unit): string =>
  goods[
    unit
      .id()
      .split('')
      .reduce((total, character) => total + character.charCodeAt(0), 0) %
      goods.length
  ];

// The number of routes a city holds (v474.05 `City.TradeCityIDs[3]`).
export const routesPerCity = 3;

export const getRules: (
  tradeRouteRegistry?: TradeRouteRegistry,
  playerTreasuryRegistry?: PlayerTreasuryRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  landMassRegistry?: LandMassRegistry,
  engine?: Engine
) => TradeRouteEstablished[] = (
  tradeRouteRegistry: TradeRouteRegistry = tradeRouteRegistryInstance,
  playerTreasuryRegistry: PlayerTreasuryRegistry = playerTreasuryRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  landMassRegistry: LandMassRegistry = landMassRegistryInstance,
  engine: Engine = engineInstance
): TradeRouteEstablished[] => {
  // A route's worth when choosing which slot to fill: the partner's base trade, doubled if it's foreign.
  const worth = (player: Player, city: City): number =>
    baseTrade(city) * (city.player() === player ? 1 : 2);

  return [
    // The goods sell for a one-off sum, added to the owner's gold and research (v474.05 `Actions.cs`
    //  `F0_2459_0948_CaravanArrivesAtDestinationCity`; Rome on 640K a Day, p230). All the maths is integer.
    new TradeRouteEstablished(
      'civ1-unit:unit/trade-route-established/bonus',
      new Effect((unit: Unit, city: City): void => {
        const home = unit.city()!,
          player = unit.player(),
          destinationResearch = playerResearchRegistry.getByPlayer(
            city.player()
          );

        let bonus = Math.floor(
          ((civ1Distance(home.tile(), city.tile()) + 10) *
            (baseTrade(city) + baseTrade(home))) /
            24
        );

        if (
          landMassRegistry.getByTile(home.tile()) ===
          landMassRegistry.getByTile(city.tile())
        ) {
          bonus = Math.floor(bonus / 2);
        }

        if (city.player() === player) {
          bonus = Math.floor(bonus / 2);
        }

        [Railroad, Flight].forEach((Advance): void => {
          if (destinationResearch.completed(Advance)) {
            bonus -= Math.floor(bonus / 3);
          }
        });

        playerTreasuryRegistry.getByPlayerAndType(player, Gold).add(bonus);
        playerResearchRegistry
          .getByPlayer(player)
          .add(new Research(bonus, 'TradeRoute'));

        engine.emit(
          'unit:trade-route-established',
          player,
          home,
          city,
          goodsFor(unit),
          bonus
        );
      })
    ),

    // The home city keeps its best three routes. A route to a city it already trades with stays where it is; otherwise
    //  an empty slot is filled, or the least valuable route is replaced if the new one is worth more (the first wins a
    //  tie). If none is worth less, the route isn't kept, but the goods were still sold. v474.05 skips a slot holding the
    //  same city, which can leave it with two routes to one city; we don't copy that (Dom, 2026-09-30).
    new TradeRouteEstablished(
      'civ1-unit:unit/trade-route-established/route',
      new Effect((unit: Unit, city: City): void => {
        const home = unit.city()!,
          player = unit.player(),
          routes = tradeRouteRegistry.getByCity(home);

        if (routes.some((route: TradeRoute): boolean => route.to() === city)) {
          return;
        }

        if (routes.length < routesPerCity) {
          tradeRouteRegistry.register(new TradeRoute(home, city));

          return;
        }

        const newWorth = worth(player, city),
          [lowest, lowestWorth] = routes
            .map((route: TradeRoute): [TradeRoute, number] => [
              route,
              worth(player, route.to()),
            ])
            .reduce((lowest, candidate) =>
              candidate[1] < lowest[1] ? candidate : lowest
            );

        if (lowestWorth < newWorth) {
          lowest.setTo(city);
          tradeRouteRegistry.reindex(lowest);
        }
      })
    ),
  ];
};

export default getRules;
