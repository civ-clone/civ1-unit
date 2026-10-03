import { Bomber, Trireme } from '../../Units';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Attack,
  Disembark,
  Move,
  SneakAttack,
  SneakCaptureCity,
} from '../../Actions';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Action from '@civ-clone/core-unit/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Sleeping from '@civ-clone/base-unit-action-sleep/Rules/Sleeping';
import Tile from '@civ-clone/core-world/Tile';
import { Air, NavalTransport } from '../../Types';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import Unit from '@civ-clone/core-unit/Unit';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';
import { instance as rngInstance } from '@civ-clone/core-random';

export const getRules = (
  transportRegistry: TransportRegistry = transportRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  randomNumberGenerator: () => number = rngInstance,
  engine: Engine = engineInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  // No longer used: aircraft fuel is checked at the end of the turn (`Rules/Player/turnEnd`). Kept so the positional
  // arguments after it still line up for existing callers.
  turn: Turn = turnInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): Moved[] => {
  // Stows each of `units` aboard `transport`, as `Embark` and `LandAircraft` do, until it is full.
  const collect = (transport: NavalTransport, units: Unit[]): void =>
      units.forEach((unit: Unit): void => {
        if (!transport.hasCapacity() || !transport.canStow(unit)) {
          return;
        }

        transport.stow(unit, unit.tile());

        unit.setBusy(new Stowed());
      }),
    // The transport's own units on the tile it has just moved onto, that aren't already aboard something.
    unitsToCollect = (transport: Unit, tile: Tile = transport.tile()): Unit[] =>
      unitRegistry
        .getByTile(tile)
        .filter(
          (unit: Unit): boolean =>
            unit !== transport &&
            unit.player() === transport.player() &&
            !transportRegistry.hasUnit(unit)
        ),
    // A transport's own move that took it onto a new tile (not one it was carried along on, and not an attack).
    transportMoved = [
      new Criterion((unit: Unit): boolean => unit instanceof NavalTransport),
      new Criterion(
        (unit: Unit, action: Action): boolean => action instanceof Move
      ),
      new Criterion(
        (unit: Unit, action: Action): boolean => action.to() === unit.tile()
      ),
    ],
    isOwnCity = (unit: Unit): boolean =>
      cityRegistry.getByTile(unit.tile())?.player() === unit.player();

  return [
    new Moved(
      'civ1-unit:unit/moved/emit',
      new Effect((unit: Unit, action: Action): void => {
        engine.emit('unit:moved', unit, action);
      })
    ),
    new Moved(
      'civ1-unit:unit/moved/apply-visibility',
      new Effect((unit: Unit): void => unit.applyVisibility())
    ),
    new Moved(
      'civ1-unit:unit/moved/end-moves-when-exhausted',
      new Criterion((unit: Unit): boolean => unit.moves().value() < 0.3),
      new Effect((unit: Unit): void => {
        unit.moves().set(0);
        unit.setActive(false);
      })
    ),
    new Moved(
      'civ1-unit:unit/moved/move-cargo',
      new Criterion((unit: Unit): boolean => unit instanceof NavalTransport),
      new Criterion(
        (unit: Unit, action: Action): boolean => action instanceof Move
      ),
      new Criterion((unit: Unit): boolean =>
        (unit as NavalTransport).hasCargo()
      ),
      new Effect((unit: Unit, action: Action): void =>
        (unit as NavalTransport)
          .cargo()
          .forEach((unit: Unit): void => unit.action(action.forUnit(unit)))
      )
    ),
    // These two come after `move-cargo`, so a unit collected here isn't also sent along the move just made.
    new Moved(
      // A Carrier that moves onto its player's aircraft picks them up. Aircraft in a city have landed, so they're only
      // collected there if they are sleeping (`moved/collect-sleeping`).
      'civ1-unit:unit/moved/collect-aircraft',
      ...transportMoved,
      new Criterion((unit: Unit): boolean => !isOwnCity(unit)),
      new Effect((unit: Unit): void =>
        collect(
          unit as NavalTransport,
          unitsToCollect(unit).filter(
            (tileUnit: Unit): boolean => tileUnit instanceof Air
          )
        )
      )
    ),
    new Moved(
      // A transport that moves into one of its player's cities picks up the units sleeping there, as in Civ1.
      'civ1-unit:unit/moved/collect-sleeping',
      ...transportMoved,
      new Criterion((unit: Unit): boolean => isOwnCity(unit)),
      new Effect((unit: Unit): void =>
        collect(
          unit as NavalTransport,
          unitsToCollect(unit).filter(
            (tileUnit: Unit): boolean => tileUnit.busy() instanceof Sleeping
          )
        )
      )
    ),
    new Moved(
      'civ1-unit:unit/moved/disembark',
      new Criterion(
        (unit: Unit, action: Action): boolean => action instanceof Disembark
      ),
      new Effect((unit: Unit): void => {
        const manifest = transportRegistry.getByUnit(unit);

        manifest.transport().unload(unit);

        transportRegistry.unregister(manifest);
      })
    ),
    new Moved(
      // A unit can leave its transport with a plain `Move`, keeping its moves (`Disembark` would end its turn): an
      // aircraft taking off from a Carrier, or a unit walking off a ship in a city. Once it has left the transport's tile
      // it is no longer aboard. A Move that takes it along with the transport (`moved/move-cargo`) leaves it on the
      // transport's tile, so doesn't unload it.
      'civ1-unit:unit/moved/take-off',
      new Criterion(
        (unit: Unit, action: Action): boolean => action instanceof Move
      ),
      // A `Disembark` is a `Move` too, and `moved/disembark` unloads it. Every rule's criteria are checked before any
      // effect runs, so without this the unit would still look aboard here.
      new Criterion(
        (unit: Unit, action: Action): boolean => !(action instanceof Disembark)
      ),
      new Criterion((unit: Unit): boolean => transportRegistry.hasUnit(unit)),
      new Criterion(
        (unit: Unit): boolean =>
          transportRegistry.getByUnit(unit).transport().tile() !== unit.tile()
      ),
      new Effect((unit: Unit): void => {
        transportRegistry.getByUnit(unit).transport().unload(unit);

        if (unit.busy() instanceof Stowed) {
          unit.setBusy();
        }
      })
    ),
    new Moved(
      'civ1-unit:unit/moved/trireme-lost-at-sea',
      new Criterion((unit: Unit): boolean => unit instanceof Trireme),
      new Criterion((unit: Unit): boolean => unit.moves().value() === 0),
      new Criterion((unit: Unit): boolean => !unit.tile().isCoast()),
      new Criterion((): boolean => randomNumberGenerator() <= 0.5),
      new Effect((unit: Unit): void => {
        ruleRegistry.process(LostAtSea, unit as unknown as ITransport);
      })
    ),

    new Moved(
      // A `Bomber` drops its whole payload in one attack, so it can't attack again until next turn.
      'civ1-unit:unit/moved/bomber/end-turn-after-attack',
      new High(),
      new Criterion((unit: Unit): boolean => unit instanceof Bomber),
      new Criterion(
        (unit: Unit, action: Action): boolean =>
          action instanceof Attack || action instanceof SneakAttack
      ),
      new Effect((unit: Unit): void => {
        unit.moves().set(0);
        unit.setActive(false);
      })
    ),

    new Moved(
      'civ1-unit:unit/moved/break-peace-treaty',
      new Criterion(
        (unit: Unit, action: Action) =>
          action instanceof SneakAttack || action instanceof SneakCaptureCity
      ),
      new Effect((unit: Unit, action: Action) => {
        const peaceTreaties = interactionRegistry
          .getByPlayers(
            unit.player(),
            (action as SneakAttack | SneakCaptureCity).enemy()
          )
          .filter(
            (interaction): interaction is Peace =>
              interaction instanceof Peace && interaction.active()
          );

        peaceTreaties.forEach((peaceTreaty) => peaceTreaty.expire());
      })
    ),
  ];
};

export default getRules;
