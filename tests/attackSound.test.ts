import {
  Artillery,
  Bomber,
  Catapult,
  Diplomat,
  Fighter,
  Knight,
  Musketman,
  Settlers,
  Transport,
  Warrior,
} from '../Units';
import attackSound, {
  attackSoundFor,
  bombing,
  gunfire,
  melee,
} from '../AdditionalData/attackSound';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';

describe('attackSound', (): void => {
  it('should give a gun to a unit with an attack above 4, as the Catapult has', (): void => {
    expect(attackSoundFor(Catapult)).to.deep.equal([gunfire]);
    expect(attackSoundFor(Artillery)).to.deep.equal([gunfire]);
  });

  it('should give a gun to a unit with a defence above 2', (): void => {
    expect(attackSoundFor(Musketman)).to.deep.equal([gunfire]);
  });

  it('should give a blade to a unit at or below both, as the Knight and the Fighter are', (): void => {
    expect(attackSoundFor(Warrior)).to.deep.equal([melee]);
    expect(attackSoundFor(Knight)).to.deep.equal([melee]);
    expect(attackSoundFor(Fighter)).to.deep.equal([melee]);
  });

  it("should give the Bomber a bombing run, with a gun's for a pack without one", (): void => {
    expect(attackSoundFor(Bomber)).to.deep.equal([bombing, gunfire]);
  });

  it("should give a unit that doesn't attack the sound of its defence, as Civ1 does", (): void => {
    expect(attackSoundFor(Settlers)).to.deep.equal([melee]);
    expect(attackSoundFor(Diplomat)).to.deep.equal([melee]);
    expect(attackSoundFor(Transport)).to.deep.equal([gunfire]);
  });

  it("should give nothing to a unit that isn't in Civ1's unit table", (): void => {
    class Other extends Unit {}

    expect(attackSoundFor(Other)).null;
  });

  it("should send a unit's sound as `attackSound`", (): void => {
    const [data] = attackSound(),
      // Only its type is read.
      unit = Object.create(Catapult.prototype) as Catapult;

    expect(data.key()).equal('attackSound');
    expect(data.data(unit)).to.deep.equal([gunfire]);
  });
});
