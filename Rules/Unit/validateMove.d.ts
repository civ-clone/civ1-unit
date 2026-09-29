import ValidateMove from '@civ-clone/core-unit/Rules/ValidateMove';
/**
 * A unit short of the moves a step costs gets there when its remaining moves
 * reach this fraction of the cost, scaled by a random draw: always with at
 * least half the cost left, otherwise with a chance of `remaining / (cost × this)`.
 * `expectedMovementCost` prices routes from the same number.
 */
export declare const shortfallFactor = 0.5;
export declare const getRules: (
  randomNumberGenerator?: () => number
) => ValidateMove[];
export default getRules;
