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
import Action from '@civ-clone/core-unit/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
import Moved from '@civ-clone/core-unit/Rules/Moved';
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
  // No longer used: aircraft fuel is checked at the end of the turn (`Rules/Player/turnEnd`). Kept so the positional
  // arguments after them still line up for existing callers.
  cityRegistry: CityRegistry = cityRegistryInstance,
  turn: Turn = turnInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance
): Moved[] => [
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
    new Criterion((unit: Unit): boolean => (unit as NavalTransport).hasCargo()),
    new Effect((unit: Unit, action: Action): void =>
      (unit as NavalTransport)
        .cargo()
        .forEach((unit: Unit): void => unit.action(action.forUnit(unit)))
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
    // An aircraft takes off from a Carrier with a plain `Move`, so it keeps its moves (`Disembark` would end its turn).
    // Once it has left the Carrier's tile it is no longer aboard. A Move that takes it along with the Carrier
    // (`moved/move-cargo`) leaves it on the Carrier's tile, so doesn't unload it.
    'civ1-unit:unit/moved/take-off',
    new Criterion((unit: Unit): boolean => unit instanceof Air),
    new Criterion(
      (unit: Unit, action: Action): boolean => action instanceof Move
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

export default getRules;
