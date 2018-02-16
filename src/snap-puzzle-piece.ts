import {SnapPuzzleGame} from "./snap-puzzle-game";
import {
    SnapPuzzleEvents,
    SnapPuzzlePieceDropEvent
} from "./snap-puzzle-events";

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
 * Represents a piece and the related slot.
 * **Note:** When a piece is dropped in the correct slot, the piece is automatically disabled
 */
export class SnapPuzzlePiece{
    /**
     * Key to store the instance related to the dom elements using $.data
     */
    public static DATA_KEY:string = "snapPuzzlePiece";
    /**
     * Jquery element of the piece
     */
    pieceEl:JQuery;
    /**
     * Jquery element of the slot
     */
    slotEl:JQuery;
    /**
     * X position
     */
    x:number;
    /**
     * Y position
     */
    y:number;
    /**
     * Piece dropped in the slot of this piece
     */
    pieceDropped:SnapPuzzlePiece;
    /**
     * Slot in which this piece has been dropped
     */
    pieceDroppedInto:SnapPuzzlePiece;
    /**
     * Puzzle instance for which the piece belongs
     */
    protected puzzle:SnapPuzzleGame;

    /**
     * Native element of the piece
     */
    protected pieceNativeEl:Element;
    /**
     * Native element of the slot
     */
    protected slotNativeEl:Element;

