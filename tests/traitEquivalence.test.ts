import * as Units from '../Units';
import {
  Air,
  Diplomatic,
  Fortifiable,
  Land,
  Naval,
  NavalTransport,
  Worker,
} from '../Types';
import {
  Artillery,
  Bomber,
  Caravan,
  Carrier,
  Diplomat,
  Fighter,
  Frigate,
  Nuclear,
  Sail,
  Settlers,
  Submarine,
  Transport,
  Trireme,
} from '../Units';
import { TraitType } from '@civ-clone/core-unit/UnitTrait';
import { hasTrait, isA, traitsOf } from '@civ-clone/core-unit/traits';
import AttackEndsTurn from '@civ-clone/base-unit-trait-attack-ends-turn/AttackEndsTurn';
import Carries from '@civ-clone/base-unit-trait-carries/Carries';
import CoastBound from '@civ-clone/base-unit-trait-coast-bound/CoastBound';
import Detonates from '@civ-clone/base-unit-trait-detonates/Detonates';
import DiplomaticMissions from '@civ-clone/base-unit-trait-diplomatic-missions/DiplomaticMissions';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import Fortifies from '@civ-clone/base-unit-trait-fortifies/Fortifies';
import FoundsCities from '@civ-clone/base-unit-trait-founds-cities/FoundsCities';
import { Game } from '@civ-clone/core-game/Game';
import IgnoresFortifications from '@civ-clone/base-unit-trait-ignores-fortifications/IgnoresFortifications';
import IgnoresZoneOfControl from '@civ-clone/base-unit-trait-ignores-zone-of-control/IgnoresZoneOfControl';
import Interceptor from '@civ-clone/base-unit-trait-interceptor/Interceptor';
import NonCombatant from '@civ-clone/base-unit-trait-non-combatant/NonCombatant';
import { Ocean } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Submerged from '@civ-clone/base-unit-trait-submerged/Submerged';
import Terraforms from '@civ-clone/base-unit-trait-terraforms/Terraforms';
import TradeMissions from '@civ-clone/base-unit-trait-trade-missions/TradeMissions';
import Unit from '@civ-clone/core-unit/Unit';
import UnitTraits from '@civ-clone/core-unit/Rules/UnitTraits';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { ignoreCityWalls } from '../Rules/Unit/strength';
import { notRepeated } from '../Rules/City/buildingComplete';
import register from '../registerRules';

// The checks the Civ1 packages make today, copied as they are written (file and line as of civ1-unit 0.1.29 and the
//  satellites installed with it), so that moving a call site to its trait can't change which units it picks. Each is
//  asked of a real unit of every Civ1 type and compared with the trait expression meant to replace it, asked of the
//  same unit and of its class.
type Old = (unit: Unit) => boolean;
type New = (unit: Unit | typeof Unit, rules: RuleRegistry) => boolean;

const has =
  (Trait: TraitType): New =>
  (unit, rules) =>
    hasTrait(unit, Trait, rules);

