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
  MechanizedInfanty,
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
import {
  Fortified as FortifiedUnitImprovement,
  Veteran as VeteranUnitImprovement,
} from '../../UnitImprovements';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import {
  Yield as UnitYield,
  unitYield,
} from '@civ-clone/core-unit/Rules/Yield';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovement from '@civ-clone/core-unit-improvement/UnitImprovement';
import Yield from '@civ-clone/core-yield/Yield';
import {
  BaseYield,
  IBaseYieldRegistry,
} from '@civ-clone/core-unit/Rules/Yield';

export const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  ruleRegistry?: RuleRegistry
) => (UnitYield | BaseYield)[] = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
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
      [MechanizedInfanty, 6, 6, 3],
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

              (ruleRegistry as IBaseYieldRegistry).process(
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
];

export default getRules;
