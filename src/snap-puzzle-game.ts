/**
 * @module jqSnapPuzzle
 *//** */
import {SnapPuzzleOptions} from "./snap-puzzle-options";
import {SnapPuzzlePiece} from "./snap-puzzle-piece";
import {
    SnapPuzzleEvents,
    SnapPuzzlePieceDropEvent
} from "./snap-puzzle-events";
/**
 * Puzzle game
 */
export class SnapPuzzleGame{
    /**
     * Root element of the plugin
     */
    protected element: JQuery;
    /**
     * Current options
     */
    protected options: SnapPuzzleOptions;
    /**
     * Disabled state
     */
    protected disabled: boolean;
    /**
     * Width of the image
     */
    protected imageWidth:number;
    /**
     * Height of the image
     */
    protected imageHeight:number;
    /**
     * Width for each piece
     */
    protected pieceWidth:number;
    /**
     * Height for each piece
     */
    protected pieceHeight:number;
    /**
     * Source of the image
     */
    protected src:string;
    /**
     * Wrapper element for the widget.
     */
    protected wrapperEl:JQuery;
    /**
     * All the SnapPuzzlePieces that conforms the puzzle
     */
    protected pieces:SnapPuzzlePiece[];
    /**
     * All the SnapPuzzlePieces as matrix
     */
    protected piecesMatrix:SnapPuzzlePiece[][];
    /**
     * Jquery object with all the slots
     */
    protected slotsEls:JQuery;
    /**
     * Jquery object with all the pieces
     */
    protected piecesEls:JQuery;
    /**
     * Jquery element that will contain all the slots
     */
    protected slotsContainerEl:JQuery;
    /**
     * Jquery element that will contain all the pieces
     */
    protected piecesContainerEl:JQuery;
    /**
     * Control of the resize event
     */
    protected resizeTimeout:any;
    /**
     * Number of pieces completed
     */
    protected completed:number;
    /**
     * Destroy the component
     */
    destroy(){
        this.element.removeClass([this.options.classes.disabled,this.options.classes.root,this.options.classes.completed]);
        this.element.off("."+this.options.namespace);
        this.element.insertAfter(this.wrapperEl);
        this.wrapperEl.remove();
        //@ts-ignore
        this._super();
    }
    /**
     * Disable the widget
     */
    disable() {
        //@ts-ignore
        this._super();
        this.element.addClass(this.options.classes.disabled);
        this.wrapperEl.addClass(this.options.classes.disabled);
        for(let piece of this.pieces){
            //@ts-ignore
            piece.disable();
        }
    }

    /**
     * Enable the widget
     */
    enable() {
        //@ts-ignore
        this._super();
        this.element.removeClass(this.options.classes.disabled);
        this.wrapperEl.removeClass(this.options.classes.disabled);
        for(let piece of this.pieces){
            //@ts-ignore
            piece.enable();
        }
    }

    /**
     * Refresh the dimensions
     */
    refresh(){
        this._resolveDimensions();
        const pieces = this.pieces;
        for(let piece of pieces){
            piece.refresh();
        }
    }

    /**
     * Reset the puzzle
     */
    reset(){
        this.completed = 0;
        this.wrapperEl.removeClass(this.options.classes.completed);
        this.element.removeClass(this.options.classes.completed);
        let pieces = this.pieces;
        for(let piece of pieces){
            piece.reset();
        }
        this.element.trigger(SnapPuzzleEvents.reset);
    }
    /**
     * JQuery ui function to get the default options
     * @protected
     */
    protected _getCreateOptions() {
        let options: SnapPuzzleOptions = {
            columns:0,
            rows:0,
            namespace: "jq-snap-puzzle",
            classes: {//css classes for elements
                root: "c-snap-puzzle__image",
                wrapper:"c-snap-puzzle",
                completed:"c-snap-puzzle--completed",
                disabled: "c-snap-puzzle--disabled",
                piecesContainer:"c-snap-puzzle__pieces-container",
                slotsContainer:"c-snap-puzzle__slots-container",
                piece:"c-snap-puzzle__piece",
                pieceIncorrect:"c-snap-puzzle__piece--incorrect",
                pieceCorrect:"c-snap-puzzle__piece--correct",
                pieceDisabled:"c-snap-puzzle__piece--disabled",
                slot:"c-snap-puzzle__slot",
                slotHasPiece:"c-snap-puzzle__slot--has-piece",
                slotIncorrect:"c-snap-puzzle__slot--incorrect",
                slotCorrect:"c-snap-puzzle__slot--correct",
                slotDisabled:"c-snap-puzzle__slot--disabled"
            },
            onlyDropOnValid:false,
            feedbackOnHover:true,
            backgroundInSlots:true,
            randomPieceStartPosition:true
        };
        return options;
    }

