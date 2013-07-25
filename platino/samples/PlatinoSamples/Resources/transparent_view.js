var window = Ti.UI.createWindow({backgroundColor:'white'});

// Obtain game module
var platino = require('co.lanica.platino');

// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// Set initial background color to white with transparent color
// It is important to set same color with parent window or view initially
// because screen might flash up at startup if we set different color
game.color(1, 1, 1);

game.debug = true;
// Set game background to transparent
game.opaque = false;

var centerLabel = Titanium.UI.createLabel({
    color:'black',
    backgroundColor:'white',
    text:'Game view can be overwrapped on Titanium view',
    font:{fontSize:20,fontFamily:'Helvetica Neue'},
    textAlign:'center',
    width:'auto',
    height:'auto'
});

// add label to the window
window.add(centerLabel);

// Create game scene
var scene = platino.createScene();

// Set our scene color to transparent
scene.alpha = 0;

// create new 64x64 shape
var shape = platino.createSprite({width:64, height:32});
var child1 = platino.createSprite({width:32, height:16});
var child2 = platino.createSprite({width:32, height:16});
var child3 = platino.createSprite({width:32, height:16});
var child4 = platino.createSprite({width:32, height:16});
var child5 = platino.createSprite({width:32, height:16});

// color(red, green, blue) takes values from 0 to 1
shape.color(1, 0, 0);
child1.color(0, 1, 0);
child2.color(0, 0, 1);
child3.color(1, 1, 0);
child4.color(0, 1, 1);
child5.color(1, 0, 1);

// Add child sprites to parent
shape.addChildNode(child1);
shape.addChildNode(child2);
shape.addChildNode(child3);
shape.addChildNode(child4);
shape.addChildNode(child5);

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

    // determine if child follows parent color (default=false)
    // child1.followParentColor = true;

    // determine if child follows parent alpha (default=true)
    //child1.followParentAlpha = false;

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
