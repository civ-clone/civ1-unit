import UnitTraits from '@civ-clone/core-unit/Rules/UnitTraits';
/** The prefix of every trait declaration's id: `civ1-unit:unit/trait/<Unit>/<Trait>`. */
export declare const TRAIT_RULE_PREFIX = 'civ1-unit:unit/trait';
/**
 * What each Civ1 unit type can do beyond what its domain (`Land`, `Naval`, `Air`) gives it. Each list names leaf
 *  classes, never an abstract one, so a unit added later gets no trait by accident. Together they say exactly what the
 *  `Fortifiable`, `Diplomatic` and `Worker` classes and the leaf-class checks say today (`tests/traitEquivalence`).
 */
export declare const getRules: () => UnitTraits[];
export default getRules;
