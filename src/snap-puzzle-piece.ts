import {SnapPuzzleGame} from "./snap-puzzle-game";

/**
 * Options for SnapPuzzlePiece
 */
export interface SnapPuzzlePieceOptions{
    puzzle?:SnapPuzzleGame;
    pieceEl?:JQuery;
    slotEl?:JQuery;
    x?:number;
    y?:number;
}

/**
 * Represents a piece and the related slot
 */
export class SnapPuzzlePiece{
    /**
     * Puzzle instance for which the piece belongs
     */
    puzzle:SnapPuzzleGame;
    /**
     * Jquery element of the piece
     */
    pieceEl:JQuery;
    /**
     * Native element of the piece
     */
    pieceNativeEl:Element;
    /**
     * Jquery element of the slot
     */
    slotEl:JQuery;
    /**
     * Native element of the slot
     */
    slotNativeEl:Element;
    /**
     * Piece dropped in the slot of this piece
     */
    pieceDropped:SnapPuzzlePiece;
    /**
     * Slot in which this piece has been dropped
     */
    pieceDroppedInto:SnapPuzzlePiece;
    /**
     * X position
     */
    x:number;
    /**
     * Y position
     */
    y:number;
    readonly dataKey:string = "snapPuzzleSlot";
    constructor(params:SnapPuzzlePieceOptions){
        if(params.puzzle != undefined){
            this.puzzle = params.puzzle;
        }
        if(params.pieceEl != undefined){
            this.pieceEl = params.pieceEl;
            this.pieceNativeEl = this.pieceEl.get(0);
        }
        if(params.slotEl != undefined){
            this.slotEl = params.slotEl;
        }
        if(params.x != undefined){
            this.x = params.x;
        }
        if(params.y != undefined){
            this.y = params.y;
        }
        this.slotEl.data(this.dataKey,this);
        this.pieceEl.data(this.dataKey,this);
        this.refresh();
        this.initDraggable();
        this.initDroppable();
    }

    /**
     * Refresh the images
     */
    refresh(){
        this.pieceEl.css({
            //@ts-ignore
            width: this.puzzle.pieceWidth,
            //@ts-ignore
            height: this.puzzle.pieceHeight,
            //@ts-ignore
            backgroundImage: 'url('+this.puzzle.src+')',
            //@ts-ignore
            backgroundPosition: (-this.x * this.puzzle.pieceWidth) + 'px '+(-this.y*this.puzzle.pieceHeight) + 'px',
            //@ts-ignore
            backgroundSize: this.puzzle.imageWidth+'px '+this.puzzle.imageHeight+'px'
        });
        this.slotEl.css({
            //@ts-ignore
            width: this.puzzle.pieceWidth,
            //@ts-ignore
            height: this.puzzle.pieceHeight
        });
        //@ts-ignore
        if(this.puzzle.options.backgroundInSlots){
            this.slotEl.css({
                //@ts-ignore
                backgroundImage: 'url('+this.puzzle.src+')',
                //@ts-ignore
                backgroundPosition: (-this.x * this.puzzle.pieceWidth) + 'px '+(-this.y*this.puzzle.pieceHeight) + 'px',
                //@ts-ignore
                backgroundSize: this.puzzle.imageWidth+'px '+this.puzzle.imageHeight+'px'
            });
        }
        //@ts-ignore
        if(this.puzzle.options.randomPieceStartPosition && this.pieceDroppedInto == undefined){
            this.pieceEl.css({
                //@ts-ignore
                left: Math.floor((Math.random() * ((this.puzzle.piecesContainerEl.width()-this.pieceEl.width()) + 1))),
                //@ts-ignore
                top:  Math.floor((Math.random() * ((this.puzzle.piecesContainerEl.height()-this.pieceEl.height()) + 1)))
            });
        }else if(this.pieceDroppedInto != undefined){
            this.pieceEl.position({my: "left top", at: "left top", of: this.pieceDroppedInto.slotEl,collision:"none"});
        }
    }

    /**
     * Invoked when a piece is dropped in this slot
     * @param e
     * @param ui
     */
    protected onDrop(e,ui){
        let item = ui.draggable,
            itemNativeEl = item.get(0);
        //if any piece has been dropped in the slot or the piece dropped is the current one) and (if the "onlyDropOnValid" is false or the piece dropped is the correct one
        //a piece could not be dropped in a slot that already has a piece
        //an incorrect piece could not be dropped in a slot if the option "onlyDropOnValid" is true
        //@ts-ignore
        if ((this.pieceDropped == undefined || this.pieceDropped.pieceNativeEl == itemNativeEl) && (this.puzzle.options.onlyDropOnValid == false || itemNativeEl != this.pieceNativeEl)) {
            const piece:SnapPuzzlePiece = item.data(this.dataKey);
            //reset the pieceDropped of the previous slot
            if(piece.pieceDroppedInto) {
                piece.pieceDroppedInto.pieceDropped = null;
            }
            //store for the piece where has been dropped
            piece.pieceDroppedInto = this;
            //store the piece dropped in this slot
            this.pieceDropped = piece;
            //if the piece is correct
            if (itemNativeEl == this.pieceNativeEl) {
                //@ts-ignore
                item.removeClass(this.puzzle.options.classes.pieceIncorrect).addClass(this.puzzle.options.classes.pieceCorrect);
                //@ts-ignore
                this.slotEl.removeClass(this.puzzle.options.classes.slotIncorrect).addClass(this.puzzle.options.classes.slotCorrect);
                this.slotEl.droppable("disable");
                item.draggable("disable");
            } else {
                //@ts-ignore
                item.removeClass(this.puzzle.options.classes.pieceCorrect).addClass(this.puzzle.options.classes.pieceIncorrect);
                //@ts-ignore
                this.slotEl.removeClass(this.puzzle.options.classes.slotCorrect).addClass(this.puzzle.options.classes.slotIncorrect);
            }
            //force the position of the piece to the slot because the piece could be dropped with a tolerance margin (not exactly in the bounds of the slot)
            item.position({my: "left top", at: "left top", of: this.slotEl,collision:"none"});
        }
    }