    /**
     * Creates the container for pieces
     * @returns {JQuery}
     * @protected
     */
    protected _createPiecesContainer():JQuery{
        let result: JQuery;
        if ((typeof this.options.createPiecesContainer).toLowerCase() == "function") {
            result = this.options.createPiecesContainer.apply(this, arguments);
        } else {
            result = $(`<div class="${this.options.classes.piecesContainer}"></div>`);
        }
        return result;
    }

    /**
     * Creates the container for slots
     * @returns {JQuery}
     * @protected
     */
    protected _createSlotsContainer():JQuery{
        let result: JQuery;
        if ((typeof this.options.createSlotsContainer).toLowerCase() == "function") {
            result = this.options.createSlotsContainer.apply(this, arguments);
        } else {
            result = $(`<div class="${this.options.classes.slotsContainer}"></div>`);
        }
        return result;
    }

    /**
     * Creates the wrapper for the widget
     * @returns {JQuery}
     * @protected
     */
    protected _createWrapper():JQuery{
        let result: JQuery;
        if ((typeof this.options.createWrapper).toLowerCase() == "function") {
            result = this.options.createWrapper.apply(this, arguments);
        } else {
            result = $(`<div></div>`);
        }
        return result;
    }

    /**
     * Creates each piece
     * @param x
     * @param y
     * @returns {JQuery}
     * @protected
     */
    protected _createPiece(x,y):JQuery{
        let result: JQuery;
        if ((typeof this.options.createPiece).toLowerCase() == "function") {
            result = this.options.createPiece.apply(this, arguments);
        } else {
            result = $(`<div class="${this.options.classes.piece}"></div>`);
        }
        return result;
    }

    /**
     * Creates each slot
     * @param x
     * @param y
     * @returns {JQuery}
     * @protected
     */
    protected _createSlot(x,y):JQuery{
        let result: JQuery;
        if ((typeof this.options.createSlot).toLowerCase() == "function") {
            result = this.options.createSlot.apply(this, arguments);
        } else {
            result = $(`<div class="${this.options.classes.slot}"></div>`);
        }
        return result;
    }

    /**
     * Initialize t he SnapPuzzlePiece for a piece and slot
     * @param x
     * @param y
     * @returns {SnapPuzzlePiece}
     * @protected
     */
    protected _constructPiece(x,y):SnapPuzzlePiece{
        let pieceEl = this._createPiece(x,y),
            slotEl = this._createSlot(x,y).attr("data-x",x).attr("data-y",y),
            piece = new SnapPuzzlePiece({
                puzzle:this,
                pieceEl:pieceEl,
                slotEl:slotEl,
                x:x,
                y:y
            });
        return piece;
    }

    /**
     * Creation of the widget
     * @protected
     */
    protected _create(){
        if(this.element.is("img")){
            let src = this.element.attr("src");
            this.src = src;
            this.element.addClass(this.options.classes.root);
            this.wrapperEl = this._createWrapper();
            this.wrapperEl.addClass(this.options.classes.wrapper);
            this.piecesContainerEl = this.options.appendPiecesTo != undefined ? $(this.options.appendPiecesTo) : this._createPiecesContainer();
            this.slotsContainerEl = this._createSlotsContainer();
            if(this.options.appendPiecesTo == undefined){
                this.wrapperEl.append(this.piecesContainerEl);
            }
            this.wrapperEl.append(this.slotsContainerEl);
            this.wrapperEl.insertAfter(this.element);
            this.slotsContainerEl.append(this.element);
            this.pieces = [];
            this.piecesMatrix = [];
            this.completed = 0;
            if((this.options.width && this.options.height) || (this.element.width() != Infinity && this.element.height() != Infinity)){
                this._onImageLoaded();
            }else{
                this.element.one("load",this._onImageLoaded.bind(this));
            }
            this.element.on(SnapPuzzleEvents.pieceDrop,this._onPieceDrop.bind(this));
        }else{
            throw "[SnapPuzzleGame] The widget must be initialized for <img> elements";
        }
    }

