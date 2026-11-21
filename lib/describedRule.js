"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describedRule = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
/**
 * `rule`, made by a helper that takes no `Description`, as a rule of its own type that says what it does
 *  (civ-clone/web-renderer#1196): the same id and priority, asking `rule` whether it applies and having it apply, so
 *  it behaves as `rule` does.
 */
const describedRule = (rule, description) => {
    const RuleType = rule.constructor, id = rule.id();
    return new RuleType(...(id === null ? [] : [id]), rule.priority(), new Criterion_1.default((...args) => rule.validate(...args)), new Effect_1.default((...args) => rule.process(...args)), description);
};
exports.describedRule = describedRule;
exports.default = exports.describedRule;
//# sourceMappingURL=describedRule.js.map