    /**
     * Resolve if the dropped piece must be revertd
     * @param target
     * @returns {boolean}
     */
    protected resolveRevert(target){
        let allow:boolean = false;
        //if the target is an element. when the target is invalid is a false
        if(target) {
            let data:SnapPuzzlePiece = target.data(this.dataKey);
            //check if there is a piece dropped
            if(data == undefined || data.pieceDropped == undefined  || data.pieceDropped.pieceNativeEl == this.pieceNativeEl) {
                //@ts-ignore
                if (target.hasClass(this.puzzle.options.classes.slot)) {
                    //if the onlyDropOnValid is true, the piece must be te correct one
                    //@ts-ignore
                    allow = this.puzzle.options.onlyDropOnValid == false || target.get(0) == this.slotNativeEl;
                //@ts-ignore
                } else if (target.is(this.puzzle.piecesContainerEl)) {
                    //if the target is the pieces container, check if the piece has been dropped inside
                    let itemRect: DOMRect = <DOMRect>this.pieceEl.get(0).getBoundingClientRect(),
                        targetRect: DOMRect = <DOMRect>target.get(0).getBoundingClientRect();
                    allow = (itemRect.left >= targetRect.left && itemRect.right <= targetRect.right) && (itemRect.top >= targetRect.top && itemRect.bottom <= targetRect.bottom);
                }
            }
        }
        if(!allow) {
            this.onRevert(target);
        }
        return !allow;
    }

    /**
     * Invoked when a piece is reverted. Reset classes
     * @param {JQuery} slot
     */
    protected onRevert(slot:JQuery){
        //@ts-ignore
        this.pieceEl.removeClass([this.puzzle.options.classes.pieceIncorrect,this.puzzle.options.classes.pieceCorrect]);
        //@ts-ignore
        slot.removeClass([this.puzzle.options.classes.pieceIncorrect,this.puzzle.options.classes.pieceCorrect]);
    }

    /**
     * Invoked when a piece starts to been dragged. Resets the classes
     * @param e
     * @param ui
     */
    protected onStart(e,ui){
        //@ts-ignore
        this.pieceEl.removeClass([this.puzzle.options.classes.pieceIncorrect,this.puzzle.options.classes.pieceCorrect]);
    }

    /**
     * Invoked when the piece is over a slot. Add the correct/incorrect classes
     * This function is invoked only when the feedbackOnHover option is true
     * @param e
     * @param ui
     */
    protected over(e,ui){
        const item = ui.draggable,
            itemNativeEl = item.get(0);
        //@ts-ignore
        if(this.pieceDropped == undefined || this.pieceDropped.pieceNativeEl == itemNativeEl) {
            //@ts-ignore
            if (itemNativeEl == this.pieceNativeEl) {
                //@ts-ignore
                item.removeClass(this.puzzle.options.classes.pieceIncorrect).addClass(this.puzzle.options.classes.pieceCorrect);
                //@ts-ignore
                this.slotEl.removeClass(this.puzzle.options.classes.slotIncorrect).addClass(this.puzzle.options.classes.slotCorrect);
            } else {
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
    protected out(e,ui){
        //@ts-ignore
        this.slotEl.removeClass([this.puzzle.options.classes.slotCorrect,this.puzzle.options.classes.slotIncorrect]);
    }
    /**
     * Init the jquery draggable
     */
    protected initDraggable(){
        if(this.pieceEl.data("uiDraggable")) {
            this.pieceEl.draggable("destroy");
        }
        this.pieceEl.draggable({
            start:this.onStart.bind(this),
            //@ts-ignore
            stack: "."+this.puzzle.options.classes.piece,
            //@ts-ignore
            containment: this.puzzle.wrapperEl,
            //@ts-ignore
            snap:"."+this.puzzle.options.classes.slot,
            snapMode:"inner",
            revert:this.resolveRevert.bind(this),
            refreshPositions:true
        });
    }

    /**
     * Init the droppable
     */
    protected initDroppable(){
        if(this.slotEl.data("uiDroppable")) {
            this.slotEl.droppable("destroy");
            //@ts-ignore
            this.slotEl.on("."+this.puzzle.options.namespace, this.over.bind(this));
        }
        this.slotEl.droppable({
            out:this.out.bind(this),
            drop: this.onDrop.bind(this)
        });
        //@ts-ignore
        if(this.puzzle.options.feedbackOnHover) {
            //@ts-ignore
            this.slotEl.on("dropover."+this.puzzle.options.namespace, this.over.bind(this));
        }
    }
}