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
var shape = platino.createSprite({width:64, height:64});

// color(red, green, blue) takes values from 0 to 1
shape.color(1, 0, 0);

// add your shape to the scene
scene.add(shape);

// add your scene to game view
game.pushScene(scene);

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);
    
    // Start the game
    game.start();
});

var transform = platino.createTransform();

game.addEventListener('touchstart', function(e) {
	shape.clearTransforms();
	shape.x = 0;
	shape.y = 0;
	
	transform.duration = 3000;
	
	// Enable Beizer transformation
	transform.bezier = true;
	
	// Set Bezier control point
	// See also: http://en.wikipedia.org/wiki/B%C3%A9zier_curve
	transform.bezierConfig = {cx1: 50, cy1:-150, cx2: 150, cy2:150};
	
	// Set final destination
	transform.x = game.screen.width  - shape.width;
	transform.y = game.screen.height - shape.height;
	
	shape.transform(transform);
});

// load debug functions
Ti.include("debug.js");

// Add your game view
window.add(game);

var centerLabel = Titanium.UI.createLabel({
    color:'black',
    backgroundColor:'white',
    text:'touch screen to move rectangle',
    font:{fontSize:20,fontFamily:'Helvetica Neue'},
    textAlign:'center',
    width:'auto',
    height:'auto'
});

// add label to the window
window.add(centerLabel);

window.open({fullscreen:true, navBarHidden:true});

