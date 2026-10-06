import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
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
  PlayerTreasuryRegistry,
  instance as playerTreasuryRegistryInstance,
} from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
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
import BribeUnit from '@civ-clone/base-unit-action-bribe-unit/BribeUnit';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityInvestigated from '@civ-clone/base-unit-action-investigate-city/Rules/CityInvestigated';
import CitySabotaged from '@civ-clone/base-unit-action-industrial-sabotage/Rules/CitySabotaged';
import Effect from '@civ-clone/core-rule/Effect';
import Embassy from '@civ-clone/base-unit-action-establish-embassy/Embassy';
import EmbassyEstablished from '@civ-clone/base-unit-action-establish-embassy/Rules/EmbassyEstablished';
import { Gold } from '@civ-clone/library-city/Yields';
import InciteRevolt from '@civ-clone/base-unit-action-incite-revolt/InciteRevolt';
import KingMet from '@civ-clone/base-unit-action-meet-with-king/Rules/KingMet';
import { Palace } from '@civ-clone/library-city/CityImprovements';
import Player from '@civ-clone/core-player/Player';
import RevoltIncited from '@civ-clone/base-unit-action-incite-revolt/Rules/RevoltIncited';
import SubvertCity from '@civ-clone/base-unit-action-incite-revolt/SubvertCity';
import TechnologyStolen from '@civ-clone/base-unit-action-steal-technology/Rules/TechnologyStolen';
import Unit from '@civ-clone/core-unit/Unit';
import UnitBribed from '@civ-clone/base-unit-action-bribe-unit/Rules/UnitBribed';
import Wonder from '@civ-clone/core-wonder/Wonder';
import civ1Distance from '@civ-clone/civ1-world/lib/civ1Distance';
import { instance as rngInstance } from '@civ-clone/core-random';

/** The advances `victim` knows and `thief` doesn't: what a Diplomat could steal. */
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
          !thiefResearch.completed(AdvanceType)
      );
  } catch (e) {
    return [];
  }
};

