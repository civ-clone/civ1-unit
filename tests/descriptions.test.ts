import {
  CityWalls,
  SdiDefence,
} from '@civ-clone/library-city/CityImprovements';
import strength, { cityWallsMultiplier } from '../Rules/Unit/strength';
import IgnoresFortifications from '@civ-clone/base-unit-trait-ignores-fortifications/IgnoresFortifications';
import detonated from '../Rules/Unit/detonated';
import { expect } from 'chai';

// What City Walls and SDI Defense say they do, for the Civilopedia (civ-clone/web-renderer#1196). `strength.test.ts`
//  checks the walls' multiplier in battle, and `nuclear.test.ts` SDI Defense.
describe('descriptions', (): void => {
  it('City Walls triple the defence, except against what ignores fortifications', (): void => {
    expect(strength().flatMap((rule) => rule.descriptions())).to.eql([
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
});
