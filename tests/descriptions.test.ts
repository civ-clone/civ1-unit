import {
  Arctic,
  Desert,
  Forest,
  Grassland,
  Hills,
  Jungle,
  Mountains,
  Ocean,
  Plains,
  River,
  Swamp,
  Tundra,
} from '@civ-clone/civ1-world/Terrains';
import {
  CityWalls,
  SdiDefence,
} from '@civ-clone/library-city/CityImprovements';
import {
  CleanPollution,
  ClearForest,
  ClearJungle,
  ClearSwamp,
  Move,
  PlantForest,
} from '../Actions';
import {
  Irrigation,
  Mine,
  Pollution,
  Railroad,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
import { BridgeBuilding } from '@civ-clone/library-science/Advances';
import movementCost, {
  ROAD_SQUARES_PER_MOVE,
  civ1TerrainJobTurns,
  terrainJobImprovement,
  terrainMovementCost,
} from '../Rules/Unit/movementCost';
import strength, {
  cityWallsMultiplier,
  terrainDefence,
} from '../Rules/Unit/strength';
import { EffectDescription } from '@civ-clone/core-rule/Description';
import IgnoresFortifications from '@civ-clone/base-unit-trait-ignores-fortifications/IgnoresFortifications';
import { RAILROAD_MOVEMENT_RULE } from '../RuleIds';
import { Settlers } from '../Units';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import action from '../Rules/Unit/action';
import availableRequirements from '@civ-clone/civ1-world/Requirements';
import detonated from '../Rules/Unit/detonated';
import { expect } from 'chai';
import { terrainValue } from '@civ-clone/base-terrain-properties/lib/terrainTable';

// What City Walls, SDI Defense and each terrain say they do, for the Civilopedia (civ-clone/web-renderer#1196,
//  civ-clone/web-renderer#620). `strength.test.ts` checks the walls' multiplier in battle, and `nuclear.test.ts` SDI
//  Defense. Terrains are made with `Object.create`, as the lookups only need their class and making one runs the
//  game's `Created` rules.
describe('descriptions', (): void => {
  const terrains: (typeof Terrain)[] = [
      Arctic,
      Desert,
      Forest,
      Grassland,
      Hills,
      Jungle,
      Mountains,
      Ocean,
      Plains,
      River,
      Swamp,
      Tundra,
    ],
    terrainOf = (TerrainType: typeof Terrain): Terrain =>
      Object.create(TerrainType.prototype),
    // A Settlers standing on `terrain`.
    unitOn = (terrain: Terrain): Unit => {
      const unit = Object.create(Settlers.prototype);

      unit.tile = (): Tile => ({ terrain: (): Terrain => terrain } as Tile);

      return unit;
    },
    ofType = (
      descriptions: EffectDescription[],
      type: string
    ): EffectDescription[] =>
      descriptions.filter(
        (description: EffectDescription): boolean => description.type === type
      );

  it('City Walls triple the defence, except against what ignores fortifications', (): void => {
    expect(
      strength()
        .flatMap((rule) => rule.descriptions())
        .filter((description) => description.subject === CityWalls)
    ).to.eql([
      {
        type: 'defence_multiplier',
        subject: CityWalls,
        value: cityWallsMultiplier,
        except: IgnoresFortifications,
      },
    ]);
    expect(cityWallsMultiplier).to.equal(3);
  });

  it('SDI Defense saves the units in its city from a nuclear attack', (): void => {
    expect(detonated().flatMap((rule) => rule.descriptions())).to.eql([
      {
        type: 'protects_from',
        subject: SdiDefence,
        event: 'nuclear_attack',
        what: 'units',
      },
    ]);
  });

  it('each terrain says what it costs to move onto, as the move rule charges', (): void => {
    const [moveRule] = movementCost().filter(
        (rule) => rule.id() === 'civ1-unit:unit/movement-cost/move'
      ),
      described = ofType(moveRule.descriptions(), 'movement_cost');

    expect(described).to.have.lengthOf(terrains.length);

    terrains.forEach((TerrainType: typeof Terrain): void => {
      const terrain = terrainOf(TerrainType),
        move = Object.create(Move.prototype);

      move.to = (): Tile => ({ terrain: (): Terrain => terrain } as Tile);

      expect(moveRule.validate(unitOn(terrain), move)).to.equal(true);
      expect(
        described.filter((description) => description.subject === TerrainType),
        TerrainType.name
      ).to.eql([
        {
          type: 'movement_cost',
          subject: TerrainType,
          value: moveRule.process(unitOn(terrain), move),
        },
      ]);
      expect(terrainMovementCost(terrain)).to.equal(
        moveRule.process(unitOn(terrain), move)
      );
    });
  });

  it('each terrain says its defence bonus, unless it is ×1', (): void => {
    const described = ofType(
      strength().flatMap((rule) => rule.descriptions()),
      'defence_bonus'
    );

    terrains.forEach((TerrainType: typeof Terrain): void => {
      const multiplier = terrainValue(terrainDefence, terrainOf(TerrainType));

      expect(
        described.filter((description) => description.subject === TerrainType),
        TerrainType.name
      ).to.eql(
        multiplier === null || multiplier === 1
          ? []
          : [{ type: 'defence_bonus', subject: TerrainType, value: multiplier }]
      );
    });

    expect(
      described.map((description) => [description.subject, description.value])
    ).to.eql([
      [Forest, 1.5],
      [Jungle, 1.5],
      [River, 1.5],
      [Swamp, 1.5],
      [Hills, 2],
      [Mountains, 3],
    ]);
  });

  it("each terrain says how long its jobs take, one more than the rule's delay as Civ1 counts the turn ordered", (): void => {
    const rules = movementCost();

    civ1TerrainJobTurns.forEach(([Action, time]): void => {
      const [rule] = rules.filter(
          (rule) =>
            rule.id() === `civ1-unit:unit/movement-cost/action/${Action.name}`
        ),
        Improvement = terrainJobImprovement(Action),
        described = ofType(rule.descriptions(), 'improvement_turns'),
        // Where the job can be done: its own table's terrains, or where civ1-world lets the improvement be built.
        where: (typeof Terrain)[] = Array.isArray(time)
          ? time.map(([TerrainType]) => TerrainType)
          : availableRequirements
              .filter((requirement) => requirement.subject === Improvement)
              .flatMap(
                (requirement) => (requirement.where ?? []) as (typeof Terrain)[]
              );

      if (Improvement === null) {
        expect(described, Action.name).to.eql([]);

        return;
      }

      terrains.forEach((TerrainType: typeof Terrain): void => {
        const terrain = terrainOf(TerrainType),
          job = Object.create(Action.prototype) as UnitAction;

        expect(
          described.filter(
            (description) => description.subject === TerrainType
          ),
          `${Action.name} on ${TerrainType.name}`
        ).to.eql(
          where.includes(TerrainType)
            ? [
                {
                  type: 'improvement_turns',
                  subject: TerrainType,
                  // A conversion names itself: it builds no improvement.
                  improvement: 'result' in Action ? Action : Improvement,
                  value: (rule.process(unitOn(terrain), job) as number) + 1,
                  unit: Settlers,
                  // A Road on a River needs Bridge Building, and so does the Railroad built on it.
                  ...(TerrainType === River &&
                  (Improvement === Road || Improvement === Railroad)
                    ? { with: [BridgeBuilding] }
                    : {}),
                },
              ]
            : []
        );
      });
    });

    // Spot checks against Civ1's table (Rome on 640K, Table 3-2).
    const all = rules.flatMap((rule) =>
      ofType(rule.descriptions(), 'improvement_turns')
    );

    expect(
      all.filter(
        (description) =>
          description.subject === Hills || description.subject === Grassland
      )
    ).to.have.deep.members([
      {
        type: 'improvement_turns',
        subject: Hills,
        improvement: Irrigation,
        value: 10,
        unit: Settlers,
      },
      {
        type: 'improvement_turns',
        subject: Hills,
        improvement: Mine,
        value: 10,
        unit: Settlers,
      },
      {
        type: 'improvement_turns',
        subject: Grassland,
        improvement: Irrigation,
        value: 5,
        unit: Settlers,
      },
      {
        type: 'improvement_turns',
        subject: Grassland,
        improvement: PlantForest,
        value: 10,
        unit: Settlers,
      },
      ...[Hills, Grassland].flatMap((TerrainType) =>
        (
          [
            [Road, 2],
            [Railroad, 4],
          ] as [typeof Road, number][]
        ).map(([Improvement, factor]) => ({
          type: 'improvement_turns',
          subject: TerrainType,
          improvement: Improvement,
          value:
            factor * (terrainMovementCost(terrainOf(TerrainType)) as number),
          unit: Settlers,
        }))
      ),
    ]);
  });

  it('each conversion job names itself, not the order it is', (): void => {
    expect(
      movementCost()
        .flatMap((rule) => ofType(rule.descriptions(), 'improvement_turns'))
        .filter((description) =>
          [ClearForest, ClearJungle, ClearSwamp, PlantForest].includes(
            description.improvement as never
          )
        )
        .map((description) => [
          description.subject,
          description.improvement,
          description.value,
        ])
    ).to.eql([
      [Forest, ClearForest, 5],
      [Jungle, ClearJungle, 15],
      [Swamp, ClearSwamp, 15],
      [Grassland, PlantForest, 10],
      [Jungle, PlantForest, 15],
      [Plains, PlantForest, 15],
      [Swamp, PlantForest, 15],
    ]);
  });

  it("a River's Road and Railroad say they need Bridge Building", (): void => {
    expect(
      movementCost()
        .flatMap((rule) => ofType(rule.descriptions(), 'improvement_turns'))
        .filter((description) => description.subject === River)
    ).to.have.deep.members([
      {
        type: 'improvement_turns',
        subject: River,
        improvement: Irrigation,
        value: 5,
        unit: Settlers,
      },
      {
        type: 'improvement_turns',
        subject: River,
        improvement: Road,
        value: 2,
        unit: Settlers,
        with: [BridgeBuilding],
      },
      {
        type: 'improvement_turns',
        subject: River,
        improvement: Railroad,
        value: 4,
        unit: Settlers,
        with: [BridgeBuilding],
      },
    ]);
  });

  it('each conversion says what its order turns each terrain into', (): void => {
    const rules = action().filter((rule) =>
      rule.id()?.startsWith('civ1-unit:unit/action/terrain/')
    );

    expect(rules.map((rule) => rule.id())).to.eql([
      'civ1-unit:unit/action/terrain/ClearJungle',
      'civ1-unit:unit/action/terrain/ClearForest',
      'civ1-unit:unit/action/terrain/PlantForest',
      'civ1-unit:unit/action/terrain/ClearSwamp',
    ]);

    expect(rules.flatMap((rule) => rule.descriptions())).to.eql(
      [
        [Jungle, ClearJungle.result, Irrigation],
        [Forest, ClearForest.result, Irrigation],
        [Plains, PlantForest.result, Mine],
        [Grassland, PlantForest.result, Mine],
        [Jungle, PlantForest.result, Mine],
        [Swamp, PlantForest.result, Mine],
        [Swamp, ClearSwamp.result, Irrigation],
      ].map(([subject, terrain, improvement]) => ({
        type: 'converts_to',
        subject,
        terrain,
        improvement,
      }))
    );

    // As Civ1 has it: irrigating a Forest makes Plains, a Jungle or a Swamp Grassland; mining makes Forest.
    expect(ClearForest.result).to.equal(Plains);
    expect(ClearJungle.result).to.equal(Grassland);
    expect(ClearSwamp.result).to.equal(Grassland);
    expect(PlantForest.result).to.equal(Forest);
    expect(
      [ClearForest, ClearJungle, ClearSwamp, PlantForest].map((Action) =>
        terrainJobImprovement(Action as typeof UnitAction)
      )
    ).to.eql([Irrigation, Irrigation, Irrigation, Mine]);
  });

  // What a Road, a Railroad and cleaning up Pollution say, for the tile improvements' pages (civ-clone/web-renderer#1272,
  //  civ-clone/web-renderer#621). `movementCost.test.ts` checks the moves themselves.
  it('a Road says a land unit moves 3 squares along it for each move, and a Railroad that it moves for free', (): void => {
    const described = (id: string): EffectDescription[] =>
      movementCost()
        .filter((rule) => rule.id() === id)
        .flatMap((rule) => rule.descriptions());

    expect(described('civ1-unit:unit/movement-cost/road')).to.eql([
      { type: 'route_squares', subject: Road, value: 3 },
    ]);
    expect(ROAD_SQUARES_PER_MOVE).to.equal(3);
    expect(described(RAILROAD_MOVEMENT_RULE)).to.eql([
      { type: 'route_free', subject: Railroad },
    ]);
  });

  it('cleaning up Pollution says it takes 4 turns of Settlers work, once, as on any terrain', (): void => {
    const [, time] = civ1TerrainJobTurns.find(
        ([Action]): boolean => Action === CleanPollution
      )!,
      described = movementCost()
        .filter(
          (rule) =>
            rule.id() ===
            `civ1-unit:unit/movement-cost/action/${CleanPollution.name}`
        )
        .flatMap((rule) => rule.descriptions());

    expect(described).to.eql([
      { type: 'removal_turns', subject: Pollution, value: 4, unit: Settlers },
    ]);
    expect((time as (terrain: Terrain) => number)(terrainOf(Hills))).to.equal(
      4
    );
  });
});
