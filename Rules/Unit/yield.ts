import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  Artillery,
  Battleship,
  Bomber,
  Cannon,
  Caravan,
  Carrier,
  Catapult,
  Chariot,
  Cruiser,
  Diplomat,
  Fighter,
  Frigate,
  Horseman,
  Ironclad,
  Knight,
  MechanizedInfantry,
  Musketman,
  Nuclear,
  Rifleman,
  Sail,
  Settlers,
  Spearman,
  Submarine,
  Swordman,
  Tank,
  Transport,
  Trireme,
  Warrior,
} from '../../Units';
import { Capacity, CargoWeight } from '@civ-clone/core-unit-transport/Yields';
import {
  Fortified as FortifiedUnitImprovement,
  Veteran as VeteranUnitImprovement,
} from '../../UnitImprovements';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import {
  Yield as UnitYield,
  unitYield,
} from '@civ-clone/core-unit/Rules/Yield';
import { BaseYield } from '@civ-clone/core-unit/Rules/Yield';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import Yield from '@civ-clone/core-yield/Yield';

export const getRules = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  transportRegistry: TransportRegistry = transportRegistryInstance
): (UnitYield | BaseYield)[] => [
  ...(
    [
      [Artillery, 12, 2, 2],
      [Battleship, 18, 12, 4, 2],
      [Bomber, 12, 1, 8, 2],
      [Cannon, 8],
      [Caravan, 0],
      [Carrier, 1, 12, 5, 2],
      [Catapult, 6],
      [Chariot, 4, 1, 2],
      [Cruiser, 6, 6, 6, 2],
      [Diplomat, 0, 0, 2],
      [Fighter, 4, 2, 10, 2],
      [Frigate, 2, 2, 3],
      [Horseman, 2, 1, 2],
      [Ironclad, 4, 4, 4],
      [Knight, 4, 2, 2],
      [MechanizedInfantry, 6, 6, 3],
      [Musketman, 3, 2],
      [Nuclear, 99, 0, 16],
      [Rifleman, 3, 5],
      [Sail, 1, 1, 3],
      [Settlers, 0],
      [Spearman, 1, 2],
      [Submarine, 8, 2, 3, 2],
      [Swordman, 3],
      [Tank, 10, 5, 3],
      [Transport, 0, 3, 4],
      [Trireme, 1, 0, 3],
      [Warrior],
    ] as [typeof Unit, number, number?, number?, number?][]
  ).flatMap(
    ([UnitType, attack = 1, defence = 1, movement = 1, visibility = 1]: [
      typeof Unit,
      number,
      number?,
      number?,
      number?
    ]): (UnitYield | BaseYield)[] =>
      unitYield(UnitType, attack, defence, movement, visibility)
  ),

  ...(
    [
      [FortifiedUnitImprovement, 1, Defence],
      [VeteranUnitImprovement, 0.5, Attack, Defence],
    ] as [typeof UnitImprovement, number, ...typeof Yield[]][]
  ).flatMap(
    ([UnitImprovementType, yieldModifier, ...YieldTypes]: [
      typeof UnitImprovement,
      number,
      ...typeof Yield[]
    ]): (UnitYield | BaseYield)[] =>
      YieldTypes.map(
        (YieldType: typeof Yield): UnitYield =>
          new UnitYield(
            new Criterion(
              (unit: Unit, unitYield: Yield): boolean =>
                unitYield instanceof YieldType
            ),
            new Criterion((unit: Unit): boolean =>
              unitImprovementRegistry
                .getByUnit(unit)
                .some(
                  (unitImprovement: UnitImprovement): boolean =>
                    unitImprovement instanceof UnitImprovementType
                )
            ),
            new Effect((unit: Unit, unitYield: Yield): void => {
              const baseYield = new YieldType();

              ruleRegistry.process(
                BaseYield,
                <typeof Unit>unit.constructor,
                baseYield
              );

              unitYield.add(
                baseYield.value() * yieldModifier,
                UnitImprovementType.name
              );
            })
          )
      )
  ),

  ...(
    [
      [Trireme, 2],
      [Sail, 3],
      [Frigate, 4],
      [Transport, 8],
      [Carrier, 8],
    ] as [typeof Unit, number][]
  ).flatMap(([UnitType, capacity]) => [
    new UnitYield(
      new Criterion(
        (unit: Unit, unitYield: Yield): unitYield is Capacity =>
          unitYield instanceof Capacity
      ),
      new Criterion((unit: Unit): boolean => unit instanceof UnitType),
      new Effect((unit: Unit, unitYield: Yield): void =>
        unitYield.set(capacity)
      )
    ),
    new UnitYield(
      new Criterion(
        (unit: Unit, unitYield: Yield): unitYield is CargoWeight =>
          unitYield instanceof CargoWeight
      ),
      new Effect((unit: Unit | ITransport, unitYield: Yield): void =>
        unitYield.set(
          transportRegistry.getByTransport(unit as ITransport).length
        )
      )
    ),
  ]),
];

export default getRules;
