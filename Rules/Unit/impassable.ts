import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Impassable from '@civ-clone/core-world-path/Rules/Impassable';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import treatyPartner from '../../lib/treatyPartner';

export const getRules: (
  interactionRegistry?: InteractionRegistry,
  tileImprovementRegistry?: TileImprovementRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => Impassable[] = (
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): Impassable[] => [
  new Impassable(
    // Routes go round a treaty partner's land, so following one (a GoTo, a computer player's route) never breaks a
    //  treaty by accident (#287). Only a step from land onto land asks, as `action/sneak-move` does.
    'civ1-unit:unit/impassable/treaty-partners-land',
    new Criterion((unit: Unit, to: Tile, from: Tile): boolean => from.isLand()),
    new Criterion(
      (unit: Unit, to: Tile): boolean =>
        treatyPartner(
          unit,
          to,
          interactionRegistry,
          tileImprovementRegistry,
          workedTileRegistry
        ) !== null
    ),
    new Effect((): boolean => true)
  ),
];

export default getRules;
