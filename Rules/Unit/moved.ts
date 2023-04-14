import { Bomber, Fighter, Nuclear, Trireme } from '../../Units';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import { Disembark, Move, SneakAttack, SneakCaptureCity } from '../../Actions';
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
import And from '@civ-clone/core-rule/Criteria/And';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Or from '@civ-clone/core-rule/Criteria/Or';
import { NavalTransport } from '../../Types';
import Unit from '@civ-clone/core-unit/Unit';
import { Peace } from '@civ-clone/library-diplomacy/Declarations';

const unitMoveStore: Map<Unit, number> = new Map();

export const getRules = (
  transportRegistry: TransportRegistry = transportRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  randomNumberGenerator: () => number = (): number => Math.random(),
  engine: Engine = engineInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  turn: Turn = turnInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance
): Moved[] => [
  new Moved(
    new Effect((unit: Unit, action: Action): void => {
      engine.emit('unit:moved', unit, action);
    })
  ),
  new Moved(new Effect((unit: Unit): void => unit.applyVisibility())),
  new Moved(
    new Criterion((unit: Unit): boolean => unit.moves().value() < 0.3),
    new Effect((unit: Unit): void => {
      unit.moves().set(0);
      unit.setActive(false);
    })
  ),
  new Moved(
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
    new Criterion((unit: Unit): boolean => unit instanceof Trireme),
    new Criterion((unit: Unit): boolean => unit.moves().value() === 0),
    new Criterion((unit: Unit): boolean => !unit.tile().isCoast()),
    new Criterion((): boolean => randomNumberGenerator() <= 0.5),
    new Effect((unit: Unit): void => {
      ruleRegistry.process(LostAtSea, unit as unknown as ITransport);
    })
  ),

  ...(
    [
      [Bomber, 1],
      [Fighter, 0],
      [Nuclear, 0],
    ] as [typeof Unit, number][]
  ).flatMap(([UnitType, numberOfTurns]) => [
    new Moved(
      new High(),
      new Criterion((unit: Unit): boolean => unit instanceof UnitType),
      new Criterion((unit: Unit): boolean => unit.moves().value() === 0),
      new Criterion((unit: Unit): boolean => !unitMoveStore.has(unit)),
      new Effect((unit: Unit): void => {
        unitMoveStore.set(unit, turn.value());
      })
    ),
    new Moved(
      new Criterion((unit: Unit): boolean => unit instanceof UnitType),
      new Criterion((unit: Unit): boolean => unit.moves().value() === 0),
      new Or(
        // If the `Unit` is in a `City`....
        new Criterion(
          (unit: Unit): boolean => cityRegistry.getByTile(unit.tile()) !== null
        ),
        // ...or is being `Transport`ed.
        new Criterion(
          (unit: Unit): boolean => !!transportRegistry.getByUnit(unit)
        )
      ),
      new Effect((unit: Unit): void => {
        unitMoveStore.delete(unit);
      })
    ),
    new Moved(
      new Criterion((unit: Unit): boolean => unit instanceof UnitType),
      new Criterion((unit: Unit): boolean => unit.moves().value() === 0),
      new And(
        // If the `Unit` is not in a `City`....
        new Criterion(
          (unit: Unit): boolean => cityRegistry.getByTile(unit.tile()) === null
        ),
        // ...and isn't being `Transport`ed.
        new Criterion(
          (unit: Unit): boolean => !transportRegistry.getByUnit(unit)
        )
      ),
      new Criterion(
        (unit: Unit) =>
          (unitMoveStore.get(unit) ?? turn.value()) + numberOfTurns <=
          turn.value()
      ),
      new Effect((unit: Unit): void => {
        // TODO: New `Rule` here
        ruleRegistry.process(LostAtSea, unit as unknown as ITransport);
      })
    ),
  ]),

  new Moved(
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
