/**
 * @module jqSnapPuzzle
 *//** */
/**
 * Options for the plugin
 *
 * All the options could be updated using the jquery ui widget method
 *
 * **Please note**, when some options are updated, the markup of the widget is re-created and the progress of the puzzle will be lost.
 *
 * @example For example
 * ```typescript
 * $("someSelector").snapPuzzle("option","rows",4);
 * ```
 *
 * **For multiple options**
 * Because set options could reconstruct the component, if more that one option will be provided, pass an object instead of key-value
 * @example Multiple options
 * * ```typescript
 * $("someSelector").snapPuzzle("option",{
 *      columns:4,
 *      rows:2,
 *      backgroundInSlots:false
 * });
 * ```
 *
 */
export interface SnapPuzzleOptions{
    /**
     * Num of rows for the puzzle.
     * Update this option will reconstruct the markup and the progress will be lost
     */
    rows:number;
    /**
     * Num of columns for the puzzle.
     * Update this option will reconstruct the markup and the progress will be lost
     */
    columns:number;
    /**
     * Initial width of the image.
     * If it's provided, will be used for the initialization instead of wait for the image to be loaded
     */
    width?:number;
    /**
     * Initial height of the image.
     * If it's provided, will be used for the initialization instead of wait for the image to be loaded
     */
    height?:number;
    /**
     * Namespace for events.
     * Update this option will reconstruct the markup and the progress will be lost
     * @default jq-crossword
     */
    namespace?: string;
    /**
     * Disable the widget
     * @default false
     */
    disabled?:boolean;
    /**
     * Number of pieces to resolve from the beginning
     * @default 0
     */
    hints?:number;
    /**
     * Css classes to use.
     *
     * Update this option will reconstruct the markup and the progress will be lost.
     */
    classes?: {
        /**
         * Root element
         * @default `c-snap-puzzle__image`
         */
        root?: string;
        /**
         * Class for the wrapper and the root element for when the puzzle is completed
         * @default `c-snap-puzzle--completed`
         */
        completed?:string;
        /**
         * Class for the disabled state
         * @default `c-snap-puzzle--disabled`
         */
        disabled?: string;
        /**
         * Class for the wrapper
         * @default `c-snap-puzzle`
         */
        wrapper?:string;
        /**
         * Class for the pieces container
         * @default `c-snap-puzzle__pieces-container`
         */
        piecesContainer?:string;
        /**
         * Class for the slots container
         * @default `c-snap-puzzle__slots-container`
         */
        slotsContainer;
        /**
         * Class for the pieces
         * @default `c-snap-puzzle__piece`
         */
        piece?:string;
        /**
         * Class for the piece when has been dropped or is hover an incorrect slot
         * @default `c-snap-puzzle__piece--incorrect`
         */
        pieceIncorrect?:string;
        /**
         * Class for the piece when has been dropped or is hover a correct slot
         * @default `c-snap-puzzle__piece--correct`
         */
        pieceCorrect?:string;
        /**
         * Class for the disabled pieces
         * @default `c-snap-puzzle__piece--disabled`
         */
        pieceDisabled?:string;
        /**
         * Class for the slots
         * @default `c-snap-puzzle__slot`
         */
        slot?:string;
        /**
         * Class for the slots when have a piece placed
         * @default `c-snap-puzzle__slot--has-piece`
         */
        slotHasPiece?:string;
        /**
         * Class for the slot when the incorrect piece is hover or has been dropped
         * @default `c-snap-puzzle__slot--incorrect`
         */
        slotIncorrect?:string;
        /**
         * Class for the slot when the correct piece is hover or has been dropped
         * @default `c-snap-puzzle__slot--correct`
         */
        slotCorrect?:string;
        /**
         * Class for the disabled slots
         * @default `c-snap-puzzle__slot--disabled`
         */
        slotDisabled?:string;
        /**
         * Class for the wrapper when the feedbackOnHover option is true
         * @default `c-snap-puzzle--feedback-on-hover`
         */
        feedbackOnHover?:string;
        /**
         * Class for the wrapper when the backgroundInSlots option is true
         * @default `c-snap-puzzle--slots-background`
         */
        backgroundInSlots?:string;
    };
    /**
     * If true, the pieces only could be dropped in the correct slots.
     * If the piece is dropped in an incorrect slot, will be reverted to the previous position
     * @default false
     */
    onlyDropOnValid?:boolean;
    /**
     * Add the feedback class to the piece when is above the correct or incorrect slot
     * @see [[classes.pieceIncorrect]]
     * @see [[classes.pieceCorrect]]
     * @default false
     */
    feedbackOnHover?:boolean;
    /**
     * Add the background to the slots
     * @default true
     */
    backgroundInSlots?:boolean;
    /**
     * Randomize the starting position of the pieces
     * @default false
     */
    randomPieceStartPosition?:boolean;
    /**
     * Override the default creation of the pieces container
     * @returns {JQuery}
     * @example ```typescript
     * $(".puzzle").snapPuzzle({
     *      createPiecesContainer:()=>{
     *          return $(`<div class="my-custom-element"></div>`);
     *      }
     * })```
     * @see [[SnapPuzzleWrapper._createPiecesContainer]]
     */
    createPiecesContainer?(): JQuery;
    /**
     * Override the default creation of the slots container
     * The slots container will be appended to the wrapper
     * @returns {JQuery}
     * @example ```typescript
     * $(".puzzle").snapPuzzle({
     *      createSlotsContainer:()=>{
     *          return $(`<div class="my-custom-element"></div>`);
     *      }
     * })```
     * @see [[SnapPuzzleWrapper._createSlotsContainer]]
     */
    createSlotsContainer?(): JQuery;
    /**
     * Override the default creation of each piece.
     * The piece is the draggable item of the puzzle
     * @returns {JQuery}
     * @example ```typescript
     * $(".puzzle").snapPuzzle({
     *      createPiece:()=>{
     *          return $(`<div class="my-custom-element"></div>`);
     *      }
     * })```
     * @see [[SnapPuzzleWrapper._createPiece]]
     */
    createPiece?(): JQuery;
    /**
     * Override the default creation of each slot.
     * The slot is where the piece of the puzzle could be dropped
     * @returns {JQuery}
     * @example ```typescript
     * $(".puzzle").snapPuzzle({
     *      createSlot:()=>{
     *          return $(`<div class="my-custom-element"></div>`);
     *      }
     * })```
     * @see [[SnapPuzzleWrapper._createSlot]]
     */
    createSlot?(): JQuery;
    /**
     * Override the default creation of the wrapper
     * @returns {JQuery}
     * @example ```typescript
     * $(".puzzle").snapPuzzle({
     *      createWrapper:()=>{
     *          return $(`<div class="my-custom-element"></div>`);
     *      }
     * })```
     * @see [[SnapPuzzleWrapper._createWrapper]]
     */
    createWrapper?(): JQuery;
    /**
     * Where to append the puzzle pieces
     * By default the list will be appended to the pieces container
     * If this option is provided, [[createPiecesContainer]] will **not** be invoked
     */
    appendPiecesTo?: Element | JQuery | string;
}