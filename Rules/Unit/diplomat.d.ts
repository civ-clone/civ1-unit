import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Advance from '@civ-clone/core-science/Advance';
import CitySabotaged from '@civ-clone/base-unit-action-industrial-sabotage/Rules/CitySabotaged';
import Player from '@civ-clone/core-player/Player';
import RevoltIncited from '@civ-clone/base-unit-action-incite-revolt/Rules/RevoltIncited';
import TechnologyStolen from '@civ-clone/base-unit-action-steal-technology/Rules/TechnologyStolen';
import UnitBribed from '@civ-clone/base-unit-action-bribe-unit/Rules/UnitBribed';
/** The advances `victim` knows and `thief` doesn't: what a Diplomat could steal. */
export declare const stealableAdvances: (
  thief: Player,
  victim: Player,
  playerResearchRegistry?: PlayerResearchRegistry
) => (typeof Advance)[];
export declare const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityImprovementRegistry?: CityImprovementRegistry,
  cityRegistry?: CityRegistry,
  interactionRegistry?: InteractionRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  playerTreasuryRegistry?: PlayerTreasuryRegistry,
  ruleRegistry?: RuleRegistry,
  turn?: Turn,
  engine?: Engine,
  randomNumberGenerator?: () => number
) => (TechnologyStolen | CitySabotaged | RevoltIncited | UnitBribed)[];
export default getRules;
