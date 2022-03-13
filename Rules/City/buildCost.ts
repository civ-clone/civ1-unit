import {
  BuildCost,
  buildCost,
} from '@civ-clone/core-city-build/Rules/BuildCost';
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
import Unit from '@civ-clone/core-unit/Unit';
import Buildable from '@civ-clone/core-city-build/Buildable';

export const getRules: () => BuildCost[] = (): BuildCost[] => [
  ...(
    [
      [Artillery, 80],
      [Battleship, 160],
      [Bomber, 120],
      [Cannon, 40],
      [Caravan, 50],
      [Carrier, 160],
      [Catapult, 40],
      [Chariot, 40],
      [Cruiser, 80],
      [Diplomat, 30],
      [Fighter, 60],
      [Frigate, 40],
      [Horseman, 20],
      [Ironclad, 50],
      [Knight, 40],
      [MechanizedInfantry, 50],
      [Musketman, 30],
      [Nuclear, 160],
      [Rifleman, 30],
      [Sail, 40],
      [Settlers, 40],
      [Spearman, 20],
      [Submarine, 50],
      [Swordman, 20],
      [Tank, 80],
      [Transport, 50],
      [Trireme, 40],
      [Warrior, 10],
    ] as [typeof Unit, number][]
  ).flatMap(([UnitType, cost]: [typeof Unit, number]): BuildCost[] =>
    // Why does TS hate this inheritance so much, is this an anti-pattern?
    buildCost(UnitType as unknown as typeof Buildable, cost)
  ),
];

export default getRules;
