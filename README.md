# jq-snap-puzzle
Extensible puzzle game made with JQuery widget

Based on [jQuery-snapPuzzle](https://github.com/Pixabay/jQuery-snapPuzzle/) of @Pixabay

## Dependencies
- jquery
- jquery ui:
    - jquery ui widget
    - jquery ui draggable
    - jquery ui droppable


## Features
- Typescript sources
- All the css classes are configurable. See [css classes](https://davinchi-finsi.github.io/jq-snap-puzzle/interfaces/jqsnappuzzle.snappuzzleoptions.html#classes)
- Extensible with Widget. See [jquery ui widget docs](http://api.jqueryui.com/jQuery.widget/)
- Define the number of rows and columns
- Possibility to show the target image. [See backgroundInSlots]()
- Possibility to show feedback (correct/incorrect) when the piece is over the slot[See feedbackOnHover]()
- Possibility to allow drop the pieces only in the correct slot[See onlyDropOnValid]()
- Solve a random piece, a specific piece by index or all the pieces moving automatically to the correct slot[See solve]()
- Responsive

## Usage
Install with `npm i jq-snap-puzzle`
or download the [latest release](https://github.com/davinchi-finsi/jq-snap-puzzle/releases)

### Import as module
Typescript:
```typescript
import * as $ from "jquery";
//choose one of the follow options
//for jquery-ui package
import "jq-snap-puzzle/dist/jquery-ui-deps";
//for jquery-ui-dist package
import "jquery-ui-dist/jquery-ui";
import {SnapPuzzleOptions} from "jq-snap-puzzle";
$("someSelector").snapPuzzle(<SnapPuzzleOptions>{
    //options
});
```
Vanilla ES2015
```javascript
import "jq-snap-puzzle";
//choose one of the follow options
//for jquery-ui package
import "jq-snap-puzzle/dist/jquery-ui-deps";
//for jquery-ui-dist package
import "jquery-ui-dist/jquery-ui";
$("someSelector").snapPuzzle({
    //options
});
```
**Please note** that depending of the bundler you are using other configurations may be necessary. For example, shimming JQuery and JQuery UI.
### Traditional way
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Some Title</title>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    </head>
    <body>
        <img src="someImage">
        <script type="text/javascript">
            //jq-snap-puzzle will wait until de image is loaded
            $("img").snapPuzzle({
                columns:4,
                rows:4
            });
        </script>
    </body>
</html>
```
## JQuery ui
JQuery ui could be included in the projects in many different ways and with different packages, instead
of force you to use one, we leave up to you how to include it:

### Modularized
Using `npm i jquery-ui` that install the package allowing to import the widgets you want.

We provided a file with the import of the required dependencies:
```typescript
import "jq-snap-puzzle/dist/jquery-ui-deps";
```

### dist package
In npm is available the package [jquery-ui-dist](https://www.npmjs.com/package/jquery-ui-dist). Recommended if you will use the most of the framework.

### Downloading a custom bundle
Go to the [jquery ui download page](https://jqueryui.com/download) and checks:
- Interaction:
    - Draggable
    - Droppable

or use [this configuration](https://jqueryui.com/download/#!version=1.12.1&components=101000000100110000000000010000000000000000000000)

## Docs
For more info, please check the [docs](https://davinchi-finsi.github.io/jq-snap-puzzle/)

## Playground
[Demo in jsfiddle]()

## Usage
`npm i jq-snap-puzzle`

### Options
Please go to [docs](http://localhost:8180/jq-snap-puzzle/docs/interfaces/jqsnappuzzle.snappuzzlepieceoptions.html)

### Events

| Event name    | Detail           | Emit  |
| ------------- | ---------------- | ----- |
| [snapPuzzle:pieceDrop](http://localhost:8180/jq-snap-puzzle/docs/enums/jqsnappuzzle.snappuzzleevents.html#piecedrop) | Triggered when a piece is dropped in a slot | [SnapPuzzlePieceDropEvent](http://localhost:8180/jq-snap-puzzle/docs/interfaces/jqsnappuzzle.snappuzzlepiecedropevent.html) |
| [snapPuzzle:complete](http://localhost:8180/jq-snap-puzzle/docs/enums/jqsnappuzzle.snappuzzleevents.html#complete) | Triggered when all the pieces of the puzzle are placed correctly. | |
| [snapPuzzle:reset](http://localhost:8180/jq-snap-puzzle/docs/enums/jqsnappuzzle.snappuzzleevents.html#reset) | Triggered when the puzzle is reset. | |
For more info, please go to [docs](http://localhost:8180/jq-snap-puzzle/docs/enums/jqsnappuzzle.snappuzzleevents.html)

### Methods
Available methods to invoke:

| Method        | Short description       |
| ------------- | ----------------------- |
| [destroy](http://localhost:8180/jq-snap-puzzle/docs/classes/jqsnappuzzle.snappuzzlegame.html#destroy)       | Destroy the widget |
| [disable](http://localhost:8180/jq-snap-puzzle/docs/classes/jqsnappuzzle.snappuzzlegame.html#disabled)       | Disable the widget |
| [enable](http://localhost:8180/jq-snap-puzzle/docs/classes/jqsnappuzzle.snappuzzlegame.html#enable)        | Enable the widget |
| [solve](http://localhost:8180/jq-snap-puzzle/docs/classes/jqsnappuzzle.snappuzzlegame.html#solve) | Solve the puzzle. Multiple options are available |
| [refresh](http://localhost:8180/jq-snap-puzzle/docs/classes/jqsnappuzzle.snappuzzlegame.html#refresh) | Refresh the dimensions and positions of the pieces and slots |
| [reset](http://localhost:8180/jq-snap-puzzle/docs/classes/jqsnappuzzle.snappuzzlegame.html#reset) | Reset the puzzle reverting the pieces and resetting the progress |

For more info, please go to [docs](http://localhost:8180/jq-snap-puzzle/docs/enums/jqsnappuzzle.snappuzzlegame.html)
**Please note** that only public methods are available using `$("selector").snapPuzzle("methodName","methodParams");`