export const getRules = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  playerTreasuryRegistry: PlayerTreasuryRegistry = playerTreasuryRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  turn: Turn = turnInstance,
  engine: Engine = engineInstance,
  randomNumberGenerator: () => number = rngInstance
): (
  | EmbassyEstablished
  | CityInvestigated
  | TechnologyStolen
  | CitySabotaged
  | RevoltIncited
  | UnitBribed
  | KingMet
)[] => {
  // Pays `cost` from `unit`'s owner's gold, if it has that much.
  const pay = (unit: Unit, cost: number): boolean => {
    const treasury = playerTreasuryRegistry.getByPlayerAndType(
      unit.player(),
      Gold
    );

    if (treasury.value() < cost) {
      return false;
    }

    treasury.subtract(cost);

    return true;
  };

  return [
    // A one-way record: the host has no embassy with the Diplomat's civilization unless it sends a Diplomat of its own.
    new EmbassyEstablished(
      'civ1-unit:unit/embassy-established/register',
      new Effect((unit: Unit, city: City): boolean => {
        interactionRegistry.register(
          new Embassy(unit.player(), city.player(), ruleRegistry, turn) as never
        );

        engine.emit('player:embassy-established', unit.player(), city.player());

        return true;
      })
    ),

    // What the Diplomat's owner sees is up to the client: the city, as its owner would.
    new CityInvestigated(
      'civ1-unit:unit/city-investigated/emit',
      new Effect((unit: Unit, city: City): boolean => {
        engine.emit('city:investigated', city, unit.player());

        return true;
      })
    ),

    // v474.05 opens the contact screen, then the Diplomat's turn is over. The talks themselves are the client's.
    new KingMet(
      'civ1-unit:unit/king-met/meet',
      new Effect((unit: Unit, player: Player): void => {
        unit.moves().set(0);

        engine.emit('player:meet-with-king', unit.player(), player);
      })
    ),

    // v474.05 walks the advances from a random one and takes the first the victim has and the thief doesn't, which
    //  favours an advance after a run the thief already knows; here each is as likely (civ-clone/web-renderer#58).
    //  The city is marked as robbed, which any change of owner clears.
    new TechnologyStolen(
      'civ1-unit:unit/technology-stolen/steal',
      new Effect((unit: Unit, city: City): boolean => {
        const thief = unit.player(),
          victim = city.player(),
          stealable = stealableAdvances(thief, victim, playerResearchRegistry);

        if (stealable.length === 0) {
          return false;
        }

        const AdvanceType =
          stealable[Math.floor(randomNumberGenerator() * stealable.length)];

        playerResearchRegistry.getByPlayer(thief).addAdvance(AdvanceType);

        interactionRegistry.register(
          new AdvanceStolen(thief, victim, city, ruleRegistry, turn) as never
        );

        engine.emit('player:advance-stolen', thief, victim, AdvanceType, city);

        return true;
      })
    ),

    // v474.05: a random improvement (never the Palace or a Wonder) half the time, or always if the shield box is
    //  empty; otherwise, or with nothing to destroy, the shield box is emptied.
    new CitySabotaged(
      'civ1-unit:unit/city-sabotaged/sabotage',
      new Effect((unit: Unit, city: City): void => {
        const cityBuild = cityBuildRegistry.getByCity(city),
          improvements = cityImprovementRegistry
            .getByCity(city)
            .filter(
              (improvement: CityImprovement): boolean =>
                !(improvement instanceof Palace) &&
                !(improvement instanceof Wonder) &&
                !improvement.destroyed()
            );

        if (
          improvements.length > 0 &&
          (cityBuild.progress().value() === 0 || randomNumberGenerator() < 0.5)
        ) {
          const improvement =
            improvements[
              Math.floor(randomNumberGenerator() * improvements.length)
            ];

          improvement.destroy();

          engine.emit('city:sabotaged', city, unit.player(), improvement);

          return;
        }

        const building = cityBuild.building();

        cityBuild.progress().set(0);

        engine.emit(
          'city:sabotaged',
          city,
          unit.player(),
          building === null ? null : building.item()
        );
      })
    ),

    // The city changes hands as a conquered one does, through `City#capture`, with the action as its cause so the
    //  `Captured` rules can tell (civ-clone/web-renderer#58: the city shrinks, may lose buildings, and nearby units
    //  defect).
    new RevoltIncited(
      'civ1-unit:unit/revolt-incited/capture',
      new Effect((unit: Unit, city: City, action: InciteRevolt): boolean => {
        const originalPlayer = city.player();

        if (!pay(unit, action.cost())) {
          return false;
        }

        city.capture(unit.player(), action);

        engine.emit(
          'city:incited',
          city,
          unit.player(),
          originalPlayer,
          action.cost(),
          action instanceof SubvertCity
        );

        return true;
      })
    ),

    // v474.05 recreates the unit for the briber, which its `CreateUnit` homes in the nearest city if that's the
    //  briber's, and in none otherwise (Rome on 640K a Day, p356, "The Homeless Soldiers' Solution").
    new UnitBribed(
      'civ1-unit:unit/unit-bribed/transfer',
      new Effect((unit: Unit, target: Unit, action: BribeUnit): boolean => {
        const briber = unit.player(),
          previousOwner = target.player();

        if (!pay(unit, action.cost())) {
          return false;
        }

        const [nearest] = cityRegistry
          .entries()
          .filter((city: City): boolean => !city.destroyed())
          .sort(
            (a: City, b: City): number =>
              civ1Distance(a.tile(), target.tile()) -
              civ1Distance(b.tile(), target.tile())
          );

        target.transfer(
          briber,
          nearest !== undefined && nearest.player() === briber ? nearest : null
        );

        engine.emit(
          'unit:bribed',
          target,
          briber,
          previousOwner,
          action.cost()
        );

        return true;
      })
    ),
  ];
};

export default getRules;
