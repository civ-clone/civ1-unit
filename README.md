# civ1-unit

A collection of `Rule`s related to `Unit` values and functionality. Should be in-line with Civ 1.

## The Senate

A Republic's or Democracy's Senate won't let its player break a treaty: an action that would is offered only in its
`Overruled` form. The Senate is a `SenateIntervenes` rule from `base-government-senate`, `civ1-unit:player/senate-intervenes`
(`RuleIds.SENATE_RULE`), returned with the unit actions by `Rules/Unit/action`. The actions ask the rules of the registry
passed to `action()`, the one its rules are registered in, so a rule set can add a `SenateIntervenes` rule of its own or
replace this one by id.