    /**
     * The piece is completed
     */
    protected completed:boolean = false;
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
            this.slotNativeEl = this.slotEl.get(0);
        }
        if(params.x != undefined){
            this.x = params.x;
        }
        if(params.y != undefined){
            this.y = params.y;
        }
        this.slotEl.data(SnapPuzzlePiece.DATA_KEY,this);
        this.pieceEl.data(SnapPuzzlePiece.DATA_KEY,this);
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
            height: this.puzzle.pieceHeight,
           //@ts-ignore
            top:this.y*this.puzzle.pieceHeight,
            //@ts-ignore
            left:this.x*this.puzzle.pieceWidth
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
        }else{
            this.slotEl.css({
                //@ts-ignore
                backgroundImage: '',
                //@ts-ignore
                backgroundPosition: '',
                //@ts-ignore
                backgroundSize: ''
            });
        }
        if(this.pieceDroppedInto == undefined){
            //@ts-ignore
            if(this.puzzle.options.randomPieceStartPosition) {
                this.pieceEl.css({
                    //@ts-ignore
                    left: Math.floor((Math.random() * ((this.puzzle.piecesContainerEl.width() - this.pieceEl.width()) + 1))),
                    //@ts-ignore
                    top: Math.floor((Math.random() * ((this.puzzle.piecesContainerEl.height() - this.pieceEl.height()) + 1)))
                });
            }else{
                this.pieceEl.css({
                    left:"",
                    top:""
                });
            }
        }else if(this.pieceDropped != undefined){
            this.pieceDropped.pieceEl.position({my: "left top", at: "left top", of: this.slotEl,collision:"none"});
        }
    }

    /**
     * Reset the piece to the initial state. Remove the piece from the slot
     */
    reset(){
        this.completed = false;
        this.pieceDropped = null;
        this.pieceDroppedInto = null;
        this.refresh();
        //@ts-ignore
        if(!this.puzzle.options.disabled){
            this.enable();
        }
    }

    /**
     * Solve the piece moving it to the correct slot
     * @param [triggerEvent] If false, the event pieceDrop will not be triggered
     */
    solve(triggerEvent:boolean=true){
        if(!this.completed){
            //set the position of the piece
            this.pieceEl.position({
                my: "left top",
                at: "left top",
                of: this.slotEl,
                collision: "none",
                using: (position,data) => {
                    //simulate dragging styles
                    this.pieceEl.addClass("ui-draggable-dragging");
                    //calculate the distance, the duration of the animation will be related to the distance
                    let offsetElement = data.element.element.offset(),
                        offsetTarget = data.target.element.offset(),
                        distance = Math.sqrt(Math.pow(offsetTarget.left - offsetElement.left,2)+ Math.pow(offsetTarget.top - offsetElement.top,2));
                    this.pieceEl.animate({
                        top:position.top,
                        left:position.left
                    },Math.min(2000,distance*2),()=>{
                        this.pieceEl.removeClass("ui-draggable-dragging");
                        //call the drop
                        this.onDrop({},{
                            draggable:this.pieceEl
                        },triggerEvent);
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
    protected onDrop(e,ui,triggerEvent=true){
        let item = ui.draggable,
            itemNativeEl = item.get(0);
        //if any piece has been dropped in the slot or the piece dropped is the current one) and (if the "onlyDropOnValid" is false or the piece dropped is the correct one
        //a piece could not be dropped in a slot that already has a piece
        //an incorrect piece could not be dropped in a slot if the option "onlyDropOnValid" is true
        //@ts-ignore
        if ((this.pieceDropped == undefined || this.pieceDropped.pieceNativeEl == itemNativeEl) && (this.puzzle.options.onlyDropOnValid == false || itemNativeEl == this.pieceNativeEl)) {
            const piece:SnapPuzzlePiece = item.data(SnapPuzzlePiece.DATA_KEY);
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
                this.completed = true;
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
            item.position({
                my: "left top",
                at: "left top",
                of: this.slotEl,
                collision: "none",
                using: (position) => {
                    item.animate({
                        top:position.top,
                        left:position.left
                    },200)
                }
            });
            if(triggerEvent) {
                //@ts-ignore
                this.puzzle.element.trigger(SnapPuzzleEvents.pieceDrop, <SnapPuzzlePieceDropEvent>{
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
    protected resolveRevert(target){
        let allow:boolean = false;
        //if the target is an element. when the target is invalid is a false
        if(target) {
            let data:SnapPuzzlePiece = target.data(SnapPuzzlePiece.DATA_KEY);
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
     * Invoked when a piece is reverted.
     * Revert the state classes
     * @param {JQuery} slot
     */
    protected onRevert(slot:JQuery){
        let classToAdd:string,
            classToRemove:string;
        if(this.completed){
            //@ts-ignore
            classToRemove = this.puzzle.options.classes.pieceIncorrect;
            //@ts-ignore
            classToAdd = this.puzzle.options.classes.pieceCorrect;
        }else if(this.pieceDroppedInto){
            //@ts-ignore
            classToAdd = this.puzzle.options.classes.pieceIncorrect;
            //@ts-ignore
            classToRemove = this.puzzle.options.classes.pieceCorrect;
        }else{
            //@ts-ignore
            classToRemove = [this.puzzle.options.classes.pieceIncorrect,this.puzzle.options.classes.pieceCorrect];
        }
        this.pieceEl.removeClass(classToRemove).addClass(classToAdd);
        if(slot){
            let slotPiece = slot.data(SnapPuzzlePiece.DATA_KEY),
                classToAddToSlot:string,
                classToRemoveFromSlot:string;
            if(slotPiece){
                if(slotPiece.completed){
                    //@ts-ignore
                    classToRemoveFromSlot = this.puzzle.options.classes.pieceIncorrect;
                    //@ts-ignore
                    classToAddToSlot = this.puzzle.options.classes.pieceCorrect;
                }else if(slotPiece.pieceDropped){
                    //@ts-ignore
                    classToAddToSlot = this.puzzle.options.classes.pieceIncorrect;
                    //@ts-ignore
                    classToRemoveFromSlot = this.puzzle.options.classes.pieceCorrect;
                }else{
                    //@ts-ignore
                    classToRemoveFromSlot = [this.puzzle.options.classes.pieceIncorrect,this.puzzle.options.classes.pieceCorrect];
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

        this.pieceEl.draggable({
            start:this.onStart.bind(this),
            //@ts-ignore
            stack: "."+this.puzzle.options.classes.piece,
            //@ts-ignore
            containment: this.puzzle.wrapperEl,
            //@ts-ignore
            /*snap:"."+this.puzzle.options.classes.slot,
            snapMode:"inner",*/
            revert:this.resolveRevert.bind(this)
        });
    }

    /**
     * Init the droppable
     */
    protected initDroppable(){
        //@ts-ignore
        this.slotEl.on("."+this.puzzle.options.namespace, this.over.bind(this));
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
    /**
     * **For internal use only**
     * Enable the drag&drop if the piece has not been completed yet.
     * If the piece is complete the drag&drop will not be enabled
     * To enable the widget use [[SnapPuzzleGame.enable]] instead
     */
    protected enable(){
        if(!this.completed) {
            this.slotEl.droppable("enable");
            this.pieceEl.draggable("enable");
        }
    }

    /**
     * **For internal use only**
     * Disable drag&drop.
     * To disable the widget use [[SnapPuzzleGame.disable]] instead
     */
    protected disable(){
        this.slotEl.droppable("disable");
        this.pieceEl.draggable("disable");
    }
}