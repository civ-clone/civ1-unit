import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * `rule`, made by a helper that takes no `Description`, as a rule of its own type that says what it does
 *  (civ-clone/web-renderer#1196): the same id and priority, asking `rule` whether it applies and having it apply, so
 *  it behaves as `rule` does.
 */
export const describedRule = <R extends Rule<any, any>>(
  rule: R,
  description: Description
): R => {
  const RuleType = rule.constructor as new (...values: any[]) => R,
    id = rule.id();

  return new RuleType(
    ...(id === null ? [] : [id]),
    rule.priority(),
    new Criterion((...args: any[]): boolean => rule.validate(...args)),
    new Effect((...args: any[]): any => rule.process(...args)),
    description
  );
};

export default describedRule;
