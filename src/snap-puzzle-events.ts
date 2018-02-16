/**
 * @module jqSnapPuzzle
 *//** */


import {SnapPuzzleGame} from "./snap-puzzle-game";
import {SnapPuzzlePiece} from "./snap-puzzle-piece";

/**
 * pieceDrop event data
 * @example
 * ```typescript
 * $("someSelector").on("snapPuzzle:pieceDrop",(e,data:SnapPuzzlePieceDropEvent)=>{
 *      console.log(data);
 * });
 * ```
 */
export interface SnapPuzzlePieceDropEvent{
    /**
     * Instance of snapPuzzle that triggers the event
     */
    instance:SnapPuzzleGame;
    /**
     * Instance of SnapPuzzlePiece for the piece that has been dropped
     */
    piece:SnapPuzzlePiece;
    /**
     * Instance of SnapPuzzlePiece for the slot where the piece has been dropped
     */
    slot:SnapPuzzlePiece;
    /**
     * The piece has been dropped in the correct slot
     */
    isCorrect:boolean;
}
/**
 * Available events
 */
export enum SnapPuzzleEvents{
    /**
     * Triggered when a piece is dropped in a slot
     * When a piece is dropped in the correct slot, the piece is automatically disabled
     * @see [[SnapPuzzlePieceDropEvent]]
     * @example
     * ```typescript
     * $("someSelector").on(SnapPuzzleEvents.pieceDrop,(e,data:SnapPuzzlePieceDropEvent)=>{
     *      console.log(data)
     *  });
     * ```
     */
    pieceDrop = "snapPuzzle:pieceDrop",
    /**
     * Triggered when the puzzle is reset.
     * The instance of the snap puzzle is passed as second argument
     * @example
     * ```typescript
     * $("someSelector").on(SnapPuzzleEvents.reset,(e,snapPuzzleWidgetInstance)=>{
     *      console.log(snapPuzzleWidgetInstance)
     * });
     * ```
     */
    reset = "snapPuzzle:reset",
    /**
     * Triggered when all the pieces of the puzzle are placed correctly.
     * The instance of the snap puzzle is passed as second argument.
     * @example
     * ```typescript
     * $("someSelector").on(SnapPuzzleEvents.completed,(e,snapPuzzleWidgetInstance)=>{
     *      console.log(snapPuzzleWidgetInstance)
     * });
     * ```
     */
    complete = "snapPuzzle:complete"
}