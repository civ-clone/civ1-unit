import {
  AdvancedFlight,
  Alphabet,
  Astronomy,
  AtomicTheory,
  Automobile,
  Banking,
  BridgeBuilding,
  BronzeWorking,
  CeremonialBurial,
  Chemistry,
  Chivalry,
  CodeOfLaws,
  Combustion,
  Communism,
  Computers,
  Conscription,
  Construction,
  Corporation,
  Currency,
  Democracy,
  Electricity,
  Electronics,
  Engineering,
  Explosives,
  Feudalism,
  Flight,
  FusionPower,
  GeneticEngineering,
  Gunpowder,
  HorsebackRiding,
  Industrialization,
  Invention,
  IronWorking,
  LaborUnion,
  Literacy,
  Magnetism,
  MapMaking,
  Masonry,
  MassProduction,
  Mathematics,
  Medicine,
  Metallurgy,
  Monarchy,
  Mysticism,
  Navigation,
  NuclearFission,
  NuclearPower,
  Philosophy,
  Physics,
  Plastics,
  Pottery,
  Railroad,
  Recycling,
  Refining,
  Religion,
  Robotics,
  Rocketry,
  SpaceFlight,
  SteamEngine,
  Steel,
  Superconductor,
  TheRepublic,
  TheWheel,
  TheoryOfGravity,
  Trade,
  University,
  Writing,
} from '@civ-clone/library-science/Advances';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import stealAdvance, {
  firstStealableAdvance as baseFirstStealableAdvance,
  stealableAdvances,
} from '@civ-clone/base-unit-action-steal-technology/lib/stealAdvance';
import Advance from '@civ-clone/core-science/Advance';
import Player from '@civ-clone/core-player/Player';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

// Moved to base-unit-action-steal-technology's `lib/stealAdvance`; still exported here for what imports them from here
//  (`civ1-unit`'s `unit/technology-stolen/steal` and `civ1-enhanced`'s).
export { stealableAdvances, stealAdvance };
export type { StealAdvanceDependencies } from '@civ-clone/base-unit-action-steal-technology/lib/stealAdvance';

/**
 * v474.05's 72 advances (civd `GAME.C` `advances[72]`), in its order, by their index there. Slots 67 to 70 (named
 * "1" to "4") are never known, nor is 71, Future Technology (`has_tech()` is 0 for it), so they hold `null`.
 */
export const civ1Advances: (typeof Advance | null)[] = [
  Alphabet,
  CodeOfLaws,
  Currency,
  AtomicTheory,
  Democracy,
  Monarchy,
  Astronomy,
  MapMaking,
  Navigation,
  Mathematics,
  Medicine,
  Physics,
  Engineering,
  University,
  Magnetism,
  Electronics,
  Masonry,
  BronzeWorking,
  IronWorking,
  BridgeBuilding,
  Invention,
  Computers,
  Writing,
  SteamEngine,
  Trade,
  CeremonialBurial,
  Mysticism,
  NuclearFission,
  Philosophy,
  Religion,
  Literacy,
  HorsebackRiding,
  Feudalism,
  TheWheel,
  Gunpowder,
  Industrialization,
  Chemistry,
  Combustion,
  Flight,
  AdvancedFlight,
  SpaceFlight,
  MassProduction,
  Pottery,
  Communism,
  TheRepublic,
  Construction,
  Rocketry,
  Corporation,
  Metallurgy,
  Railroad,
  NuclearPower,
  TheoryOfGravity,
  Steel,
  Banking,
  Electricity,
  Refining,
  Explosives,
  Superconductor,
  Automobile,
  GeneticEngineering,
  Plastics,
  Recycling,
  Chivalry,
  Robotics,
  Conscription,
  LaborUnion,
  FusionPower,
  null,
  null,
  null,
  null,
  null,
];

/**
 * The advance a Diplomat of `thief`'s takes from `victim`, as v474.05 picks it (civd `DIPLOMAT.C`, the Steal Technology
 * case):
 *
 *     rand_tech = rand_scaled(72);
 *     for (i = 0; i < 72; i++) {
 *         tech = (rand_tech + i) % 72;
 *         if (player == 0)
 *             continue;
 *         if (!has_tech(target_civ, tech))
 *             continue;
 *         if (has_tech(player, tech))
 *             continue;
 *         give_advance(player, tech, target_civ);
 *
 * and `has_tech()` (civd `ECONOMY.C`) knows nothing of the Barbarians, civilization 0:
 *
 *     if (adv >= 71)
 *         return 0;
 *     if (civ == 0)
 *         return 0;
 *
 * One draw, always, then the first advance from a random place in `civ1Advances` that `victim` knows and `thief`
 * doesn't, so an advance after a run `thief` knows is likelier. Nothing is taken by the Barbarians (`player == 0`), nor
 * from them (`has_tech(target_civ, …)` is 0 for every slot), though the draw is still made. `null` if there is nothing
 * to take.
 */
export const firstStealableAdvance = (
  thief: Player,
  victim: Player,
  randomNumberGenerator: () => number,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): typeof Advance | null =>
  // The walk is base-unit-action-steal-technology's, over `civ1Advances`; the Barbarians are refused after the draw.
  baseFirstStealableAdvance(
    thief,
    victim,
    civ1Advances,
    randomNumberGenerator,
    {
      playerResearchRegistry,
      refuses: (thief: Player, victim: Player): boolean =>
        isBarbarian(thief) || isBarbarian(victim),
    }
  );

export default stealAdvance;
