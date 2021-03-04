import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';
import action from './Rules/Unit/action';
import activate from './Rules/Unit/activate';
import build from './Rules/City/build';
import buildCost from './Rules/City/buildCost';
import buildingComplete from './Rules/City/buildingComplete';
import created from './Rules/Unit/created';
import defeated from './Rules/Unit/defeated';
import destroyed from './Rules/Unit/destroyed';
import lostAtSea from './Rules/Unit/lostAtSea';
import moved from './Rules/Unit/moved';
import movementCost from './Rules/Unit/movementCost';
import playerAction from './Rules/Player/action';
import unitYield from './Rules/Unit/yield';
import validateMove from './Rules/Unit/validateMove';

ruleRegistryInstance.register(
  ...action(),
  ...activate(),
  ...build(),
  ...buildCost(),
  ...buildingComplete(),
  ...created(),
  ...defeated(),
  ...destroyed(),
  ...lostAtSea(),
  ...moved(),
  ...movementCost(),
  ...playerAction(),
  ...unitYield(),
  ...validateMove()
);
