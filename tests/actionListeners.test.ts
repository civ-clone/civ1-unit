import Engine from '@civ-clone/core-engine/Engine';
import action from '../Rules/Unit/action';
import { expect } from 'chai';

describe('unit action listeners', (): void => {
  // `EventEmitter` keeps its handlers private, so count the registrations as they're made.
  class CountingEngine extends Engine {
    registered: { [event: string]: number } = {};

    on(event: string, handler: (...args: any[]) => void): void {
      this.registered[event] = (this.registered[event] ?? 0) + 1;

      super.on(event, handler);
    }
  }

  const getRules = (engine: Engine) =>
    action(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      engine
    );

  it('should listen once to each routing event for each set of rules', (): void => {
    const engine = new CountingEngine();

    getRules(engine);

    expect(engine.registered).to.deep.equal({
      'city:captured': 1,
      'city:created': 1,
      'city:destroyed': 1,
      'unit:created': 1,
      'unit:destroyed': 1,
      'unit:moved': 1,
      'unit:transferred': 1,
    });

    getRules(engine);

    expect(Object.values(engine.registered)).to.deep.equal([
      2, 2, 2, 2, 2, 2, 2,
    ]);
  });
});
