/**
 * @module jqSnapPuzzle
 *//** */
import {SnapPuzzleGame} from "./snap-puzzle-game";
//$.widget extends the prototype that receives, to extend the prototype all the properties must be enumerable
//the properties of a es6 class prototype aren't enumerable so it's necessary to get the propertyNames and get the descriptor of each one
if(Object.hasOwnProperty("getOwnPropertyDescriptors")){
    //@ts-ignore
    let proto = {},
        names = Object.getOwnPropertyNames(SnapPuzzleGame.prototype);
    for (let nameIndex = 0, namesLength = names.length; nameIndex < namesLength; nameIndex++) {
        let currentName = names[nameIndex];
        proto[currentName]=Object.getOwnPropertyDescriptor(SnapPuzzleGame.prototype,currentName).value
    }
    $.widget("ui.snapPuzzle", proto);
}else {
    $.widget("ui.snapPuzzle", SnapPuzzleGame.prototype);
}