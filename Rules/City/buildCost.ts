import {
  BuildCost,
  buildCost,
} from '@civ-clone/core-city-build/Rules/BuildCost';
import {
  Catapult,
  Chariot,
  Horseman,
  Knight,
  Musketman,
  Sail,
  Settlers,
  Spearman,
  Swordman,
  Trireme,
  Warrior,
} from '../../Units';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: () => BuildCost[] = (): BuildCost[] => [
  ...([
    [Catapult, 40],
    [Chariot, 40],
    [Horseman, 20],
    [Knight, 40],
    [Musketman, 30],
    [Sail, 40],
    [Settlers, 40],
    [Spearman, 20],
    [Swordman, 20],
    [Trireme, 40],
    [Warrior, 10],
  ] as [
    IConstructor<Unit>,
    number
  ][]).flatMap(([UnitType, cost]: [IConstructor<Unit>, number]): BuildCost[] =>
    buildCost(UnitType, cost)
  ),
];

export default getRules;
