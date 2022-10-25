import { Disembark, Move } from '../../Actions';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import Action from '@civ-clone/core-unit/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import LostAtSea from '@civ-clone/core-unit-transport/Rules/LostAtSea';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Unit from '@civ-clone/core-unit/Unit';
import { NavalTransport } from '../../Types';
import { Fighter, Trireme } from '../../Units';
import CityRegistry, {
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';

export const getRules: (
  transportRegistry?: TransportRegistry,
  ruleRegistry?: RuleRegistry,
  randomNumberGenerator?: () => number,
  engine?: Engine,
  cityRegistry?: CityRegistry
) => Moved[] = (
  transportRegistry: TransportRegistry = transportRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  randomNumberGenerator: () => number = (): number => Math.random(),
  engine: Engine = engineInstance,
  cityRegistry: CityRegistry = cityRegistryInstance
): Moved[] => [
  new Moved(
    new Effect((unit: Unit, action: Action): void => {
      engine.emit('unit:moved', unit, action);
    })
  ),
  new Moved(new Effect((unit: Unit): void => unit.applyVisibility())),
  new Moved(
    new Criterion((unit: Unit): boolean => unit.moves().value() <= 0.1),
    new Effect((unit: Unit): void => unit.moves().set(0))
  ),
  new Moved(
    new Criterion((unit: Unit): boolean => unit.moves().value() < 0.1),
    new Effect((unit: Unit): void => unit.setActive(false))
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
  new Moved(
    new Criterion((unit: Unit): boolean => unit instanceof Fighter),
    new Criterion((unit: Unit): boolean => unit.moves().value() === 0),
    new Criterion(
      (unit: Unit): boolean => cityRegistry.getByTile(unit.tile()) !== null
    ),
    new Effect((unit: Unit): void => {
      ruleRegistry.process(LostAtSea, unit as unknown as ITransport);
    })
  ),
];

export default getRules;
