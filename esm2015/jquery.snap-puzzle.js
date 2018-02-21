/**
 * @license jq-snap-puzzle v0.0.1
 * (c) 2018 Finsi, Inc.
 */

/**
 * @module jqSnapPuzzle
 */ /** */
/**
 * Available events
 */
var SnapPuzzleEvents;
(function (SnapPuzzleEvents) {
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
    SnapPuzzleEvents["pieceDrop"] = "snapPuzzle:pieceDrop";
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
    SnapPuzzleEvents["reset"] = "snapPuzzle:reset";
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
    SnapPuzzleEvents["complete"] = "snapPuzzle:complete";
})(SnapPuzzleEvents || (SnapPuzzleEvents = {}));

/**
 * Represents a piece and the related slot.
 * **Note:** When a piece is dropped in the correct slot, the piece is automatically disabled
 */
class SnapPuzzlePiece {
    constructor(params) {
        /**
         * The piece is completed
         */
        this.completed = false;
        if (params.puzzle != undefined) {
            this.puzzle = params.puzzle;
        }
        if (params.pieceEl != undefined) {
            this.pieceEl = params.pieceEl;
            this.pieceNativeEl = this.pieceEl.get(0);
        }
        if (params.slotEl != undefined) {
            this.slotEl = params.slotEl;
            this.slotNativeEl = this.slotEl.get(0);
        }
        if (params.x != undefined) {
            this.x = params.x;
        }
        if (params.y != undefined) {
            this.y = params.y;
        }
        this.slotEl.data(SnapPuzzlePiece.DATA_KEY, this);
        this.pieceEl.data(SnapPuzzlePiece.DATA_KEY, this);
        this.refresh();
        this.initDraggable();
        this.initDroppable();
    }
    /**
     * Refresh the images
     */
    refresh() {
        this.pieceEl.css({
            //@ts-ignore
            width: this.puzzle.pieceWidth,
            //@ts-ignore
            height: this.puzzle.pieceHeight,
            //@ts-ignore
            backgroundImage: 'url(' + this.puzzle.src + ')',
            //@ts-ignore
            backgroundPosition: (-this.x * this.puzzle.pieceWidth) + 'px ' + (-this.y * this.puzzle.pieceHeight) + 'px',
            //@ts-ignore
            backgroundSize: this.puzzle.imageWidth + 'px ' + this.puzzle.imageHeight + 'px'
        });
        this.slotEl.css({
            //@ts-ignore
            width: this.puzzle.pieceWidth,
            //@ts-ignore
            height: this.puzzle.pieceHeight,
            //@ts-ignore
            top: this.y * this.puzzle.pieceHeight,
            //@ts-ignore
            left: this.x * this.puzzle.pieceWidth
        });
        //@ts-ignore
        if (this.puzzle.options.backgroundInSlots) {
            this.slotEl.css({
                //@ts-ignore
                backgroundImage: 'url(' + this.puzzle.src + ')',
                //@ts-ignore
                backgroundPosition: (-this.x * this.puzzle.pieceWidth) + 'px ' + (-this.y * this.puzzle.pieceHeight) + 'px',
                //@ts-ignore
                backgroundSize: this.puzzle.imageWidth + 'px ' + this.puzzle.imageHeight + 'px'
            });
        }
        else {
            this.slotEl.css({
                //@ts-ignore
                backgroundImage: '',
                //@ts-ignore
                backgroundPosition: '',
                //@ts-ignore
                backgroundSize: ''
            });
        }
        if (this.pieceDroppedInto == undefined) {
            //@ts-ignore
            if (this.puzzle.options.randomPieceStartPosition) {
                this.pieceEl.css({
                    //@ts-ignore
                    left: Math.floor((Math.random() * ((this.puzzle.piecesContainerEl.width() - this.pieceEl.width()) + 1))),
                    //@ts-ignore
                    top: Math.floor((Math.random() * ((this.puzzle.piecesContainerEl.height() - this.pieceEl.height()) + 1)))
                });
            }
            else {
                this.pieceEl.css({
                    left: "",
                    top: ""
                });
            }
        }
        else if (this.pieceDropped != undefined) {
            this.pieceDropped.pieceEl.position({ my: "left top", at: "left top", of: this.slotEl, collision: "none" });
        }
    }
    /**
     * Reset the piece to the initial state. Remove the piece from the slot
     */
    reset() {
        this.completed = false;
        this.pieceDropped = null;
        this.pieceDroppedInto = null;
        this.refresh();
        //@ts-ignore
        if (!this.puzzle.options.disabled) {
            this.enable();
        }
    }
    /**
     * Solve the piece moving it to the correct slot
     * @param [triggerEvent] If false, the event pieceDrop will not be triggered
     */
    solve(triggerEvent = true) {
        if (!this.completed) {
            //set the position of the piece
            this.pieceEl.position({
                my: "left top",
                at: "left top",
                of: this.slotEl,
                collision: "none",
                using: (position, data) => {
                    //simulate dragging styles
                    this.pieceEl.addClass("ui-draggable-dragging");
                    //calculate the distance, the duration of the animation will be related to the distance
                    let offsetElement = data.element.element.offset(), offsetTarget = data.target.element.offset(), distance = Math.sqrt(Math.pow(offsetTarget.left - offsetElement.left, 2) + Math.pow(offsetTarget.top - offsetElement.top, 2));
                    this.pieceEl.animate({
                        top: position.top,
                        left: position.left
                    }, Math.min(2000, distance * 2), () => {
                        this.pieceEl.removeClass("ui-draggable-dragging");
                        //call the drop
                        this.onDrop({}, {
                            draggable: this.pieceEl
                        }, triggerEvent);
                    });
                }
            });
        }
    }
    /**
     * Invoked when a piece is dropped in this slot
     * When a piece is dropped in the correct slot, the piece is automatically disabled
     * @param e
     * @param ui
     */
    onDrop(e, ui, triggerEvent = true) {
        let item = ui.draggable, itemNativeEl = item.get(0);
        //if any piece has been dropped in the slot or the piece dropped is the current one) and (if the "onlyDropOnValid" is false or the piece dropped is the correct one
        //a piece could not be dropped in a slot that already has a piece
        //an incorrect piece could not be dropped in a slot if the option "onlyDropOnValid" is true
        //@ts-ignore
        if ((this.pieceDropped == undefined || this.pieceDropped.pieceNativeEl == itemNativeEl) && (this.puzzle.options.onlyDropOnValid == false || itemNativeEl == this.pieceNativeEl)) {
            const piece = item.data(SnapPuzzlePiece.DATA_KEY);
            //reset the pieceDropped of the previous slot
            if (piece.pieceDroppedInto) {
                piece.pieceDroppedInto.pieceDropped = null;
            }
            //store for the piece where has been dropped
            piece.pieceDroppedInto = this;
            //store the piece dropped in this slot
            this.pieceDropped = piece;
            //if the piece is correct
            if (itemNativeEl == this.pieceNativeEl) {
                this.completed = true;
                //@ts-ignore
                item.removeClass(this.puzzle.options.classes.pieceIncorrect).addClass(this.puzzle.options.classes.pieceCorrect);
                //@ts-ignore
                this.slotEl.removeClass(this.puzzle.options.classes.slotIncorrect).addClass(this.puzzle.options.classes.slotCorrect);
                this.slotEl.droppable("disable");
                item.draggable("disable");
            }
            else {
                //@ts-ignore
                item.removeClass(this.puzzle.options.classes.pieceCorrect).addClass(this.puzzle.options.classes.pieceIncorrect);
                //@ts-ignore
                this.slotEl.removeClass(this.puzzle.options.classes.slotCorrect).addClass(this.puzzle.options.classes.slotIncorrect);
            }
            //force the position of the piece to the slot because the piece could be dropped with a tolerance margin (not exactly in the bounds of the slot)
            item.position({
                my: "left top",
                at: "left top",
                of: this.slotEl,
                collision: "none",
                using: (position) => {
                    item.animate({
                        top: position.top,
                        left: position.left
                    }, 200);
                }
            });
            if (triggerEvent) {
                //@ts-ignore
                this.puzzle.element.trigger(SnapPuzzleEvents.pieceDrop, {
                    instance: this.puzzle,
                    piece: piece,
                    slot: this,
                    isCorrect: this.completed
                });
            }
        }
    }
    /**
     * Resolve if the dropped piece must be revertd
     * @param target
     * @returns {boolean}
     */
    resolveRevert(target) {
        let allow = false;
        //if the target is an element. when the target is invalid is a false
        if (target) {
            let data = target.data(SnapPuzzlePiece.DATA_KEY);
            //check if there is a piece dropped
            if (data == undefined || data.pieceDropped == undefined || data.pieceDropped.pieceNativeEl == this.pieceNativeEl) {
                //@ts-ignore
                if (target.hasClass(this.puzzle.options.classes.slot)) {
                    //if the onlyDropOnValid is true, the piece must be te correct one
                    //@ts-ignore
                    allow = this.puzzle.options.onlyDropOnValid == false || target.get(0) == this.slotNativeEl;
                    //@ts-ignore
                }
                else if (target.is(this.puzzle.piecesContainerEl)) {
                    //if the target is the pieces container, check if the piece has been dropped inside
                    let itemRect = this.pieceEl.get(0).getBoundingClientRect(), targetRect = target.get(0).getBoundingClientRect();
                    allow = (itemRect.left >= targetRect.left && itemRect.right <= targetRect.right) && (itemRect.top >= targetRect.top && itemRect.bottom <= targetRect.bottom);
                }
            }
        }
        if (!allow) {
            this.onRevert(target);
        }
        return !allow;
    }
    /**
     * Invoked when a piece is reverted.
     * Revert the state classes
     * @param {JQuery} slot
     */
    onRevert(slot) {
        let classToAdd, classToRemove;
        if (this.completed) {
            //@ts-ignore
            classToRemove = this.puzzle.options.classes.pieceIncorrect;
            //@ts-ignore
            classToAdd = this.puzzle.options.classes.pieceCorrect;
        }
        else if (this.pieceDroppedInto) {
            //@ts-ignore
            classToAdd = this.puzzle.options.classes.pieceIncorrect;
            //@ts-ignore
            classToRemove = this.puzzle.options.classes.pieceCorrect;
        }
        else {
            //@ts-ignore
            classToRemove = [this.puzzle.options.classes.pieceIncorrect, this.puzzle.options.classes.pieceCorrect];
        }
        this.pieceEl.removeClass(classToRemove).addClass(classToAdd);
        if (slot) {
            let slotPiece = slot.data(SnapPuzzlePiece.DATA_KEY), classToAddToSlot, classToRemoveFromSlot;
            if (slotPiece) {
                if (slotPiece.completed) {
                    //@ts-ignore
                    classToRemoveFromSlot = this.puzzle.options.classes.pieceIncorrect;
                    //@ts-ignore
                    classToAddToSlot = this.puzzle.options.classes.pieceCorrect;
                }
                else if (slotPiece.pieceDropped) {
                    //@ts-ignore
                    classToAddToSlot = this.puzzle.options.classes.pieceIncorrect;
                    //@ts-ignore
                    classToRemoveFromSlot = this.puzzle.options.classes.pieceCorrect;
                }
                else {
                    //@ts-ignore
                    classToRemoveFromSlot = [this.puzzle.options.classes.pieceIncorrect, this.puzzle.options.classes.pieceCorrect];
                }
                slot.removeClass(classToRemoveFromSlot).addClass(classToAddToSlot);
            }
        }
    }
    /**
     * Invoked when a piece starts to been dragged. Resets the classes
     * @param e
     * @param ui
     */
    onStart(e, ui) {
        //@ts-ignore
        this.pieceEl.removeClass([this.puzzle.options.classes.pieceIncorrect, this.puzzle.options.classes.pieceCorrect]);
    }
    /**
     * Invoked when the piece is over a slot. Add the correct/incorrect classes
     * This function is invoked only when the feedbackOnHover option is true
     * @param e
     * @param ui
     */
    over(e, ui) {
        const item = ui.draggable, itemNativeEl = item.get(0);
        //@ts-ignore
        if (this.pieceDropped == undefined || this.pieceDropped.pieceNativeEl == itemNativeEl) {
            //@ts-ignore
            if (itemNativeEl == this.pieceNativeEl) {
                //@ts-ignore
                item.removeClass(this.puzzle.options.classes.pieceIncorrect).addClass(this.puzzle.options.classes.pieceCorrect);
                //@ts-ignore
                this.slotEl.removeClass(this.puzzle.options.classes.slotIncorrect).addClass(this.puzzle.options.classes.slotCorrect);
            }
            else {
                //@ts-ignore
                item.removeClass(this.puzzle.options.classes.pieceCorrect).addClass(this.puzzle.options.classes.pieceIncorrect);
                //@ts-ignore
                this.slotEl.removeClass(this.puzzle.options.classes.slotCorrect).addClass(this.puzzle.options.classes.slotIncorrect);
            }
        }
    }
    /**
     * Invoked when a piece exists from the bounds of a slot. Resets the classes
     * @param e
     * @param ui
     */
    out(e, ui) {
        //@ts-ignore
        this.slotEl.removeClass([this.puzzle.options.classes.slotCorrect, this.puzzle.options.classes.slotIncorrect]);
    }
    /**
     * Init the jquery draggable
     */
    initDraggable() {
        this.pieceEl.draggable({
            start: this.onStart.bind(this),
            //@ts-ignore
            stack: "." + this.puzzle.options.classes.piece,
            //@ts-ignore
            containment: this.puzzle.wrapperEl,
            //@ts-ignore
            /*snap:"."+this.puzzle.options.classes.slot,
            snapMode:"inner",*/
            revert: this.resolveRevert.bind(this)
        });
    }
    /**
     * Init the droppable
     */
    initDroppable() {
        //@ts-ignore
        this.slotEl.on("." + this.puzzle.options.namespace, this.over.bind(this));
        this.slotEl.droppable({
            out: this.out.bind(this),
            drop: this.onDrop.bind(this)
        });
        //@ts-ignore
        if (this.puzzle.options.feedbackOnHover) {
            //@ts-ignore
            this.slotEl.on("dropover." + this.puzzle.options.namespace, this.over.bind(this));
        }
    }
    /**
     * **For internal use only**
     * Enable the drag&drop if the piece has not been completed yet.
     * If the piece is complete the drag&drop will not be enabled
     * To enable the widget use [[SnapPuzzleGame.enable]] instead
     */
    enable() {
        if (!this.completed) {
            this.slotEl.droppable("enable");
            this.pieceEl.draggable("enable");
        }
    }
    /**
     * **For internal use only**
     * Disable drag&drop.
     * To disable the widget use [[SnapPuzzleGame.disable]] instead
     */
    disable() {
        this.slotEl.droppable("disable");
        this.pieceEl.draggable("disable");
    }
}
/**
 * Key to store the instance related to the dom elements using $.data
 */
