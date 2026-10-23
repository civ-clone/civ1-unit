import { Musketman, Spearman, Trireme, Warrior } from '../Units';
import {
  buildRequirements,
  describedRequirements,
  navalNeedsCoast,
  obsoletedBy,
  replacedBy,
  requiresAdvance,
} from '../Requirements';
import Build from '@civ-clone/core-city-build/Rules/Build';
import { Irrigation } from '@civ-clone/civ1-world/TileImprovements';
import City from '@civ-clone/core-city/City';
import Conscription from '@civ-clone/base-science-advance-conscription/Conscription';
import { Game } from '@civ-clone/core-game/Game';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import Rule from '@civ-clone/core-rule/Rule';
import { expect } from 'chai';
import getRules from '../Rules/City/build';
import register from '../registerRules';

// Through `register(game)`, as a game gets them: the entries in `game.requirements`, and the rules made from them in
//  `game.rules` under the same ids (civ-clone/web-renderer#37).
const setUp = () => {
  const game = new Game();

  register(game);

  const player = new Player(game.rules),
    research = new PlayerResearch(player, game.advances, game.rules),
    city = { player: () => player } as unknown as City;

  game.playerResearch.register(research);

  // Whether every one of `game`'s build rules about `Item` lets `city` build it.
  const canBuild = (Item: Function): boolean =>
    game.rules
      .get(Build)
      .filter((rule: Build): boolean => rule.validate(city, Item as any))
      .every((rule: Build): boolean =>
        rule.process(city, Item as any).validate()
      );

  return { canBuild, game, research };
};

const ids = (rules: Rule[]): (string | null)[] =>
  rules.map((rule: Rule): string | null => rule.id());

