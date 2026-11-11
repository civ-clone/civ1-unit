import { Engine } from '@civ-clone/core-engine/Engine';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
/** The advances `victim` knows and `thief` doesn't, other than repeatable ones: what a Diplomat could steal. */
export declare const stealableAdvances: (thief: Player, victim: Player, playerResearchRegistry?: PlayerResearchRegistry) => (typeof Advance)[];
/**
 * v474.05's 72 advances (civd `GAME.C` `advances[72]`), in its order, by their index there. Slots 67 to 70 (named
 * "1" to "4") are never known, nor is 71, Future Technology (`has_tech()` is 0 for it), so they hold `null`.
 */
export declare const civ1Advances: (typeof Advance | null)[];
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
export declare const firstStealableAdvance: (thief: Player, victim: Player, randomNumberGenerator: () => number, playerResearchRegistry?: PlayerResearchRegistry) => typeof Advance | null;
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
export declare const stealAdvance: (thief: Player, victim: Player, city: City, AdvanceType: typeof Advance, { engine, interactionRegistry, playerResearchRegistry, ruleRegistry, turn, }?: StealAdvanceDependencies) => void;
export default stealAdvance;
