var window = Ti.UI.createWindow({backgroundColor:'black'});

// Obtain game module
var platino = require('co.lanica.platino');

// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to black
game.color(0, 0, 0);

game.debug = true;

// Create game scene
var scene = platino.createScene();

// create new 64x64 shape
var shape = platino.createSprite({width:64, height:32});
var child1 = platino.createSprite({width:32, height:16});
var child2 = platino.createSprite({width:32, height:16});
var child3 = platino.createSprite({width:32, height:16});
var child4 = platino.createSprite({width:32, height:16});
var child5 = platino.createSprite({width:32, height:16});

var grandChild1 = platino.createSprite({width:16, height: 8});
var grandChild2 = platino.createSprite({width:16, height: 8});
var grandChild3 = platino.createSprite({width:16, height: 8});
var grandChild4 = platino.createSprite({width:16, height: 8});
var grandChild5 = platino.createSprite({width:16, height: 8});

// color(red, green, blue) takes values from 0 to 1
shape.color(1, 0, 0);

child1.color(0, 1, 0);
child2.color(0, 0, 1);
child3.color(1, 1, 0);
child4.color(0, 1, 1);
child5.color(1, 0, 1);

grandChild1.color(1, 1, 1);
grandChild2.color(0, 0, 0.5);
grandChild3.color(0.5, 0.5, 0);
grandChild4.color(0, 0.5, 0.5);
grandChild5.color(0.5, 0, 0.5);

shape.addChildNode(child1);
shape.addChildNode(child2);
shape.addChildNode(child3);
shape.addChildNode(child4);
shape.addChildNode(child5);

child1.addChildNode(grandChild1);
child1.addChildNode(grandChild2);
child1.addChildNode(grandChild3);
child1.addChildNode(grandChild4);
child1.addChildNode(grandChild5);

// add your shape to the scene
scene.add(shape);
// add your scene to game view
game.pushScene(scene);

var transform = platino.createTransform();

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    shape.center = {x: game.screen.width * 0.5, y:game.screen.height * 0.5};

    //
    // Child node should have relative position against parent sprite
    //

    child1.center = {x:shape.width * 0.5, y:shape.height * 0.5}; // Center of parent
    child2.center = {x:0, y:0};            // Top-Left corner
    child3.center = {x:shape.width, y:0};  // Top-Right corner
    child4.center = {x:0, y:shape.height}; // Bottom-Left corner
    child5.center = {x:shape.width, y:shape.height}; // Bottom-Right corner

    grandChild1.center = {x: child1.width * 0.5, y:child1.height * 0.5}; // Center of parent
    grandChild2.center = {x: 0, y:0};             // Top-Left corner
    grandChild3.center = {x: child1.width, y:0};  // Top-Right corner
    grandChild4.center = {x: 0, y:child1.height}; // Bottom-Left coener
    grandChild5.center = {x: child1.width, y:child1.height}; // Bottom-Right corner

    // determine if child follows parent color (default=false)
    // child1.followParentColor = true;

    // determine if child follows parent alpha (default=true)
    child1.followParentAlpha = false;

    transform.duration = 5000;
    transform.rotate(shape.angle + 360);
    transform.repeat = -1; // infinite loop when repeat equals sub zero
    transform.autoreverse = true;
    transform.move(0, 0);
    transform.alpha = 0;

    // Transform parent sprite, all children should follow this
    shape.transform(transform);
        
    // Start the game
    game.start();
});

// Add your game view
window.add(game);

window.open({fullscreen:true, navBarHidden:true});