const predicates: [string, Old, New][] = [
  // action.ts l.1373 (fortify), l.1916 (explore); AI proxies; base-strategy-explore scoreExploration.ts:75.
  [
    'Fortifiable → Fortifies',
    (unit) => unit instanceof Fortifiable,
    has(Fortifies),
  ],
  // action.ts l.304, 375, 625: never attacks, captures or pillages.
  [
    'Diplomatic → NonCombatant',
    (unit) => unit instanceof Diplomatic,
    has(NonCombatant),
  ],
  // action.ts l.697: zone of control.
  [
    'Diplomatic → IgnoresZoneOfControl',
    (unit) => unit instanceof Diplomatic,
    has(IgnoresZoneOfControl),
  ],
  // action.ts l.1543, 1591, 1618, 1936; lib/routeOrders.ts.
  ['Worker → Terraforms', (unit) => unit instanceof Worker, has(Terraforms)],
  // action.ts l.1446, 1473; joinCityRefusal, settlersInSizeOneCity, buildingComplete:123, diplomatCosts:110.
  [
    'Settlers → FoundsCities',
    (unit) => unit instanceof Settlers,
    has(FoundsCities),
  ],
  // action.ts l.462, 967.
  [
    'Diplomat → DiplomaticMissions',
    (unit) => unit instanceof Diplomat,
    has(DiplomaticMissions),
  ],
  // action.ts l.425; civ1-wonder Rules/Unit/action.ts:42.
  [
    'Caravan → TradeMissions',
    (unit) => unit instanceof Caravan,
    has(TradeMissions),
  ],
  // action.ts l.306, 408; civ1-diplomacy standing.ts; civ1-power strength.ts.
  ['Nuclear → Detonates', (unit) => unit instanceof Nuclear, has(Detonates)],
  // action.ts l.334.
  [
    'Fighter → Interceptor',
    (unit) => unit instanceof Fighter,
    has(Interceptor),
  ],
  // action.ts l.362.
  [
    'Submarine → Submerged',
    (unit) => unit instanceof Submarine,
    has(Submerged),
  ],
  // moved.ts l.227.
  ['Trireme → CoastBound', (unit) => unit instanceof Trireme, has(CoastBound)],
  // strength.ts l.46/74, literally and as exported.
  [
    '[Artillery, Bomber] → IgnoresFortifications',
    (unit) =>
      ([Artillery, Bomber] as (typeof Unit)[]).some(
        (UnitType) => unit instanceof UnitType
      ),
    has(IgnoresFortifications),
  ],
  [
    'ignoreCityWalls → IgnoresFortifications',
    (unit) => ignoreCityWalls.some((UnitType) => unit instanceof UnitType),
    has(IgnoresFortifications),
  ],
  // moved.ts l.240.
  [
    'Bomber → AttackEndsTurn',
    (unit) => unit instanceof Bomber,
    has(AttackEndsTurn),
  ],
  // canStow.ts l.13-14: transports.
  [
    '[Trireme, Sail, Frigate, Transport] → Carries(Land)',
    (unit) =>
      ([Trireme, Sail, Frigate, Transport] as (typeof Unit)[]).some(
        (UnitType) => unit instanceof UnitType
      ),
    (unit, rules) =>
      traitsOf(unit, Carries, rules).some(
        (carries: Carries): boolean => carries.what === Land
      ),
  ],
  [
    '[Carrier] → Carries(Air)',
    (unit) => unit instanceof Carrier,
    (unit, rules) =>
      traitsOf(unit, Carries, rules).some(
        (carries: Carries): boolean => carries.what === Air
      ),
  ],
  // action.ts l.623-625 (pillage), in the shape 3b keeps and in the shape L25 simplifies to.
  [
    'pillage → (Fortifies || Terraforms) && !NonCombatant',
    (unit) =>
      (unit instanceof Fortifiable || unit instanceof Worker) &&
      !(unit instanceof Diplomatic),
    (unit, rules) =>
      (hasTrait(unit, Fortifies, rules) || hasTrait(unit, Terraforms, rules)) &&
      !hasTrait(unit, NonCombatant, rules),
  ],
  [
    'pillage → isA(Land) && !NonCombatant',
    (unit) =>
      (unit instanceof Fortifiable || unit instanceof Worker) &&
      !(unit instanceof Diplomatic),
    (unit, rules) => isA(unit, Land) && !hasTrait(unit, NonCombatant, rules),
  ],
  // action.ts l.1916 (explore).
  [
    'explore → Fortifies || isA(Naval)',
    (unit) => unit instanceof Fortifiable || unit instanceof Naval,
    (unit, rules) => hasTrait(unit, Fortifies, rules) || isA(unit, Naval),
  ],
  // lib/treatyPartner.ts:35.
  [
    'treatyPartner → isA(Land) && !NonCombatant',
    (unit) => unit instanceof Land && !(unit instanceof Diplomatic),
    (unit, rules) => isA(unit, Land) && !hasTrait(unit, NonCombatant, rules),
  ],
  // civ1-city Rules/City/cost.ts `supported` (isSupportedBy([Air, Fortifiable, Naval, Worker], [Diplomatic])), and
  //  simple-ai-client lib/Civ1/unitSupport.ts.
  [
    'supported → !NonCombatant',
    (unit) =>
      ([Air, Fortifiable, Naval, Worker] as (typeof Unit)[]).some(
        (UnitType) => unit instanceof UnitType
      ) && !(unit instanceof Diplomatic),
    (unit, rules) => !hasTrait(unit, NonCombatant, rules),
  ],
  // civ1-city-happiness Rules/City/yield.ts `neverAggressive`.
  [
    'neverAggressive → NonCombatant',
    (unit) => unit instanceof Diplomatic,
    has(NonCombatant),
  ],
  // civ1-civilization registerPersonality.ts `isMilitary` (asked of a class).
  [
    'isMilitary → !Terraforms && !NonCombatant',
    (unit) =>
      Object.prototype.isPrototypeOf.call(Unit, unit.constructor) &&
      !Object.prototype.isPrototypeOf.call(Worker, unit.constructor) &&
      !Object.prototype.isPrototypeOf.call(Diplomatic, unit.constructor),
    (unit, rules) =>
      !hasTrait(unit, Terraforms, rules) &&
      !hasTrait(unit, NonCombatant, rules),
  ],
  // Rules/City/buildingComplete.ts `notRepeated`, literally and as exported.
  [
    '[Caravan, Diplomat, Settlers] → NonCombatant || FoundsCities',
    (unit) =>
      ([Caravan, Diplomat, Settlers] as (typeof Unit)[]).some(
        (UnitType) => unit instanceof UnitType
      ),
    (unit, rules) =>
      hasTrait(unit, NonCombatant, rules) ||
      hasTrait(unit, FoundsCities, rules),
  ],
  [
    'notRepeated → NonCombatant || FoundsCities',
    (unit) => notRepeated.some((UnitType) => unit instanceof UnitType),
    (unit, rules) =>
      hasTrait(unit, NonCombatant, rules) ||
      hasTrait(unit, FoundsCities, rules),
  ],
  // civ1-enhanced Rules/City/build.ts:81-83 (asked of a class).
  [
    '=== Settlers || Diplomat || Caravan → FoundsCities || NonCombatant',
    (unit) =>
      unit.constructor === Settlers ||
      unit.constructor === Diplomat ||
      unit.constructor === Caravan,
    (unit, rules) =>
      hasTrait(unit, FoundsCities, rules) ||
      hasTrait(unit, NonCombatant, rules),
  ],
];

