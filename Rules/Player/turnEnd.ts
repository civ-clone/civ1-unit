import { Bomber, Fighter, Nuclear } from '../../Units';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import StrategyNote, {
  generateKey,
} from '@civ-clone/core-strategy/StrategyNote';
import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
import Player from '@civ-clone/core-player/Player';
import TurnEnd from '@civ-clone/core-player/Rules/TurnEnd';
import Unit from '@civ-clone/core-unit/Unit';

// How many turns each aircraft can end away from a `City` or `Carrier`, including the one it took off in. A `Bomber`
// can stay out for one turn, but must land by the end of the second.
export const aircraftRange: [typeof Unit, number][] = [
  [Bomber, 2],
  [Fighter, 1],
  [Nuclear, 1],
];

export const turnsAloftKey = (unit: Unit): string =>
  generateKey('civ1-unit:aircraft/turns-aloft', unit);

export const getRules = (
  unitRegistry: UnitRegistry = unitRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance,
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): TurnEnd[] => [
  new TurnEnd(
    'civ1-unit:player/turn-end/aircraft/fuel',
    new Effect((player: Player): void =>
      unitRegistry.getByPlayer(player).forEach((unit: Unit): void => {
        const [, range] =
          aircraftRange.find(([UnitType]) => unit instanceof UnitType) ?? [];

        if (range === undefined || unit.destroyed()) {
          return;
        }

        // Kept as a `StrategyNote` so the count survives a save.
        const key = turnsAloftKey(unit),
          note = strategyNoteRegistry.getByKey<number>(key),
          landed =
            cityRegistry.getByTile(unit.tile())?.player() === unit.player() ||
            transportRegistry.hasUnit(unit);

        if (landed) {
          if (note) {
            strategyNoteRegistry.unregister(note);
          }

          return;
        }

        const turnsAloft = (note?.value() ?? 0) + 1;

        if (turnsAloft < range) {
          strategyNoteRegistry.replace(new StrategyNote(key, turnsAloft));

          return;
        }

        if (note) {
          strategyNoteRegistry.unregister(note);
        }

        // TODO: New `Rule` here
        ruleRegistry.process(LostAtSea, unit as unknown as ITransport);
      })
    )
  ),
];

export default getRules;
