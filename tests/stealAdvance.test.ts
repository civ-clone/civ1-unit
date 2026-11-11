import * as Advances from '@civ-clone/library-science/Advances';
import {
  Alphabet,
  Currency,
  FusionPower,
  Gunpowder,
  Writing,
} from '@civ-clone/library-science/Advances';
import { civ1Advances, firstStealableAdvance } from '../lib/stealAdvance';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';

// civ-clone/web-renderer#960: which advance a Diplomat takes, as v474.05 picks it.
describe('stealing an advance, as v474.05', (): void => {
  class Extra extends Advance {}

  class Repeatable extends Advance {
    static readonly repeatable = true;
  }

  // A thief and a victim knowing what they're given, and a random number generator returning `rolls`, then 0, that
  //  counts its calls.
  const setUp = (
    thiefKnows: (typeof Advance)[],
    victimKnows: (typeof Advance)[],
    rolls: number[] = []
  ) => {
    const ruleRegistry = new RuleRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      thief = new Player(ruleRegistry),
      victim = new Player(ruleRegistry),
      draws: number[] = [];

    [
      [thief, thiefKnows],
      [victim, victimKnows],
    ].forEach(([player, known]): void => {
      const research = new PlayerResearch(
        player as Player,
        new AdvanceRegistry(),
        ruleRegistry
      );

      (known as (typeof Advance)[]).forEach((AdvanceType) =>
        research.addAdvance(AdvanceType)
      );
      playerResearchRegistry.register(research);
    });

    return {
      draws,
      thief,
      victim,
      steal: (): typeof Advance | null =>
        firstStealableAdvance(
          thief,
          victim,
          (): number => {
            const roll = rolls.shift() ?? 0;

            draws.push(roll);

            return roll;
          },
          playerResearchRegistry
        ),
    };
  };

  // A roll that starts the walk at `index`.
  const at = (index: number): number => (index + 0.5) / 72;

  it("should hold v474.05's 72 advances in its order, the 67 there are and 5 never known", (): void => {
    const known = civ1Advances.filter((AdvanceType) => AdvanceType !== null);

    expect(civ1Advances.length).to.equal(72);
    expect(known.length).to.equal(67);
    expect(new Set(known).size).to.equal(67);
    expect(new Set(known)).to.eql(new Set(Object.values(Advances)));
    expect(civ1Advances.slice(67)).to.eql([null, null, null, null, null]);
    expect(civ1Advances[0]).to.equal(Alphabet);
    expect(civ1Advances[2]).to.equal(Currency);
    expect(civ1Advances[22]).to.equal(Writing);
    expect(civ1Advances[34]).to.equal(Gunpowder);
    expect(civ1Advances[66]).to.equal(FusionPower);
  });

  it('should take the first advance the victim knows and the thief does not, from where the walk starts', (): void => {
    expect(setUp([], [Writing, Currency, Alphabet], [at(1)]).steal()).to.equal(
      Currency
    );
    expect(setUp([], [Writing, Currency, Alphabet], [at(2)]).steal()).to.equal(
      Currency
    );
    // Past Currency, nothing until Writing: everything from 3 to 22 falls to Writing, so it is likelier.
    expect(setUp([], [Writing, Currency, Alphabet], [at(3)]).steal()).to.equal(
      Writing
    );
    expect(setUp([], [Writing, Currency, Alphabet], [at(22)]).steal()).to.equal(
      Writing
    );
    // Round the end, back to the start.
    expect(setUp([], [Writing, Currency, Alphabet], [at(23)]).steal()).to.equal(
      Alphabet
    );
    expect(setUp([], [Writing, Currency, Alphabet], [at(71)]).steal()).to.equal(
      Alphabet
    );
  });

  it('should pass over what the thief knows already, and anything repeatable', (): void => {
    expect(
      setUp([Currency], [Writing, Currency, Alphabet], [at(1)]).steal()
    ).to.equal(Writing);
    expect(setUp([], [Repeatable, Alphabet], [at(1)]).steal()).to.equal(
      Alphabet
    );
    expect(setUp([], [Repeatable], [at(1)]).steal()).to.null;
  });

  it('should draw once, and only once, even with nothing to take', (): void => {
    const some = setUp([], [Writing], [at(5), 0.9]),
      none = setUp([Writing], [Writing], [at(5), 0.9]);

    expect(some.steal()).to.equal(Writing);
    expect(some.draws).to.eql([at(5)]);
    expect(none.steal()).to.null;
    expect(none.draws).to.eql([at(5)]);
  });

  it('should leave the Barbarians nothing to take, having drawn', (): void => {
    const { draws, steal, thief } = setUp([], [Writing], [at(5)]);

    thief.setCivilization(new Barbarian());

    expect(steal()).to.null;
    expect(draws).to.eql([at(5)]);
  });

  it("should take an advance v474.05 doesn't have after its 72, in the order the victim learnt them", (): void => {
    expect(setUp([], [Extra], [at(0)]).steal()).to.equal(Extra);
    expect(setUp([], [Extra, FusionPower], [at(66)]).steal()).to.equal(
      FusionPower
    );
    // From slot 67 the walk passes the five never known, then reaches the 73rd, Extra.
    expect(setUp([], [Extra, FusionPower], [at(67)]).steal()).to.equal(Extra);
    expect(setUp([], [Extra, Alphabet], [at(67)]).steal()).to.equal(Extra);
  });
});
