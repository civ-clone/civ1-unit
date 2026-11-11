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
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceStolen from '@civ-clone/base-unit-action-steal-technology/AdvanceStolen';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/** The advances `victim` knows and `thief` doesn't, other than repeatable ones: what a Diplomat could steal. */
export const stealableAdvances = (
  thief: Player,
  victim: Player,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): (typeof Advance)[] => {
  // Either without research (as a test may make them) has nothing to steal, rather than making the lookup throw.
  try {
    const thiefResearch = playerResearchRegistry.getByPlayer(thief);

    return playerResearchRegistry
      .getByPlayer(victim)
      .complete()
      .map((advance: Advance): typeof Advance => advance.sourceClass())
      .filter(
        (AdvanceType: typeof Advance): boolean =>
          !AdvanceType.repeatable && !thiefResearch.completed(AdvanceType)
      );
  } catch (e) {
    return [];
  }
};

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
): typeof Advance | null => {
  const start = Math.floor(randomNumberGenerator() * civ1Advances.length);

  if (isBarbarian(thief) || isBarbarian(victim)) {
    return null;
  }

  // The walk: v474.05's 72 slots first, then any advance it doesn't have (another package's) that `thief` could take,
  //  in the order `victim` learnt them. The start is drawn over the 72 slots only, as v474.05 draws it, not over the
  //  whole list: with no such advance the walk is exactly v474.05's, and with some they are only reached by a walk
  //  that passes slot 71 before finding anything.
  const stealable = stealableAdvances(thief, victim, playerResearchRegistry),
    order = [
      ...civ1Advances,
      ...stealable.filter(
        (AdvanceType: typeof Advance): boolean =>
          !civ1Advances.includes(AdvanceType)
      ),
    ];

  for (let i = 0; i < order.length; i++) {
    const AdvanceType = order[(start + i) % order.length];

    if (AdvanceType !== null && stealable.includes(AdvanceType)) {
      return AdvanceType;
    }
  }

  return null;
};

/** What the registries a theft changes are. */
export interface StealAdvanceDependencies {
  engine?: Engine;
  interactionRegistry?: InteractionRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  ruleRegistry?: RuleRegistry;
  turn?: Turn;
}

/**
 * `thief` takes `AdvanceType` from `victim`'s `city`: it learns the advance, the city is marked as robbed (an
 * `AdvanceStolen`, which any change of owner clears) and `player:advance-stolen` is emitted. Shared by `civ1-unit`'s
 * `unit/technology-stolen/steal` and `civ1-enhanced`'s, which only choose the advance differently.
 */
export const stealAdvance = (
  thief: Player,
  victim: Player,
  city: City,
  AdvanceType: typeof Advance,
  {
    engine = engineInstance,
    interactionRegistry = interactionRegistryInstance,
    playerResearchRegistry = playerResearchRegistryInstance,
    ruleRegistry = ruleRegistryInstance,
    turn = turnInstance,
  }: StealAdvanceDependencies = {}
): void => {
  playerResearchRegistry.getByPlayer(thief).addAdvance(AdvanceType);

  interactionRegistry.register(
    new AdvanceStolen(thief, victim, city, ruleRegistry, turn) as never
  );

  engine.emit('player:advance-stolen', thief, victim, AdvanceType, city);
};

export default stealAdvance;
