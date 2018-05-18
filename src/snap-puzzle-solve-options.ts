/**
 * @module jqSnapPuzzle
 *//** */
/**
 * Options for [[SnapPuzzleGame.solve]]
 */
export interface SnapPuzzleSolveOptions{
    /**
     * If false, the change event won't be emitted
     */
    emitChange?:boolean
    /**
     * If false, the animation won't be performed
     */
    animate?:boolean;
}