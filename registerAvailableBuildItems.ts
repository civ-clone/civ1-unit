import {
  Catapult,
  Chariot,
  Horseman,
  Knight,
  Musketman,
  Sail,
  Settlers,
  Spearman,
  Swordman,
  Trireme,
  Warrior,
} from './Units';
import { instance as availableCityBuildItemsRegistryInstance } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';

availableCityBuildItemsRegistryInstance.register(
  Catapult,
  Chariot,
  Horseman,
  Knight,
  Musketman,
  Sail,
  Settlers,
  Spearman,
  Swordman,
  Trireme,
  Warrior
);
