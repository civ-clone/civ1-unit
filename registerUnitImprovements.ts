import { Fortified, Veteran } from './UnitImprovements';
import { instance as availableUnitImprovementRegistryInstance } from '@civ-clone/core-unit-improvement/AvailableUnitImprovementRegistry';

availableUnitImprovementRegistryInstance.register(Fortified, Veteran);