SnapPuzzlePiece.DATA_KEY = "snapPuzzlePiece";

/**
 * Puzzle game
 */
class SnapPuzzleGame {
    /**
     * Destroy the component
     */
    destroy() {
        this._destroy();
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
        for (let piece of this.pieces) {
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
        for (let piece of this.pieces) {
            //@ts-ignore
            piece.enable();
        }
    }
    /**
     * Refresh the dimensions and positions of the pieces and slots
     */
    refresh() {
        this._resolveDimensions();
        const pieces = this.pieces;
        for (let piece of pieces) {
            piece.refresh();
        }
    }
    /**
     * Solve the puzzle. Multiple options are available
     * @param {boolean | number} resolveAllOrIndex    If is not provided, a random of the pending pieces will be resolved.
     * If true is provided, all the pieces will be resolved. If a number is provided, the piece with that index will be resolved
     */
    solve(resolveAllOrIndex) {
        if (resolveAllOrIndex === true) {
            for (let piece of this.pieces) {
                piece.solve();
            }
        }
        else if (typeof resolveAllOrIndex == "number") {
            let itemToSolve = this.pieces[resolveAllOrIndex];
            if (itemToSolve) {
                itemToSolve.solve();
            }
        }
        else {
            const random = Math.floor(Math.random() * this.pendingPieces.length), itemToSolve = this.pendingPieces[random];
            itemToSolve.solve();
        }
    }
    /**
     * Reset the puzzle reverting the pieces and resetting the progress.
     * @emits [[SnapPuzzleEvents.reset]]
     * @param [trigger=true]   If true, the reset event will be triggered
     */
    reset(trigger = true) {
        this.pendingPieces = this.pieces.concat([]);
        this.wrapperEl.removeClass(this.options.classes.completed);
        this.element.removeClass(this.options.classes.completed);
        let pieces = this.pieces;
        for (let piece of pieces) {
            piece.reset();
        }
        if (trigger) {
            this.element.trigger(SnapPuzzleEvents.reset);
        }
    }
    /**
     * JQuery ui function to get the default options
     * @protected
     */
    _getCreateOptions() {
        let options = {
            columns: 0,
            rows: 0,
            namespace: "jq-snap-puzzle",
            classes: {
                root: "c-snap-puzzle__image",
                wrapper: "c-snap-puzzle",
                completed: "c-snap-puzzle--completed",
                disabled: "c-snap-puzzle--disabled",
                piecesContainer: "c-snap-puzzle__pieces-container",
                slotsContainer: "c-snap-puzzle__slots-container",
                piece: "c-snap-puzzle__piece",
                pieceIncorrect: "c-snap-puzzle__piece--incorrect",
                pieceCorrect: "c-snap-puzzle__piece--correct",
                pieceDisabled: "c-snap-puzzle__piece--disabled",
                slot: "c-snap-puzzle__slot",
                slotHasPiece: "c-snap-puzzle__slot--has-piece",
                slotIncorrect: "c-snap-puzzle__slot--incorrect",
                slotCorrect: "c-snap-puzzle__slot--correct",
                slotDisabled: "c-snap-puzzle__slot--disabled",
                feedbackOnHover: "c-snap-puzzle--feedback-on-hover",
                backgroundInSlots: "c-snap-puzzle--slots-background"
            },
            onlyDropOnValid: false,
            feedbackOnHover: true,
            backgroundInSlots: true,
            randomPieceStartPosition: true
        };
        return options;
    }
    /**
     * Internal destroy.
     * Only destroys the markup and events, the instance of the widget still remains.
     * Used to recreate the widget
     * @protected
     */
    _destroy() {
        $(window).off("." + this.options.namespace);
        this.element.off("." + this.options.namespace);
        this.element.removeClass([this.options.classes.disabled, this.options.classes.root, this.options.classes.completed]);
        this.element.insertAfter(this.wrapperEl);
        this.wrapperEl.remove();
    }
    /**
     * Invoked by jquery widget
     * @param options
     * @protected
     * @see [JQuery ui widget _setOptions](http://api.jqueryui.com/jQuery.widget/#method-_setOptions)
     */
    _setOptions(options) {
        //Refresh the widget
        let refresh = false, 
        //recreate the pieces
        recreatePieces = false, 
        //complete recreate the puzzle
        recreate = false;
        for (let option in options) {
            switch (option) {
                case "namespace":
                case "classes":
                    recreate = true;
                    break;
                case "rows":
                case "columns":
                    recreatePieces = true;
                    break;
                case "onlyDropOnValid":
                case "feedbackOnHover":
                case "backgroundInSlots":
                case "randomPieceStartPosition":
                    refresh = true;
                    break;
            }
        }
        if (recreate) {
            this._destroy();
            //@ts-ignore
            this._super(options);
            this._create();
        }
        else if (recreatePieces) {
            //@ts-ignore
            this._super(options);
            this.pieces = [];
            this.reset(false);
            this._construct();
        }
        else if (refresh) {
            //@ts-ignore
            this._super(options);
            this._applyClassModifiers();
            this.refresh();
        }
    }
    /**
     * Creates the container for pieces
     * @returns {JQuery}
     * @protected
     */
    _createPiecesContainer() {
        let result;
        if ((typeof this.options.createPiecesContainer).toLowerCase() == "function") {
            result = this.options.createPiecesContainer.apply(this, arguments);
        }
        else {
            result = $(`<div class="${this.options.classes.piecesContainer}"></div>`);
        }
        return result;
    }
    /**
     * Creates the container for slots
     * @returns {JQuery}
     * @protected
     */
    _createSlotsContainer() {
        let result;
        if ((typeof this.options.createSlotsContainer).toLowerCase() == "function") {
            result = this.options.createSlotsContainer.apply(this, arguments);
        }
        else {
            result = $(`<div class="${this.options.classes.slotsContainer}"></div>`);
        }
        return result;
    }
    /**
     * Creates the wrapper for the widget
     * @returns {JQuery}
     * @protected
     */
    _createWrapper() {
        let result;
        if ((typeof this.options.createWrapper).toLowerCase() == "function") {
            result = this.options.createWrapper.apply(this, arguments);
        }
        else {
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
    _createPiece(x, y) {
        let result;
        if ((typeof this.options.createPiece).toLowerCase() == "function") {
            result = this.options.createPiece.apply(this, arguments);
        }
        else {
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
    _createSlot(x, y) {
        let result;
        if ((typeof this.options.createSlot).toLowerCase() == "function") {
            result = this.options.createSlot.apply(this, arguments);
        }
        else {
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
    _constructPiece(x, y) {
        let pieceEl = this._createPiece(x, y), slotEl = this._createSlot(x, y).attr("data-x", x).attr("data-y", y), piece = new SnapPuzzlePiece({
            puzzle: this,
            pieceEl: pieceEl,
            slotEl: slotEl,
            x: x,
            y: y
        });
        return piece;
    }
    /**
     * Apply the css classes for options
     * @protected
     */
    _applyClassModifiers() {
        if (this.options.feedbackOnHover) {
            this.wrapperEl.addClass(this.options.classes.feedbackOnHover);
        }
        else {
            this.wrapperEl.removeClass(this.options.classes.feedbackOnHover);
        }
        if (this.options.backgroundInSlots) {
            this.wrapperEl.addClass(this.options.classes.backgroundInSlots);
        }
        else {
            this.wrapperEl.removeClass(this.options.classes.backgroundInSlots);
        }
    }
    /**
     * Creation of the widget
     * @protected
     */
    _create() {
        if (this.element.is("img")) {
            let src = this.element.attr("src");
            this.src = src;
            this.element.addClass(this.options.classes.root);
            this.wrapperEl = this._createWrapper();
            this.wrapperEl.addClass(this.options.classes.wrapper);
            this.piecesContainerEl = this.options.appendPiecesTo != undefined ? $(this.options.appendPiecesTo) : this._createPiecesContainer();
            this.slotsContainerEl = this._createSlotsContainer();
            if (this.options.appendPiecesTo == undefined) {
                this.wrapperEl.append(this.piecesContainerEl);
            }
            this.wrapperEl.append(this.slotsContainerEl);
            this.wrapperEl.insertAfter(this.element);
            this.slotsContainerEl.append(this.element);
            this.pieces = [];
            this.piecesMatrix = [];
            this._resolveDimensions();
            if ((this.imageWidth != Infinity && this.imageWidth != 0) && (this.imageHeight != Infinity && this.imageHeight != 0)) {
                this._construct();
            }
            else {
                this.element.one("load", this._construct.bind(this));
            }
            this.element.off(this.options.namespace).on(SnapPuzzleEvents.pieceDrop + "." + this.options.namespace, this._onPieceDrop.bind(this));
        }
        else {
            throw "[SnapPuzzleGame] The widget must be initialized for <img> elements";
        }
    }
    /**
     * Invoked when the wrapper dimensions changes. Updates the pieces and slots
     */
    _onResize() {
        this.refresh();
    }
    /**
     * Invoked when a piece is dropped inside of the pieces container. Resets the classes
     * @param e
     * @param ui
     */
    _onDrop(e, ui) {
        let snapPiece = ui.draggable.data(SnapPuzzlePiece.DATA_KEY);
        if (snapPiece && snapPiece.pieceDroppedInto) {
            snapPiece.pieceDroppedInto.pieceDropped = null;
            snapPiece.pieceDroppedInto = null;
        }
        ui.draggable.removeClass([this.options.classes.pieceIncorrect, this.options.classes.pieceCorrect]);
    }
    _resolveDimensions() {
        this.imageWidth = (this.element.width() || this.options.width || 0);
        this.imageHeight = (this.element.height() || this.options.height || 0);
        this.pieceWidth = this.imageWidth / this.options.columns;
        this.pieceHeight = this.imageHeight / this.options.rows;
    }
    /**
     * Construct the puzzle
     * @private
     */
    _construct() {
        //wait for image to load
        let rows = this.options.rows, columns = this.options.columns, piecesEls = [], slotsEls = [], numPieces = columns * rows;
        this._resolveDimensions();
        this._applyClassModifiers();
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            let piecesRow = [];
            for (let columIndex = 0; columIndex < columns; columIndex++) {
                let piece = this._constructPiece(columIndex, rowIndex);
                slotsEls.push(piece.slotEl.get(0));
                piecesEls.push(piece.pieceEl.get(0));
                piecesRow.push(piece);
                this.pieces.push(piece);
                piece.slotEl.appendTo(this.slotsContainerEl);
            }
            this.piecesMatrix[rowIndex] = piecesRow;
        }
        if (this.slotsEls) {
            this.slotsEls.remove();
            this.piecesEls.remove();
        }
        this.slotsEls = $(slotsEls);
        this.piecesEls = $(piecesEls);
        this.pendingPieces = this.pieces.concat([]);
        //shuffle
        this.pieces.sort(() => Math.floor(Math.random() * numPieces));
        //append
        for (let piece of this.pieces) {
            piece.pieceEl.appendTo(this.piecesContainerEl);
        }
        this.piecesContainerEl.droppable({
            //@ts-ignore
            accept: "." + this.options.classes.piece,
            drop: this._onDrop.bind(this)
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
    _onPieceDrop(e, data) {
        if (data.isCorrect) {
            const index = this.pendingPieces.indexOf(data.piece);
            if (index != -1) {
                this.pendingPieces.splice(index, 1);
            }
        }
        if (this.pendingPieces.length == 0) {
            this._complete();
        }
    }
    /**
     * Mark the widget as completed
     * Triggers the [[SnapPuzzleEvents.end]] event
     * @private
     */
    _complete() {
        this.wrapperEl.addClass(this.options.classes.completed);
        this.element.addClass(this.options.classes.completed);
        this.element.trigger(SnapPuzzleEvents.complete, this);
    }
    _onNativeResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(this._onResize.bind(this), 200);
    }
    _throttleResize() {
        $(window).off("." + this.options.namespace).on(`resize.${this.options.namespace}`, this._onNativeResize.bind(this));
    }
    ;
}

/**
 * @module jqSnapPuzzle
 */ /** */
//$.widget extends the prototype that receives, to extend the prototype all the properties must be enumerable
//the properties of a es6 class prototype aren't enumerable so it's necessary to get the propertyNames and get the descriptor of each one
if (Object.hasOwnProperty("getOwnPropertyDescriptors")) {
    //@ts-ignore
    let proto = {}, names = Object.getOwnPropertyNames(SnapPuzzleGame.prototype);
    for (let nameIndex = 0, namesLength = names.length; nameIndex < namesLength; nameIndex++) {
        let currentName = names[nameIndex];
        proto[currentName] = Object.getOwnPropertyDescriptor(SnapPuzzleGame.prototype, currentName).value;
    }
    $.widget("ui.snapPuzzle", proto);
}
else {
    $.widget("ui.snapPuzzle", SnapPuzzleGame);
}

/**
 * jqSnapPuzzle module
 *
 * @module jqSnapPuzzle
 * @preferred
 * @example For browser usage, all the members are available using the namespace `jqSnapPuzzle`
 * ```typescript
 * jqSnapPuzzle.SnapPuzzleGame
 * ``` *
 */ /** */

export { SnapPuzzleEvents, SnapPuzzlePiece, SnapPuzzleGame };