    /**
     * Invoked when the wrapper dimensions changes. Updates the pieces and slots
     */
    protected _onResize(){
        this.refresh();
    }
    /**
     * Invoked when a piece is dropped inside of the pieces container. Resets the classes
     * @param e
     * @param ui
     */
    protected _onDrop(e,ui){
        let snapPiece:SnapPuzzlePiece = ui.draggable.data(SnapPuzzlePiece.DATA_KEY);
        if(snapPiece && snapPiece.pieceDroppedInto){
            snapPiece.pieceDroppedInto.pieceDropped = null;
            snapPiece.pieceDroppedInto = null;
        }
        ui.draggable.removeClass([this.options.classes.pieceIncorrect,this.options.classes.pieceCorrect]);
    }
    protected _resolveDimensions(){
        this.imageWidth = (this.options.width || this.element.width());
        this.imageHeight = (this.options.height || this.element.height());
        this.pieceWidth = this.imageWidth/this.options.rows;
        this.pieceHeight = this.imageHeight/this.options.columns;
    }
    /**
     * Invoked when the image has been loaded
     * @protected
     */
    protected _onImageLoaded(){
        //wait for image to load
        let rows = this.options.rows,
            columns = this.options.columns,
            piecesEls = [],
            slotsEls = [],
            numPieces = columns*rows;
        this._resolveDimensions();
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            let piecesRow = [];
            for(let columIndex = 0; columIndex < columns; columIndex++){
                let piece = this._constructPiece(columIndex,rowIndex);
                slotsEls.push(piece.slotEl.get(0));
                piecesEls.push(piece.pieceEl.get(0));
                piecesRow.push(piece);
                this.pieces.push(piece);
                piece.slotEl.appendTo(this.slotsContainerEl);
            }
            this.piecesMatrix[rowIndex]=piecesRow;
        }
        this.slotsEls = $(slotsEls);
        this.piecesEls = $(piecesEls);
        //shuffle
        this.pieces.sort(()=>Math.floor(Math.random() * numPieces));
        //append
        for(let piece of this.pieces){
            piece.pieceEl.appendTo(this.piecesContainerEl);
        }
        this.piecesContainerEl.droppable({
            //@ts-ignore
            accept: "."+this.options.classes.piece,
            drop:this._onDrop.bind(this)
        });
        this._throttleResize();
    }

    /**
     * Invoked when a piece is placed.
     * If the piece is correct, increment the completed counter.
     * When all the pieces are placed correctly, triggers the [[SnapPuzzleEvents.end]] event
     * @param e
     * @param {SnapPuzzlePieceDropEvent} data
     * @protected
     */
    protected _onPieceDrop(e,data:SnapPuzzlePieceDropEvent){
        if(data.isCorrect){
            this.completed++;
        }
        if(this.completed == this.pieces.length){
            this._complete();
        }
    }

    /**
     * Mark the widget as completed
     * Triggers the [[SnapPuzzleEvents.end]] event
     * @private
     */
    protected _complete(){
        this.wrapperEl.addClass(this.options.classes.completed);
        this.element.addClass(this.options.classes.completed);
        this.element.trigger(SnapPuzzleEvents.completed,this);
    }
    protected _onNativeResize(){
        if(this.resizeTimeout){
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(this._onResize.bind(this),200);
    }
    protected _throttleResize () {
        $(window).on("resize", this._onNativeResize.bind(this));
    };
}