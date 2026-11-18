# civ1-unit

A collection of `Rule`s related to `Unit` values and functionality. Should be in-line with Civ 1.

## The Senate

A Republic's or Democracy's Senate won't let its player break a treaty: an action that would is offered only in its
`Overruled` form. The Senate is a `SenateIntervenes` rule from `base-government-senate`, `civ1-unit:player/senate-intervenes`
(`RuleIds.SENATE_RULE`), returned with the unit actions by `Rules/Unit/action`. The actions ask the rules of the registry
passed to `action()`, the one its rules are registered in, so a rule set can add a `SenateIntervenes` rule of its own or
replace this one by id.

## Railroads and cities

As in v474.05, Settlers can't build a Railroad on a city's square, and a land unit moves for nothing from a square with
a Railroad and a Road to one with a Road, so a train runs into a city, which has no Railroad, for nothing, and out of it
for a road move (civ-clone/web-renderer#1029). Each is a rule a rule set can supersede by id, as `civ1-enhanced`'s
`railroads-in-cities` does:

- `civ1-unit:tile-improvement/build-on-city-square/no-railroad` (`RuleIds.NO_RAILROAD_IN_CITIES_RULE`), a
  `BuildOnCitySquare` rule (`Rules/BuildOnCitySquare`), returned with the unit actions by `Rules/Unit/action`. Every
  tile improvement's action asks these rules on a city's square, with `Available`'s arguments, and any that answers
  `false` refuses it.
- `civ1-unit:unit/movement-cost/railroad` (`RuleIds.RAILROAD_MOVEMENT_RULE`), a `MovementCost` rule. v474.05 gives this
  only to the human's units moving by hand, not to the computer players' or to a goto (civ-clone/web-renderer#1134):
  not followed here.