describe('civ1-unit requirements', (): void => {
  it('should make one build rule for each entry that needs one, under its id, and none for the others', (): void => {
    const { game } = setUp();

    buildRequirements.forEach((entry: Requirement): void => {
      const rules = game.requirements.rulesFor(entry.id);

      expect(rules, entry.id).length(1);
      expect(rules[0], entry.id).instanceOf(Build);
      expect(game.rules.getById(entry.id), entry.id).equal(rules[0]);
    });

    describedRequirements.forEach((entry: Requirement): void => {
      expect(game.requirements.rulesFor(entry.id), entry.id).eql([]);
    });

    // The coastal rule is still the hand-written one.
    expect(game.rules.getById(navalNeedsCoast.id)).instanceOf(Build);
  });

  it('should have an entry for every build rule it registers', (): void => {
    const { game } = setUp(),
      buildRuleIds = ids(game.rules.get(Build));

    expect(buildRuleIds.length).equal(1 + buildRequirements.length);
    buildRuleIds.forEach((id: string | null): void => {
      expect(game.requirements.getById(id as string), id as string).not.null;
    });
  });

  it('should register the rules in the order they always were', (): void => {
    const { game } = setUp();

    // The build rules' ids in the order \`Rules/City/build\` registered them before they were made from entries,
    //  written out rather than read from the same entries, so a reordered table fails here.
    expect(ids(game.rules.get(Build))).eql(ids(getRules()));
    expect(ids(getRules())).eql([
      'civ1-unit:city/build/naval-needs-coast',
      'civ1-unit:city/build/requires-advance/Artillery',
      'civ1-unit:city/build/requires-advance/Battleship',
      'civ1-unit:city/build/requires-advance/Bomber',
      'civ1-unit:city/build/requires-advance/Cannon',
      'civ1-unit:city/build/requires-advance/Carrier',
      'civ1-unit:city/build/requires-advance/Caravan',
      'civ1-unit:city/build/requires-advance/Catapult',
      'civ1-unit:city/build/requires-advance/Chariot',
      'civ1-unit:city/build/requires-advance/Cruiser',
      'civ1-unit:city/build/requires-advance/Diplomat',
      'civ1-unit:city/build/requires-advance/Fighter',
      'civ1-unit:city/build/requires-advance/Frigate',
      'civ1-unit:city/build/requires-advance/Horseman',
      'civ1-unit:city/build/requires-advance/Ironclad',
      'civ1-unit:city/build/requires-advance/Knight',
      'civ1-unit:city/build/requires-advance/MechanizedInfantry',
      'civ1-unit:city/build/requires-advance/Musketman',
      'civ1-unit:city/build/requires-advance/Nuclear',
      'civ1-unit:city/build/requires-advance/Rifleman',
      'civ1-unit:city/build/requires-advance/Sail',
      'civ1-unit:city/build/requires-advance/Spearman',
      'civ1-unit:city/build/requires-advance/Submarine',
      'civ1-unit:city/build/requires-advance/Swordman',
      'civ1-unit:city/build/requires-advance/Tank',
      'civ1-unit:city/build/requires-advance/Transport',
      'civ1-unit:city/build/requires-advance/Trireme',
      'civ1-unit:city/build/obsolete/Cannon',
      'civ1-unit:city/build/obsolete/Catapult',
      'civ1-unit:city/build/obsolete/Chariot',
      'civ1-unit:city/build/obsolete/Frigate',
      'civ1-unit:city/build/obsolete/Horseman',
      'civ1-unit:city/build/obsolete/Ironclad',
      'civ1-unit:city/build/obsolete/Knight',
      'civ1-unit:city/build/obsolete/Musketman',
      'civ1-unit:city/build/obsolete/Sail',
      'civ1-unit:city/build/obsolete/Spearman',
      'civ1-unit:city/build/obsolete/Swordman',
      'civ1-unit:city/build/obsolete/Trireme',
      'civ1-unit:city/build/obsolete/Warrior',
    ]);
  });

  it('should replace each obsolete unit with the one its obsoleting advance makes buildable', (): void => {
    expect(replacedBy.length).equal(obsoletedBy.length);

    obsoletedBy.forEach((obsolete: Requirement): void => {
      const madeBuildable = requiresAdvance.filter(
          (entry: Requirement): boolean =>
            entry.targets[0] === obsolete.targets[0]
        ),
        replacement = replacedBy.find(
          (entry: Requirement): boolean => entry.subject === obsolete.subject
        );

      expect(madeBuildable, obsolete.id).length(1);
      expect(replacement?.targets, obsolete.id).eql([madeBuildable[0].subject]);
    });
  });

  it('should read the graph both ways', (): void => {
    const { game } = setUp();

    expect(
      game.requirements
        .for(Musketman)
        .map((entry: Requirement): string => entry.id)
    ).eql([
      'civ1-unit:city/build/requires-advance/Musketman',
      'civ1-unit:city/build/obsolete/Musketman',
      'civ1-unit:unit/replaced-by/Musketman',
    ]);
    expect(
      game.requirements
        .leadsTo(Gunpowder)
        .map((entry: Requirement): string => entry.id)
    ).eql([
      'civ1-unit:city/build/requires-advance/Musketman',
      'civ1-unit:city/build/obsolete/Spearman',
      'civ1-unit:city/build/obsolete/Warrior',
    ]);
    // Irrigation needs water nearby, which the Worker's own rule decides.
    expect(
      game.requirements
        .for(Irrigation)
        .map((entry: Requirement): string => entry.id)
    ).include('civ1-unit:unit/action/improvement/Irrigation');
    // A Trireme is `Naval`, so the coastal entry is about it too.
    expect(
      game.requirements
        .for(Trireme)
        .map((entry: Requirement): string => entry.id)
    ).include('civ1-unit:city/build/naval-needs-coast');
  });

  it('should build as the entries say', (): void => {
    const { canBuild, research } = setUp();

    expect(canBuild(Musketman)).false;
    expect(canBuild(Spearman)).false;

    research.addAdvance(Gunpowder);

    expect(canBuild(Musketman)).true;
    expect(canBuild(Warrior)).false;

    research.addAdvance(Conscription);

    expect(canBuild(Musketman)).false;
  });

  it('should change what a city can build when a plugin changes an entry', (): void => {
    const { canBuild, game, research } = setUp(),
      [requiresGunpowderAndConscription] = requiresAdvance
        .filter((entry: Requirement): boolean => entry.subject === Musketman)
        .map(
          (entry: Requirement): Requirement =>
            new Requirement({
              id: entry.id,
              subject: entry.subject,
              relation: entry.relation,
              targets: [Gunpowder, Conscription],
            })
        );

    game.requirements.replace(
      'civ1-unit:city/build/requires-advance/Musketman',
      requiresGunpowderAndConscription
    );
    game.requirements.remove('civ1-unit:city/build/obsolete/Musketman');

    research.addAdvance(Gunpowder);

    expect(canBuild(Musketman)).false;

    research.addAdvance(Conscription);

    expect(canBuild(Musketman)).true;
  });
});