describe('unit traits', (): void => {
  const UnitTypes = Object.values(Units) as (typeof Unit)[];

  const setUp = async () => {
    const game = new Game();

    register(game);

    const player = new Player(game.rules),
      world = new World(new FillGenerator(3, 3, Ocean), game.rules);

    await world.build();

    const tile = world.get(1, 1),
      units = UnitTypes.map(
        (UnitType): Unit =>
          new (UnitType as unknown as new (...args: unknown[]) => Unit)(
            null,
            player,
            tile,
            game.rules,
            game.transports
          )
      );

    return { game, units };
  };

  it('should cover all 28 Civ1 unit types', (): void => {
    expect(UnitTypes).to.have.length(28);
    expect(UnitTypes.filter((UnitType) => isA(UnitType, Land))).length(16);
    expect(UnitTypes.filter((UnitType) => isA(UnitType, Fortifiable))).length(
      15
    );
    expect(UnitTypes.filter((UnitType) => isA(UnitType, Worker))).length(1);
    expect(UnitTypes.filter((UnitType) => isA(UnitType, Naval))).length(9);
    expect(
      UnitTypes.filter((UnitType) => isA(UnitType, NavalTransport))
    ).length(5);
    expect(UnitTypes.filter((UnitType) => isA(UnitType, Air))).length(3);
  });

  it('should register one rule per declared trait', async (): Promise<void> => {
    const { game } = await setUp(),
      rules = game.rules.get(UnitTraits);

    // 15 Fortifies, 2 × (NonCombatant, IgnoresZoneOfControl, IgnoresFortifications), 4 Carries(Land), and one each of
    //  Terraforms, FoundsCities, DiplomaticMissions, TradeMissions, Detonates, Interceptor, Submerged, CoastBound,
    //  AttackEndsTurn and Carries(Air).
    expect(rules).length(35);
    expect(
      rules.every((rule) => rule.id()!.startsWith('civ1-unit:unit/trait/'))
    ).true;
    expect(game.rules.getById('civ1-unit:unit/trait/Settlers/FoundsCities')).not
      .undefined;
    expect(game.rules.getById('civ1-unit:unit/trait/Carrier/Carries/Air')).not
      .undefined;
  });

  // The guard against "silent no traits": a game that registers civ1-unit and finds none has lost its declarations.
  it('should give Settlers FoundsCities in a registered game', async (): Promise<void> => {
    const { game, units } = await setUp(),
      settlers = units.find((unit) => unit instanceof Settlers)!;

    expect(hasTrait(Settlers, FoundsCities, game.rules)).true;
    expect(settlers.hasTrait(FoundsCities)).true;
    expect(hasTrait(Settlers, FoundsCities, new RuleRegistry())).false;
  });

  predicates.forEach(([name, old, trait]): void => {
    it(`should agree with the old check: ${name}`, async (): Promise<void> => {
      const { game, units } = await setUp();

      units.forEach((unit: Unit): void => {
        const expected = old(unit),
          label = `${name}: ${unit.constructor.name}`;

        expect(trait(unit, game.rules), `${label} (unit)`).to.equal(expected);
        expect(
          trait(unit.constructor as typeof Unit, game.rules),
          `${label} (class)`
        ).to.equal(expected);
      });

      // Not vacuous: each check holds for some unit type and fails for another.
      expect(units.some(old), `${name} holds for some type`).true;
      expect(
        units.some((unit) => !old(unit)),
        `${name} fails for some type`
      ).true;
    });
  });

  // canStow.ts: whether a transport takes a unit, over every pair of Civ1 types.
  it('should agree with canStow for every transport and unit', async (): Promise<void> => {
    const { game, units } = await setUp(),
      stowable: [typeof Unit, ...(typeof Unit)[]][] = [
        [Land, Trireme, Sail, Frigate, Transport],
        [Air, Carrier],
      ],
      old = (transport: Unit, unit: Unit): boolean =>
        stowable.some(
          ([StowableUnitType, ...transportTypes]) =>
            transportTypes.some(
              (TransportType) => transport instanceof TransportType
            ) && unit instanceof StowableUnitType
        );

    let pairs = 0,
      stowed = 0;

    units.forEach((transport: Unit): void =>
      units.forEach((unit: Unit): void => {
        const expected = old(transport, unit);

        expect(
          traitsOf(transport, Carries, game.rules).some((carries) =>
            carries.carries(unit)
          ),
          `${transport.constructor.name} carries ${unit.constructor.name}`
        ).to.equal(expected);
        expect(
          traitsOf(
            transport.constructor as typeof Unit,
            Carries,
            game.rules
          ).some((carries) =>
            carries.carries(unit.constructor as typeof Unit, game.rules)
          ),
          `${transport.constructor.name} carries ${unit.constructor.name} (classes)`
        ).to.equal(expected);

        pairs++;
        stowed += expected ? 1 : 0;
      })
    );

    expect(pairs).to.equal(28 * 28);
    // Four ships carry the 16 land types; the Carrier carries the 3 aircraft.
    expect(stowed).to.equal(4 * 16 + 3);
  });
});
